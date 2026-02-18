import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useGelatoSmartWalletDynamicContext, GelatoSmartWalletDynamicConnectButton } from '@gelatonetwork/smartwallet-react-dynamic';
import { sponsored } from '@gelatonetwork/smartwallet';
import { encodeFunctionData } from 'viem';
import { Arena } from './Arena';
import { Leaderboard } from './Leaderboard';
import { Stats } from './Stats';
import { TXCounter } from './TXCounter';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const HALF_ARENA = 32;
const ARENA_RADIUS_SQ = 32 * 32; // circle: x^2 + y^2 <= this
const START_SIZE = 1000;
const MAX_SIZE = 10000000;
const TOPPING_COUNT = 20;
const GAME_DURATION_SEC = 30;

// Deterministic "random" positions for toppings (contract-like)
function pseudoRandom(seed: number): number {
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return Math.abs(h);
}
function randomPos(seedX: number, seedY: number): [number, number] {
  const x = (pseudoRandom(seedX) % 64) - 32;
  const y = (pseudoRandom(seedY) % 64) - 32;
  return [x, y];
}
function insideCircle(x: number, y: number): boolean {
  return x * x + y * y <= ARENA_RADIUS_SQ;
}
function randomPosInCircle(seedX: number, seedY: number): [number, number] {
  let [x, y] = randomPos(seedX, seedY);
  if (!insideCircle(x, y)) {
    const scale = 30 / Math.sqrt(x * x + y * y);
    x = Math.round(x * scale);
    y = Math.round(y * scale);
  }
  return [x, y];
}

type LeaderboardEntry = { address: string; size: number; eats: number };

export function Game() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { gelato } = useGelatoSmartWalletDynamicContext();
  const movePendingRef = useRef(false);
  const playerSliceRef = useRef<any>(null);
  const toppingsRef = useRef<any[]>([]);

  const [playerSlice, setPlayerSlice] = useState<any>(null);
  const [allSlices, setAllSlices] = useState<Map<string, any>>(new Map());
  const [toppings, setToppings] = useState<any[]>([]);

  useEffect(() => { playerSliceRef.current = playerSlice; }, [playerSlice]);
  useEffect(() => { toppingsRef.current = toppings; }, [toppings]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [lastBlockTxCount, setLastBlockTxCount] = useState(0);
  const [blockNumber, setBlockNumber] = useState(0n);
  const [lastMoveDir, setLastMoveDir] = useState({ dx: 1, dy: 0 });
  const [spawnError, setSpawnError] = useState<string | null>(null);
  const [relayerAddress, setRelayerAddress] = useState<string | null>(null);
  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_DURATION_SEC);
  const [gameOver, setGameOver] = useState(false);
  const gameStartedRef = useRef(false);

  const pollStateRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const effectiveAddress = BACKEND_URL ? (relayerAddress || address) : address;

  // Fetch relayer address when using backend
  useEffect(() => {
    if (!BACKEND_URL) return;
    fetch(`${BACKEND_URL}/api/relayer-address`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data?.address && setRelayerAddress(data.address))
      .catch(() => {});
  }, []);

  // 30-second game timer - starts when player has spawned
  useEffect(() => {
    if (gameOver) return;
    const hasSpawned = playerSlice?.size > 0;
    if (!hasSpawned) return;
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      setGameTimeLeft(GAME_DURATION_SEC);
    }
    const t = setInterval(() => {
      setGameTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          pollStateRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playerSlice?.size, gameOver, DEMO_MODE]);

  // Demo mode: init mock toppings once - inside circle so reachable
  useEffect(() => {
    if (!DEMO_MODE) return;
    const tops = Array.from({ length: TOPPING_COUNT }, (_, i) => {
      const [x, y] = randomPosInCircle((i + 1) * 7, (i + 1) * 13);
      return { x, y, toppingId: i % 4, eatenAt: 0 };
    });
    setToppings(tops);
  }, []);

  // Poll blockchain state (disabled in demo mode)
  useEffect(() => {
    const hasPlayer = BACKEND_URL ? relayerAddress : (isConnected && address);
    if (DEMO_MODE || !publicClient || !hasPlayer || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return;

    const pollAddr = BACKEND_URL ? relayerAddress! : address!;
    const POLL_MS = 10000;
    const LEADERBOARD_MS = 60000;
    let leaderboardTick = 2;

    const pollCore = async () => {
      try {
        if (pollAddr) {
          const slice = (await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getSlice',
            args: [pollAddr],
          })) as any;
          setPlayerSlice({ ...slice, address: pollAddr });
          setAllSlices(prev => {
            const newMap = new Map(prev);
            newMap.set(pollAddr.toLowerCase(), { x: Number(slice.x), y: Number(slice.y), size: Number(slice.size) });
            return newMap;
          });
        }

        const TOPPING_COUNT = 20;
        const toppingResults: any[] = [];
        for (let batch = 0; batch < TOPPING_COUNT; batch += 5) {
          const batchResults = await Promise.all(
            Array.from({ length: Math.min(5, TOPPING_COUNT - batch) }, (_, i) =>
              publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getTopping',
                args: [BigInt(batch + i + 1)],
              })
            )
          );
          toppingResults.push(...batchResults);
          if (batch + 5 < TOPPING_COUNT) await new Promise(r => setTimeout(r, 300));
        }
        setToppings(toppingResults.map((t: any) => ({
          x: Number(t.x),
          y: Number(t.y),
          toppingId: Number(t.toppingId),
          eatenAt: Number(t.eatenAt),
        })));

        const block = await publicClient.getBlockNumber();
        setBlockNumber(block);
      } catch (error) {
        console.error('Error polling state:', error);
      }
    };

    const pollLeaderboard = async () => {
      try {
        const lb = (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getLeaderboard',
        })) as string[];
        const addrs = lb.filter(addr => addr !== '0x0000000000000000000000000000000000000000');
        const lbData: { address: string; size: number; eats: number }[] = [];
        for (let i = 0; i < addrs.length; i += 3) {
          const batch = addrs.slice(i, i + 3);
          const results = await Promise.all(
            batch.map(async (addr) => {
              const slice = (await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'getSlice',
                args: [addr],
              })) as any;
              return { address: addr, size: Number(slice.size), eats: Number(slice.eats) };
            })
          );
          lbData.push(...results);
          if (i + 3 < addrs.length) await new Promise(r => setTimeout(r, 200));
        }
        setLeaderboard(lbData.sort((a, b) => b.size - a.size));
      } catch (error) {
        console.error('Error polling leaderboard:', error);
      }
    };

    const pollState = async () => {
      await pollCore();
      leaderboardTick++;
      if (leaderboardTick >= Math.ceil(LEADERBOARD_MS / POLL_MS)) {
        leaderboardTick = 0;
        await pollLeaderboard();
      }
    };

    pollStateRef.current = pollState;
    pollState();
    const interval = setInterval(pollState, POLL_MS);

    return () => clearInterval(interval);
  }, [publicClient, isConnected, address, BACKEND_URL, relayerAddress]);

  // Listen for events (disabled in demo mode)
  useEffect(() => {
    if (DEMO_MODE || !publicClient || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return;

    const unwatch = publicClient.watchEvent({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'SliceMoved',
        inputs: [
          { type: 'address', indexed: true, name: 'player' },
          { type: 'int8', indexed: false, name: 'x' },
          { type: 'int8', indexed: false, name: 'y' },
          { type: 'uint24', indexed: false, name: 'size' },
        ],
      },
      onLogs: (logs) => {
        setLastBlockTxCount(logs.length);
        logs.forEach((log: any) => {
          if (log.args?.player) {
            setAllSlices(prev => {
              const newMap = new Map(prev);
              newMap.set(log.args.player.toLowerCase(), {
                x: Number(log.args.x),
                y: Number(log.args.y),
                size: Number(log.args.size),
              });
              return newMap;
            });
          }
        });
      },
    });

    return () => {
      try { unwatch(); } catch (e) {}
    };
  }, [publicClient]);

  // Apply move optimistically (position + topping logic) - used for instant UI
  const applyOptimisticMove = useCallback((dx: number, dy: number, addr: string) => {
    const prev = playerSliceRef.current;
    let slice = prev;
    if (!slice || slice.size === 0) {
      const [x, y] = randomPosInCircle(addr.charCodeAt(0), addr.charCodeAt(1));
      slice = { size: START_SIZE, x, y, respawn: 0, eats: 0, toppingEats: 0, address: addr };
    }
    const newX = slice.x + dx;
    const newY = slice.y + dy;
    if (newX < -HALF_ARENA || newX >= HALF_ARENA || newY < -HALF_ARENA || newY >= HALF_ARENA) return;
    if (!insideCircle(newX, newY)) return;

    const posX = Math.round(Number(newX));
    const posY = Math.round(Number(newY));
    const currentToppings = toppingsRef.current;
    let totalGrowth = 0;
    let eatenCount = 0;
    const nextToppings = currentToppings.map((t: any) => {
      const tx = Math.round(Number(t.x));
      const ty = Math.round(Number(t.y));
      const dist = Math.max(Math.abs(tx - posX), Math.abs(ty - posY));
      if (t.eatenAt === 0 && dist <= 2) {
        totalGrowth += 200 + ((t.toppingId % 4) * 100);
        eatenCount++;
        return { ...t, eatenAt: 1 };
      }
      return t;
    });

    const newSize = Math.min((slice.size || START_SIZE) + totalGrowth, MAX_SIZE);
    const nextPlayer = { ...slice, x: newX, y: newY, size: newSize, toppingEats: (slice.toppingEats || 0) + eatenCount };
    playerSliceRef.current = nextPlayer;
    toppingsRef.current = nextToppings;
    setPlayerSlice(nextPlayer);
    setToppings(nextToppings);
    setAllSlices(prevMap => {
      const m = new Map(prevMap);
      m.set(addr.toLowerCase(), { x: nextPlayer.x, y: nextPlayer.y, size: nextPlayer.size });
      return m;
    });
    setLeaderboard(lb => {
      const entry = { address: addr, size: nextPlayer.size, eats: nextPlayer.eats || 0 };
      const filtered = lb.filter((e: LeaderboardEntry) => e.address.toLowerCase() !== addr.toLowerCase());
      return [...filtered, entry].sort((a, b) => b.size - a.size).slice(0, 5);
    });
  }, []);

  // Local move logic (demo mode) - mirrors contract rules, no RPC
  const sendMoveLocal = useCallback((dx: number, dy: number) => {
    const addr = address || '0xDemo0000000000000000000000000000000001';
    const prev = playerSliceRef.current;
    let slice = prev;
    if (!slice || slice.size === 0) {
      const [x, y] = randomPosInCircle(addr.charCodeAt(0), addr.charCodeAt(1));
      slice = { size: START_SIZE, x, y, respawn: 0, eats: 0, toppingEats: 0, address: addr };
    }
    const newX = slice.x + dx;
    const newY = slice.y + dy;
    if (newX < -HALF_ARENA || newX >= HALF_ARENA || newY < -HALF_ARENA || newY >= HALF_ARENA) return;
    if (!insideCircle(newX, newY)) return;

    const posX = Math.round(Number(newX));
    const posY = Math.round(Number(newY));
    const currentToppings = toppingsRef.current;
    let totalGrowth = 0;
    let eatenCount = 0;
    const nextToppings = currentToppings.map((t) => {
      const tx = Math.round(Number(t.x));
      const ty = Math.round(Number(t.y));
      const dist = Math.max(Math.abs(tx - posX), Math.abs(ty - posY));
      if (t.eatenAt === 0 && dist <= 2) {
        totalGrowth += 200 + ((t.toppingId % 4) * 100);
        eatenCount++;
        return { ...t, eatenAt: 1 };
      }
      return t;
    });

    const newSize = Math.min((slice.size || START_SIZE) + totalGrowth, MAX_SIZE);
    const nextPlayer = {
      ...slice,
      x: newX,
      y: newY,
      size: newSize,
      toppingEats: (slice.toppingEats || 0) + eatenCount,
    };

    playerSliceRef.current = nextPlayer;
    toppingsRef.current = nextToppings;
    setPlayerSlice(nextPlayer);
    setToppings(nextToppings);
    setAllSlices(prevMap => {
      const m = new Map(prevMap);
      m.set(addr.toLowerCase(), { x: nextPlayer.x, y: nextPlayer.y, size: nextPlayer.size });
      return m;
    });
    setLeaderboard(lb => {
      const entry = { address: addr, size: nextPlayer.size, eats: nextPlayer.eats || 0 };
      const filtered = lb.filter(e => e.address.toLowerCase() !== addr.toLowerCase());
      return [...filtered, entry].sort((a, b) => b.size - a.size).slice(0, 5);
    });
  }, [address]);

  // Gasless move via Gelato - optimistic update + fire-and-forget
  const sendMoveChain = useCallback((dx: number, dy: number) => {
    if (!isConnected || !address || !gelato?.client) return;
    if (!gelato?.client) {
      setSpawnError('Wallet still loading. Please wait a few seconds.');
      return;
    }
    applyOptimisticMove(dx, dy, address);
    setSpawnError(null);
    setTxCount(prev => prev + 1);
    gelato.client.execute({
      payment: sponsored(),
      calls: [{ to: CONTRACT_ADDRESS, data: encodeFunctionData({ abi: CONTRACT_ABI, functionName: 'move', args: [dx, dy] }), value: 0n }],
    })
      .then((result: any) => { result?.wait?.().then(() => pollStateRef.current()); })
      .catch((err: any) => {
        if (!err?.message?.includes('User rejected')) {
          setSpawnError(err?.message || 'Move failed');
          console.error('Move error:', err);
        }
        pollStateRef.current();
      });
  }, [gelato?.client, isConnected, address, applyOptimisticMove]);

  // Respawn after being eaten (when cooldown has passed)
  const sendRespawnChain = useCallback(async () => {
    if (!isConnected || !address) return;
    if (movePendingRef.current) return;
    if (!gelato?.client) {
      setSpawnError('Wallet still loading. Please wait a few seconds and try again.');
      return;
    }

    movePendingRef.current = true;
    setSpawnError(null);
    try {
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'respawn',
        args: [],
      });

      const result = await gelato.client.execute({
        payment: sponsored(),
        calls: [{ to: CONTRACT_ADDRESS, data, value: 0n }],
      });

      setTxCount(prev => prev + 1);

      if (result?.wait) {
        await result.wait();
        pollStateRef.current();
      }
    } catch (error: any) {
      if (!error?.message?.includes('User rejected')) {
        setSpawnError(error?.message || 'Respawn failed');
        console.error('Respawn error:', error);
      }
      pollStateRef.current();
    } finally {
      movePendingRef.current = false;
    }
  }, [gelato?.client, isConnected, address]);

  // Backend mode: optimistic update + fire-and-forget tx
  const sendMoveBackend = useCallback((dx: number, dy: number) => {
    if (!BACKEND_URL) return;
    if (relayerAddress) applyOptimisticMove(dx, dy, relayerAddress);
    setSpawnError(null);
    setTxCount(prev => prev + 1);
    fetch(`${BACKEND_URL}/api/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dx, dy }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.relayerAddress) setRelayerAddress(data.relayerAddress);
        if (data.error) setSpawnError(data.error);
        pollStateRef.current();
      })
      .catch(err => {
        setSpawnError(err?.message || 'Move failed');
        console.error('Backend move error:', err);
        pollStateRef.current();
      });
  }, [applyOptimisticMove, relayerAddress]);

  const sendRespawnBackend = useCallback(() => {
    if (!BACKEND_URL) return;
    setSpawnError(null);
    setTxCount(prev => prev + 1);
    fetch(`${BACKEND_URL}/api/respawn`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(r => r.json())
      .then(data => {
        if (data.relayerAddress) setRelayerAddress(data.relayerAddress);
        if (data.error) setSpawnError(data.error);
        pollStateRef.current();
      })
      .catch(err => {
        setSpawnError(err?.message || 'Respawn failed');
        pollStateRef.current();
      });
  }, []);

  const sendMoveRaw = DEMO_MODE ? sendMoveLocal : (BACKEND_URL ? sendMoveBackend : sendMoveChain);
  const sendMove = useCallback((dx: number, dy: number) => {
    setLastMoveDir({ dx, dy });
    sendMoveRaw(dx, dy);
  }, [sendMoveRaw]);

  // Keyboard controls - one move at a time
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        e.preventDefault();
        if (movePendingRef.current && !DEMO_MODE && !BACKEND_URL) return;
        let dx = 0, dy = 0;
        if (key === 'w' || key === 'arrowup') dy = -1;
        if (key === 's' || key === 'arrowdown') dy = 1;
        if (key === 'a' || key === 'arrowleft') dx = -1;
        if (key === 'd' || key === 'arrowright') dx = 1;
        if (dx !== 0 || dy !== 0) sendMove(dx, dy);
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isConnected, sendMove, DEMO_MODE, BACKEND_URL, gameOver]);

  const startNewRound = useCallback(() => {
    setGameOver(false);
    setGameTimeLeft(GAME_DURATION_SEC);
    gameStartedRef.current = true;
  }, []);

  if (!DEMO_MODE && !isConnected && !BACKEND_URL) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <h1 className="neon-text" style={{ fontSize: '48px', marginBottom: '20px' }}>🍕 SLICE BATTLE 🍕</h1>
        <p style={{ fontSize: '20px', marginBottom: '10px', textAlign: 'center', maxWidth: '600px' }}>
          Multiplayer pizza slice arena game on Monad
        </p>
        <p style={{ fontSize: '16px', marginBottom: '40px', color: '#FFD700', textAlign: 'center', maxWidth: '600px' }}>
          Gasless via Gelato Smart Wallet + Dynamic
        </p>
        {CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' && (
          <div style={{ background: 'rgba(255,0,0,0.2)', border: '2px solid #FF4444', borderRadius: '10px', padding: '15px', marginBottom: '20px', maxWidth: '600px', textAlign: 'center' }}>
            <p style={{ color: '#FFD700', fontSize: '14px' }}>⚠️ Contract not deployed. Deploy first and update CONTRACT_ADDRESS.</p>
          </div>
        )}
        <GelatoSmartWalletDynamicConnectButton>
          <div style={{ padding: '15px 30px', fontSize: '20px', fontFamily: 'Bungee', background: '#FF4444', color: '#FFD700', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 0 20px #FF4444' }}>
            Connect Wallet
          </div>
        </GelatoSmartWalletDynamicConnectButton>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onClick={(e) => (e.currentTarget as HTMLDivElement).focus()}
      style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gridTemplateRows: 'auto minmax(0, 1fr)', height: '100vh', gap: '8px', padding: '8px', outline: 'none', overflow: 'hidden', boxSizing: 'border-box' }}
    >
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="neon-text" style={{ fontSize: '32px' }}>🍕 SLICE BATTLE 🍕</h1>
        {!gameOver && playerSlice?.size > 0 && (
          <span style={{ color: '#FFD700', fontSize: '24px', fontFamily: 'Bungee' }}>
            ⏱ {gameTimeLeft}s
          </span>
        )}
        {DEMO_MODE && <span style={{ color: '#FFD700', fontSize: '14px' }}>DEMO - Local only</span>}
        {BACKEND_URL && !DEMO_MODE && !gameOver && <span style={{ color: '#FFD700', fontSize: '14px' }}>Playing via backend</span>}
        {!DEMO_MODE && <TXCounter txCount={txCount} blockTxCount={lastBlockTxCount} blockNumber={blockNumber} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', height: '100%', justifyContent: 'space-between', paddingBottom: '120px' }}>
        <Leaderboard data={leaderboard} playerAddress={DEMO_MODE ? '0xDemo0000000000000000000000000000000001' : (effectiveAddress || '')} />
        <img src={`${import.meta.env.BASE_URL || '/'}molto-benny-color-pizzadao.png`} alt="" style={{ maxWidth: '280px', height: 'auto' }} />
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, overflow: 'hidden' }}>
        <Arena playerSlice={playerSlice} allSlices={allSlices} toppings={toppings} onMove={gameOver ? () => {} : sendMove} lastMoveDir={lastMoveDir} playerAddress={effectiveAddress || (DEMO_MODE ? '0xDemo0000000000000000000000000000000001' : '')} />
        {gameOver && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            zIndex: 50,
          }}>
            <h2 className="neon-text" style={{ fontSize: '48px', margin: 0 }}>🏆 GAME OVER 🏆</h2>
            <p style={{ color: '#FFD700', fontSize: '20px' }}>Final scores submitted to leaderboard</p>
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <Leaderboard data={leaderboard} playerAddress={effectiveAddress || ''} />
            </div>
            <button
              onClick={startNewRound}
              style={{
                padding: '16px 40px',
                fontSize: '20px',
                fontFamily: 'Bungee',
                background: '#FF4444',
                color: '#FFD700',
                border: '2px solid #FFD700',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 0 20px #FF4444',
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', height: '100%', minHeight: 0, justifyContent: 'space-between', paddingBottom: '200px' }}>
        <Stats slice={playerSlice} blockNumber={blockNumber} spawnError={spawnError} onSpawn={() => {
          setSpawnError(null);
          if (playerSlice?.respawn > 0 && blockNumber >= playerSlice.respawn) {
            BACKEND_URL ? sendRespawnBackend() : sendRespawnChain();
          } else {
            sendMove(1, 0);
          }
        }} />
        <img src={`${import.meta.env.BASE_URL || '/'}logo-light.svg`} alt="" style={{ maxWidth: '280px', height: 'auto', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.9)) drop-shadow(0 0 40px rgba(255,215,0,0.5))' }} />
      </div>
    </div>
  );
}

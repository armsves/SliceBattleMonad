import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useGelatoSmartWalletDynamicContext, GelatoSmartWalletDynamicConnectButton } from '@gelatonetwork/smartwallet-react-dynamic';
import { Arena } from './Arena';
import { Leaderboard } from './Leaderboard';
import { Stats } from './Stats';
import { TXCounter } from './TXCounter';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract';

type LeaderboardEntry = { address: string; size: number; eats: number };

export function Game() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { wagmi } = useGelatoSmartWalletDynamicContext();
  
  const [playerSlice, setPlayerSlice] = useState<any>(null);
  const [allSlices, setAllSlices] = useState<Map<string, any>>(new Map());
  const [toppings, setToppings] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [lastBlockTxCount, setLastBlockTxCount] = useState(0);
  const [blockNumber, setBlockNumber] = useState(0n);
  
  const moveQueueRef = useRef<Array<{ dx: number; dy: number }>>([]);
  const lastMoveTimeRef = useRef<number>(0);
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keysPressedRef = useRef<Set<string>>(new Set());
  
  // Poll blockchain state
  useEffect(() => {
    if (!publicClient || !isConnected || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return;
    
    const pollState = async () => {
      try {
        // Get player slice
        if (address) {
          const slice = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getSlice',
            args: [address],
          }) as any;
          setPlayerSlice({
            ...slice,
            address: address, // Add address for comparison
          });
          
          // Also add to allSlices
          setAllSlices(prev => {
            const newMap = new Map(prev);
            newMap.set(address.toLowerCase(), {
              x: Number(slice.x),
              y: Number(slice.y),
              size: Number(slice.size),
            });
            return newMap;
          });
        }
        
        // Get toppings
        const toppingPromises = [];
        for (let i = 1; i <= 20; i++) {
          toppingPromises.push(
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getTopping',
              args: [BigInt(i)],
            })
          );
        }
        const toppingResults = await Promise.all(toppingPromises);
        setToppings(toppingResults.map((t: any) => ({
          x: Number(t.x),
          y: Number(t.y),
          toppingId: Number(t.toppingId),
          eatenAt: Number(t.eatenAt),
        })));
        
        // Get leaderboard
        const lb = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getLeaderboard',
        }) as string[];
        
        const lbData = await Promise.all(
          lb.filter(addr => addr !== '0x0000000000000000000000000000000000000000').map(async (addr) => {
            const slice = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getSlice',
              args: [addr],
            }) as any;
            return {
              address: addr,
              size: Number(slice.size),
              eats: Number(slice.eats),
            };
          })
        );
        setLeaderboard(lbData.sort((a, b) => b.size - a.size));
        
        // Get block number
        const block = await publicClient.getBlockNumber();
        setBlockNumber(block);
      } catch (error) {
        console.error('Error polling state:', error);
      }
    };
    
    pollState();
    const interval = setInterval(pollState, 2000); // Poll every 2 seconds
    
    return () => clearInterval(interval);
  }, [publicClient, isConnected, address]);
  
  // Listen for events
  useEffect(() => {
    if (!publicClient || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return;
    
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
          if (log.args && log.args.player) {
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
      try {
        unwatch();
      } catch (e) {
        // Ignore unwatch errors
      }
    };
  }, [publicClient]);
  
  // Handle movement
  const sendMove = useCallback(async (dx: number, dy: number) => {
    if (!walletClient || !isConnected || !address) return;
    
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'move',
        args: [dx, dy],
      });
      
      setTxCount(prev => prev + 1);
      
      // Wait for transaction
      await publicClient?.waitForTransactionReceipt({ hash });
    } catch (error: any) {
      if (!error.message?.includes('user rejected')) {
        console.error('Move error:', error);
      }
    }
  }, [walletClient, isConnected, address, publicClient]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        keysPressedRef.current.add(key);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressedRef.current.delete(key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Movement loop - send move every 200ms
    moveIntervalRef.current = setInterval(() => {
      if (!isConnected || keysPressedRef.current.size === 0) return;
      
      let dx = 0;
      let dy = 0;
      
      if (keysPressedRef.current.has('w') || keysPressedRef.current.has('arrowup')) dy = -1;
      if (keysPressedRef.current.has('s') || keysPressedRef.current.has('arrowdown')) dy = 1;
      if (keysPressedRef.current.has('a') || keysPressedRef.current.has('arrowleft')) dx = -1;
      if (keysPressedRef.current.has('d') || keysPressedRef.current.has('arrowright')) dx = 1;
      
      if (dx !== 0 || dy !== 0) {
        sendMove(dx as -1 | 0 | 1, dy as -1 | 0 | 1);
      }
    }, 200);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    };
  }, [isConnected, sendMove]);
  
  if (!isConnected) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '20px',
      }}>
        <h1 className="neon-text" style={{ fontSize: '48px', marginBottom: '20px' }}>
          🍕 SLICE BATTLE 🍕
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '10px', textAlign: 'center', maxWidth: '600px' }}>
          Multiplayer pizza slice arena game on Monad
        </p>
        <p style={{ fontSize: '16px', marginBottom: '40px', color: '#FFD700', textAlign: 'center', maxWidth: '600px' }}>
          Every move is an on-chain transaction! Gasless via Gelato Smart Wallet.
        </p>
        {CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000' && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.2)',
            border: '2px solid #FF4444',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            maxWidth: '600px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#FFD700', fontSize: '14px' }}>
              ⚠️ Contract not deployed. Please deploy the contract first and update CONTRACT_ADDRESS in contract.ts
            </p>
          </div>
        )}
        <GelatoSmartWalletDynamicConnectButton>
          <div
            style={{
              padding: '15px 30px',
              fontSize: '20px',
              fontFamily: 'Bungee',
              background: '#FF4444',
              color: '#FFD700',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 0 20px #FF4444',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Connect Wallet
          </div>
        </GelatoSmartWalletDynamicConnectButton>
      </div>
    );
  }
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr 300px',
      gridTemplateRows: 'auto 1fr',
      height: '100vh',
      gap: '10px',
      padding: '10px',
    }}>
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="neon-text" style={{ fontSize: '32px' }}>🍕 SLICE BATTLE 🍕</h1>
        <TXCounter txCount={txCount} blockTxCount={lastBlockTxCount} blockNumber={blockNumber} />
      </div>
      
      <Leaderboard data={leaderboard} playerAddress={address || ''} />
      
      <div style={{ position: 'relative' }}>
        <Arena
          playerSlice={playerSlice}
          allSlices={allSlices}
          toppings={toppings}
          onMove={sendMove}
        />
      </div>
      
      <Stats slice={playerSlice} />
    </div>
  );
}

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createPublicClient, createWalletClient, http, parseAbi, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from './chains.js';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const CONTRACT_ADDRESS = '0x3879441B57eF716578efD5E36130BEFe95740417';
const CONTRACT_ABI = parseAbi([
  'function move(int8 dx, int8 dy)',
  'function respawn()',
]);

// DRPC RPC - set in .env, never expose in frontend
const rpcUrl = process.env.DRPC_RPC_URL;
if (!rpcUrl) {
  console.error('DRPC_RPC_URL required in .env (e.g. https://lb.drpc.live/monad-testnet/YOUR_KEY)');
  process.exit(1);
}
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  console.warn('⚠️ PRIVATE_KEY not set in .env - backend sign-and-submit disabled');
}

const account = privateKey ? privateKeyToAccount(privateKey) : null;

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(rpcUrl),
});

const walletClient = account
  ? createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(rpcUrl),
    })
  : null;

// RPC proxy - forwards JSON-RPC to DRPC so frontend avoids public RPC rate limits
app.post('/rpc', async (req, res) => {
  try {
    const rpcRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await rpcRes.json();
    res.status(rpcRes.status).json(data);
  } catch (err) {
    console.error('RPC proxy error:', err);
    res.status(502).json({ jsonrpc: '2.0', error: { code: -32603, message: err.message }, id: req.body?.id });
  }
});

// Queue for move/respawn txs to avoid nonce conflicts when frontend sends rapidly
let txQueue = Promise.resolve();
const runQueuedTx = (fn) => {
  txQueue = txQueue.then(fn).catch(() => {});
  return txQueue;
};

// GET relayer address (for display)
app.get('/api/relayer-address', (_req, res) => {
  if (!account) {
    return res.status(503).json({ error: 'Backend not configured with PRIVATE_KEY' });
  }
  res.json({ address: account.address });
});

// POST respawn
app.post('/api/respawn', async (req, res) => {
  if (!walletClient || !account) {
    return res.status(503).json({ error: 'PRIVATE_KEY not configured' });
  }
  try {
    const hash = await runQueuedTx(async () => {
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'respawn',
        args: [],
      });
      return walletClient.sendTransaction({
        to: CONTRACT_ADDRESS,
        data,
        account,
        chain: monadTestnet,
      });
    });
    res.json({ hash, relayerAddress: account.address });
  } catch (err) {
    console.error('Respawn error:', err);
    res.status(500).json({ error: err.message || 'Failed to respawn' });
  }
});

// POST move: backend signs and submits via DRPC
app.post('/api/move', async (req, res) => {
  const { dx, dy, signedTransaction } = req.body;

  if (signedTransaction && typeof signedTransaction === 'string') {
    // Relay user-signed transaction
    try {
      const hash = await publicClient.request({
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
      });
      return res.json({ hash, relayed: true });
    } catch (err) {
      console.error('Relay error:', err);
      return res.status(500).json({ error: err.message || 'Failed to relay transaction' });
    }
  }

  // Backend signs and submits
  if (!walletClient || !account) {
    return res.status(503).json({ error: 'PRIVATE_KEY not configured' });
  }

  const dxNum = typeof dx === 'number' ? dx : parseInt(dx, 10);
  const dyNum = typeof dy === 'number' ? dy : parseInt(dy, 10);
  if (dxNum < -128 || dxNum > 127 || dyNum < -128 || dyNum > 127 || isNaN(dxNum) || isNaN(dyNum)) {
    return res.status(400).json({ error: 'Invalid dx/dy' });
  }

  try {
    const result = await runQueuedTx(async () => {
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'move',
        args: [dxNum, dyNum],
      });
      return walletClient.sendTransaction({
        to: CONTRACT_ADDRESS,
        data,
        account,
        chain: monadTestnet,
      });
    });
    res.json({ hash: result, relayerAddress: account.address });
  } catch (err) {
    console.error('Move error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit transaction' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SliceBattle backend on http://localhost:${PORT}`);
  if (account) console.log(`Relayer address: ${account.address}`);
});

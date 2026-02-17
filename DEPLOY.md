# Deployment Guide

## Prerequisites

1. **Foundry** installed: `curl -L https://foundry.paradigm.xyz | bash`
2. **Node.js** 18+ installed
3. **Dynamic App ID** from https://app.dynamic.xyz
4. **Monad Testnet RPC** access

## Step 1: Deploy Contract

```bash
cd contracts

# Install dependencies
forge install

# Build contract
forge build

# Deploy to Monad testnet
# Replace YOUR_PRIVATE_KEY with your deployer private key
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast \
  --verify
```

After deployment, copy the contract address and update `frontend/src/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = '0x...' as `0x${string}`;
```

## Step 2: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Dynamic App ID
# VITE_DYNAMIC_APP_ID=your-app-id-here

# Start dev server
npm run dev
```

## Step 3: Get Dynamic App ID

1. Go to https://app.dynamic.xyz
2. Sign up / Login
3. Create a new app
4. Copy the App ID
5. Add it to `frontend/.env`

## Step 4: Test the Game

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Use Dynamic wallet (gasless via Gelato)
4. Start playing with WASD keys!

## Gasless Transactions

All transactions are sponsored by Gelato Smart Wallet via Dynamic WaaS. Players don't need to pay gas!

## Troubleshooting

### Contract deployment fails
- Check you have testnet MON tokens for gas
- Verify RPC endpoint is accessible
- Check private key format

### Frontend can't connect
- Verify Dynamic App ID in .env
- Check browser console for errors
- Ensure contract address is correct

### Transactions failing
- Check Gelato sponsorship is enabled
- Verify wallet is connected
- Check contract is deployed correctly

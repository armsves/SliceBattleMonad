# 🚀 Quick Start Guide

Get Slice Battle running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Foundry installed:
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- A wallet with Monad testnet MON tokens (for deployment)
- Dynamic account (free at https://app.dynamic.xyz)

## Step 1: Install Dependencies

```bash
# Install contract dependencies
cd contracts && forge install foundry-rs/forge-std && cd ..

# Install frontend dependencies
npm run install:frontend
```

## Step 2: Deploy Contract

```bash
cd contracts

# Build first
forge build

# Deploy (replace YOUR_PRIVATE_KEY)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast
```

**Copy the deployed contract address!**

## Step 3: Configure Frontend

```bash
cd frontend

# Create .env file
echo "VITE_DYNAMIC_APP_ID=your-dynamic-app-id" > .env

# Edit contract address
# Open src/contract.ts and update CONTRACT_ADDRESS
```

## Step 4: Get Dynamic App ID

1. Go to https://app.dynamic.xyz
2. Sign up (free)
3. Create new app
4. Copy App ID
5. Paste in `frontend/.env`

## Step 5: Run!

```bash
npm run dev:frontend
```

Open http://localhost:3000 and start playing! 🍕

## Troubleshooting

**"Contract not deployed" warning?**
- Make sure you updated `CONTRACT_ADDRESS` in `frontend/src/contract.ts`

**Can't connect wallet?**
- Check Dynamic App ID in `.env` file
- Make sure you're using the Gelato Smart Wallet button

**Transactions failing?**
- Verify contract is deployed correctly
- Check browser console for errors
- Ensure Gelato sponsorship is enabled in Dynamic dashboard

## Game Controls

- **WASD** or **Arrow Keys**: Move slice
- **Click & Drag**: Move slice (mobile)
- Movement sends transaction every 200ms

Enjoy! 🎮

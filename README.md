# 🍕 Slice Battle - Monad Hackathon MVP

Multiplayer arena game where pizza slices battle on-chain. Every action is a transaction demonstrating Monad's high TPS and parallel execution capabilities.

## Game Overview

- **Players**: Pizza slices in a circular arena
- **Core Loop**: Move (tx) → Eat toppings (grow) → Eat smaller players → Dominate leaderboard
- **Target**: 10 players = 50+ txs/minute, visibly smooth on Monad testnet
- **Gas**: Sponsored by Gelato Smart Wallet + Dynamic WaaS

## Tech Stack

- **Contract**: Solidity 0.8.20, Foundry
- **Frontend**: React + Vite + wagmi/viem + HTML Canvas
- **Wallet**: Gelato Smart Wallet with Dynamic WaaS (gasless transactions)
- **Chain**: Monad Testnet

## Quick Start

### 1. Install Foundry (if not already installed)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Deploy Contract

```bash
cd contracts

# Install Foundry dependencies
forge install foundry-rs/forge-std

# Build contract
forge build

# Run tests (optional)
forge test

# Deploy to Monad testnet
# Replace YOUR_PRIVATE_KEY with your deployer private key
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast
```

Copy the deployed contract address and update `frontend/src/contract.ts`

### 3. Setup Frontend

```bash
cd frontend
npm install

# Create .env file
echo "VITE_DYNAMIC_APP_ID=your-dynamic-app-id" > .env

npm run dev
```

### 4. Get Dynamic App ID

1. Go to https://app.dynamic.xyz
2. Create a new app
3. Copy your App ID
4. Add it to `.env` file

## Game Features

### Smart Contract
- Gas optimized (<100k per tx)
- Handles 10+ parallel move txs/block
- Collision detection: eat if size > target.size * 1.2
- Leaderboard (top 5 players)
- 20 toppings that respawn

### Frontend
- 60fps Canvas rendering
- WASD/Arrow keys + click-drag movement
- Real-time leaderboard
- TX counter & TPS display
- Mobile touch support
- Neon pizza aesthetic

## Controls

- **WASD** or **Arrow Keys**: Move slice
- **Click & Drag**: Move slice (mobile-friendly)
- Movement sends transaction every 200ms

## Contract Functions

- `move(int8 dx, int8 dy)`: Move slice in arena
- `respawn()`: Respawn after being eaten
- `getSlice(address)`: Get slice data
- `getTopping(uint256)`: Get topping data
- `getLeaderboard()`: Get top 5 players

## Events

- `SliceMoved`: Player moved
- `SliceAtePlayer`: Player ate another player
- `SliceAteTopping`: Player ate a topping
- `SliceRespawned`: Player respawned
- `LeaderboardUpdated`: Leaderboard changed

## Monad Demo Features

- **TX Counter**: Shows total transactions sent per player
- **TPS Display**: Shows transactions per block
- **Block Meter**: Shows current block number
- **Gasless**: All transactions sponsored by Gelato

## Project Structure

```
SliceBattle/
├── contracts/
│   ├── SliceBattle.sol      # Main game contract
│   ├── foundry.toml         # Foundry config
│   └── script/
│       └── Deploy.s.sol     # Deployment script
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Arena.tsx    # Canvas arena rendering
    │   │   ├── Leaderboard.tsx
    │   │   ├── Stats.tsx
    │   │   └── TXCounter.tsx
    │   ├── App.tsx          # Main app with Gelato provider
    │   ├── chains.ts        # Monad testnet config
    │   └── contract.ts      # Contract ABI & address
    └── package.json
```

## Gas Optimization

- Packed structs (uint24, int8, uint32)
- Minimal storage reads
- Efficient collision checking
- Event-based state updates

## License

MIT

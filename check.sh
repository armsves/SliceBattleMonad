#!/bin/bash
echo "=== Slice Battle Diagnostic ==="
echo ""

echo "1. Contract files:"
ls -la contracts/*.sol contracts/script/*.sol contracts/test/*.sol 2>/dev/null | wc -l
echo ""

echo "2. Library installed:"
test -f contracts/lib/forge-std/src/Script.sol && echo "✓ forge-std OK" || echo "✗ forge-std MISSING"
echo ""

echo "3. Contract compiled:"
test -d contracts/out && echo "✓ Build output exists" || echo "✗ Not compiled"
echo ""

echo "4. Frontend files:"
ls -la frontend/src/components/*.tsx frontend/src/*.tsx 2>/dev/null | wc -l
echo ""

echo "5. Contract address configured:"
grep -q "0x0000000000000000000000000000000000000000" frontend/src/contract.ts && echo "⚠️  Contract address NOT SET" || echo "✓ Contract address configured"
echo ""

echo "6. Environment file:"
test -f frontend/.env && echo "✓ .env exists" || echo "⚠️  .env missing (create from .env.example)"
echo ""

echo "=== What are you trying to do? ==="
echo "- Build contract: cd contracts && forge build"
echo "- Deploy contract: cd contracts && forge script script/Deploy.s.sol:DeployScript --rpc-url https://testnet-rpc.monad.xyz --broadcast"
echo "- Run frontend: cd frontend && npm install && npm run dev"
echo ""
echo "If something is failing, share the EXACT error message!"

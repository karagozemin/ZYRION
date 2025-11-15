#!/usr/bin/env bash

set -eu

echo "🚀 Starting ZYRION - Linera Prediction Market..."

# Setup Linera local network
eval "$(linera net helper)"
linera_spawn linera net up --with-faucet

export LINERA_FAUCET_URL=http://localhost:8080

# Initialize wallet if not exists
if [ ! -f ~/.local/share/linera/wallet.json ]; then
    echo "🔑 Initializing Linera wallet..."
    linera wallet init --faucet="$LINERA_FAUCET_URL"
    linera wallet request-chain --faucet="$LINERA_FAUCET_URL"
fi

echo "📦 Building Linera contract..."
cd /build/contract
cargo build --release --target wasm32-unknown-unknown 2>&1 | head -50

echo "📦 Building Linera GraphQL service..."
cd /build/service
cargo build --release 2>&1 | head -50

# Publish contract and service (if not already published)
# Uncomment and configure these after setting up your contract:
# CONTRACT_BYTECODE_ID=$(linera contract publish /build/contract/target/wasm32-unknown-unknown/release/prediction_market.wasm)
# linera service publish /build/service/target/release/prediction_market_service

echo "🌐 Building frontend..."
cd /build/zyrion/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
fi

# Build frontend (optional - dev server will build on the fly)
# echo "🔨 Building frontend..."
# npm run build

# Start frontend dev server (will be accessible at localhost:5173)
echo "🎉 Starting frontend server on http://localhost:5173..."
echo ""
echo "✅ ZYRION is ready!"
echo "   - Frontend: http://localhost:5173"
echo "   - Faucet: http://localhost:8080"
echo "   - Linera Proxy: http://localhost:9001"
echo ""
echo "Press Ctrl+C to stop..."

# Start frontend dev server
# This will keep the container running
npm run dev


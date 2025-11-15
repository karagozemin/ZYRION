<div align="center">
  <img src="Lynora-Photoroom.png" alt="LYNORA Logo" width="250" />
</div>

# LYNORA - Real-Time Prediction Markets on Massa

> 🚀 Built for AKINDO x Massa Buildathon Wave 4/5

LYNORA is a decentralized prediction market platform built on Massa blockchain, enabling users to create and trade on real-time binary prediction markets.

## ✨ Features

- **🎯 Binary Prediction Markets**: Create YES/NO markets on any topic
- **⚡ Instant Trading**: Place bets (UP/DOWN) with real-time execution
- **🤖 Autonomous Resolution**: Automatic market resolution and reward distribution
- **💰 Proportional Rewards**: Winners share the total pool based on their stake
- **🔒 Trustless & Secure**: Smart contract-based, no centralized control
- **🌐 On-Chain Everything**: Powered by Massa DeWeb technology

## 🏗️ Architecture

### Smart Contract (AssemblyScript)
- **Market Creation**: Users create prediction markets with questions and durations
- **Betting System**: Binary betting (UP/DOWN) with MAS tokens
- **Resolution Mechanism**: Creator-based resolution (can be upgraded to oracle-based)
- **Reward Distribution**: Proportional payout to winners from total pool

### Frontend (React + TypeScript)
- **Massa Web3 Integration**: Direct connection to Massa BuildNet
- **Massa Station Wallet**: Seamless wallet connection and signing
- **Modern UI**: Beautiful, responsive interface with TailwindCSS
- **Real-time Updates**: Live market status and betting activity

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Massa Station** wallet (for connecting)
- **AssemblyScript** tooling for contract development

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd <repo-name>
```

2. **Install contract dependencies**
```bash
cd lynora/contract
npm install
```

3. **Build the smart contract**
```bash
cd lynora/contract
npm run build
```

4. **Install frontend dependencies**
```bash
cd lynora/frontend
npm install
```

5. **Configure environment**
```bash
cd lynora/frontend
cp .env.example .env
# Edit .env and add your contract address after deployment
```

6. **Start development server**
```bash
cd lynora/frontend
npm run dev
```

## 📦 Deployment

### Deploy Smart Contract to Massa BuildNet

1. **Get testnet tokens**
   - Join Massa Discord: https://discord.gg/massa
   - Request tokens in `#buildernet-faucet` channel

2. **Deploy contract using massa-sc-scripts**
```bash
cd lynora/contract
npm run deploy
```

3. **Copy contract address** to frontend `.env`:
```env
VITE_CONTRACT_ADDRESS=AS12...your_contract_address
```

### Deploy Frontend to Massa DeWeb

```bash
cd lynora/frontend
npm run build

# Deploy to DeWeb (optional - requires Massa DeWeb CLI)
# massa-deweb deploy dist/
```

Or deploy to traditional hosting (Vercel, Netlify, etc.)

## 🎮 How to Use

### For Users

1. **Connect Wallet**: Click "Connect Massa Wallet" and approve in Massa Station
2. **Browse Markets**: Explore active prediction markets on the homepage
3. **Place Bets**: Choose a market and bet UP or DOWN with MAS tokens
4. **Claim Rewards**: After market resolution, claim your winnings if you won

### For Market Creators

1. **Create Market**: Click "Create" and fill in market details
2. **Set Duration**: Choose how long the market will accept bets
3. **Resolve Market**: After the market ends, resolve it with the outcome
4. **Track Performance**: Monitor your markets in "My Markets" section

## 🏆 Massa Buildathon Alignment

### Technical Excellence (25%)
- ✅ AssemblyScript smart contract with full prediction market logic
- ✅ Massa Web3 integration with Massa Station wallet
- ✅ Clean, modular codebase with TypeScript
- ✅ Comprehensive error handling and validation

### Innovation & Originality (20%)
- ✅ Real-time prediction markets on Massa (first of its kind)
- ✅ Binary betting system with proportional rewards
- ✅ Creator-based resolution (upgradeable to autonomous oracles)
- ✅ On-chain market lifecycle management

### Usefulness & Real-World Application (20%)
- ✅ Solves: Need for trustless prediction markets
- ✅ Use cases: Crypto prices, sports, events, governance decisions
- ✅ Practical: Simple interface, instant execution
- ✅ Accessible: Works with Massa Station wallet

### User Experience (20%)
- ✅ Modern, intuitive UI with gradient design
- ✅ Clear market information and betting flow
- ✅ Real-time wallet connection status
- ✅ Helpful error messages and confirmations

### Autonomy & Decentralization (15%)
- ✅ Smart contract-based, no backend servers
- ✅ On-chain state management
- ✅ Massa blockchain security
- ✅ Future: Can integrate with decentralized oracles

## 🎯 Massa Features Leveraged

1. **Autonomous Smart Contracts**: Market resolution and reward distribution
2. **DeWeb Compatible**: Can deploy frontend on-chain
3. **Fast Finality**: Instant bet confirmation
4. **Low Fees**: Affordable market creation and betting
5. **Decentralized**: No centralized points of failure

## 📝 Smart Contract Functions

### Write Functions
- `createMarket(question, description, durationMinutes)` - Create a new market
- `placeBet(marketId, option)` - Place a bet (sends MAS with call)
- `resolveMarket(marketId, winningOption, resolutionPrice)` - Resolve market (creator only)
- `claimReward(marketId)` - Claim winnings from resolved market

### Read Functions
- `getMarketDetails(marketId)` - Get full market information
- `getUserBetDetails(marketId, userAddress)` - Get user's bet on a market

## 🔮 Future Enhancements

### Phase 2
- [ ] Decentralized oracle integration (Chainlink, API3)
- [ ] Multi-outcome markets (not just binary)
- [ ] Liquidity pools for instant exits
- [ ] Social features (comments, sharing)
- [ ] Market categories and search

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Governance token and DAO
- [ ] Cross-chain bridge support
- [ ] AI-powered market suggestions

## 🧪 Testing

```bash
# Run contract tests
cd lynora/contract
npm test

# Run frontend tests
cd lynora/frontend
npm test
```

## 📚 Documentation

- [Architecture](./lynora/ARCHITECTURE.md) - Technical architecture details
- [Changelog](./lynora/CHANGELOG.md) - Project changelog

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see [LICENSE](./lynora/LICENSE) file

## 🌐 Links

- **Massa Docs**: https://docs.massa.net/
- **Massa Discord**: https://discord.gg/massa
- **Massa Explorer**: https://buildnet-explorer.massa.net

## 👥 Team

Built with ❤️ for the AKINDO x Massa Buildathon

## 🙏 Acknowledgments

- Massa Labs team for the amazing blockchain platform
- AKINDO for organizing the buildathon
- Massa community for support and feedback

---

**LYNORA** - Predict the Future, Trade on Massa 🔮

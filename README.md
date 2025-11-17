<div align="center">
  <img src="zyrion/zyrion/logo.png" alt="ZYRION Logo" width="220" />
</div>

# ZYRION – Mock Linera Prediction Markets

Zyrion is a playground for building prediction-market UX on top of Linera-style microchains.  
It currently runs entirely in **mock mode**, so you can deploy it to Vercel/Netlify and let anyone try the flows without installing a wallet.

## Highlights

- ⚡ Multi-market homepage with Supabase + curated mock listings  
- 🎯 Question markets (multi-choice) with live pool distribution  
- 🪙 Point system (connect/create/join/claim) surfaced in the header panel  
- 🧪 Simulation feed that animates mock wallet/signing events  
- 🌌 Dark holo UI built with React, Vite, TailwindCSS, GLSL shaders

## Status

| Layer                 | Implementation                                                                 |
|-----------------------|---------------------------------------------------------------------------------|
| Wallet bridge         | Mock Linera wallet + simulation overlay (no on-chain signing yet)              |
| Market storage        | Supabase (optional) + local storage + default mock catalog                     |
| Legacy on-chain contract | Removed. Only the frontend + mocks live in this repository now.            |

## Getting Started

```bash
cd zyrion/zyrion/frontend
npm install
npm run dev
```

- Copy `.env.example` → `.env` if you want to point the UI at your Supabase instance.  
- Without Supabase, the UI still works using the bundled mock data.

## Building for Production

```bash
cd zyrion/zyrion/frontend
npm run build
```

Deploy the generated `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, …).

## Project Structure

```
zyrion/
 ├─ frontend/          React + Vite app (mock Linera experience)
 ├─ assets/            Legacy imagery used in docs/marketing
 ├─ README.md          This file
 ├─ ARCHITECTURE.md    High-level overview of the mock stack
 └─ CHANGELOG.md       Latest milestones
```

## Next Steps

1. Replace the mock wallet bridge with a true Linera signer when SDKs land.  
2. Rebuild the smart contract for Linera (Move/Wasm) and plug it into `contract.ts`.  
3. Expand the points panel into an achievements / loyalty experience.  
4. Hook the simulation feed into real telemetry when the chain integration is ready.

## License

MIT © 2025 Zyrion Contributors


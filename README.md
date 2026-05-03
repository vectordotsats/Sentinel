# Sentinel

AI-powered DeFi portfolio manager on Solana. Connect your wallet, detect your holdings, and execute automated yield, trade, and hedge strategies through Jupiter's Developer Platform.

**Live:** [sentinelport.netlify.app](https://sentinelport.netlify.app)

---

## How It Works

1. Connect your Solflare wallet
2. Sentinel detects your token holdings and prices them in real-time
3. Choose a risk profile — Conservative, Balanced, or Aggressive
4. Adjust allocation across three tracks: Yield, Trade, Hedge
5. Simulate to preview the strategy, then Execute on-chain

## What Each Track Does

**Yield** — Swaps a portion of your assets to stablecoins via Jupiter Swap V2 and identifies the best Kamino vault by APY for deposit.

**Trade** — Sets take-profit and stop-loss OCO orders via Jupiter Trigger V2. If a stop-loss triggers, it sets up a DCA buyback via Jupiter Recurring to re-accumulate at lower prices.

**Hedge** — Places prediction market bets on downside scenarios via Jupiter Prediction Markets as portfolio insurance. On aggressive profiles, opens leveraged short positions via Jupiter Perps.

## Jupiter API Coverage

| API        | Version | Usage                                | Status             |
| ---------- | ------- | ------------------------------------ | ------------------ |
| Price      | V3      | Real-time USD pricing for all tokens | Working            |
| Tokens     | V2      | Token metadata and search            | Working            |
| Swap       | V2      | On-chain token swaps (order/execute) | Working            |
| Trigger    | V2      | TP/SL limit orders with OCO bundling | Working            |
| Recurring  | V1      | DCA order creation                   | Wired ($100 min)   |
| Prediction | V1      | Hedge bets on market outcomes        | Wired ($5 min)     |
| Lend       | —       | Yield data via Kamino                | Working            |
| Perps      | —       | Leveraged hedging                    | API WIP by Jupiter |

## Partner Integrations

**Solflare** — Core wallet layer. Every transaction signs through Solflare. Trigger V2 auth uses signMessage for challenge-response JWT flow.

**Kamino** — Live vault data from api.kamino.finance. Displays vault names, TVL, APY, and risk ratings. Searchable and sortable.

**QuickNode** — Solana Mainnet RPC for all on-chain reads and transaction broadcasting. Replaced the rate-limited public RPC.

**DFlow** — MEV-protected swap routing through Jupiter's meta-aggregator.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Wallet:** @solana/wallet-adapter + Solflare
- **Blockchain:** Solana Mainnet via QuickNode RPC
- **APIs:** Jupiter Developer Platform (8 APIs)
- **Yield Data:** Kamino Finance REST API
- **Hosting:** Netlify with serverless functions for API proxying
- **Origin:** Initial scaffold via Eitherway

## Setup

```bash
git clone https://github.com/vectordotsats/Sentinel.git
cd Sentinel
npm install
```

Create a `.env` file in the project root:

```
VITE_JUPITER_API_KEY=your_key_from_developers.jup.ag
VITE_RPC_ENDPOINT=your_quicknode_solana_mainnet_url
```

```bash
npm run dev
```

## Project Structure

```
src/
├── components/        # UI (Navbar, Dashboard, Vaults, Strategy, Simulation, Logs)
├── context/           # AppContext — global state, wallet, execution logic
├── services/          # API integrations
│   ├── jupiter-swap.js      # Swap V2 (order/execute)
│   ├── jupiter-trigger.js   # Trigger V2 (JWT auth, vault, OCO orders)
│   ├── jupiter-dca.js       # Recurring V1 (DCA orders)
│   ├── jupiter-perps.js     # Prediction Markets V1 + Perps
│   ├── kamino.js             # Kamino vault data
│   └── ai-strategy.js       # Strategy generation engine
├── data/              # Risk profiles, mock data
└── main.jsx           # Entry point with Solana wallet providers
```

## Known Limitations

- Jupiter Perps API is marked "work in progress" by Jupiter — no REST endpoints available
- Recurring (DCA) API has a $100 USDC minimum order size
- Prediction Markets API has a $5 minimum order size
- All Jupiter APIs require server-side proxying due to CORS (x-api-key header triggers preflight block)
- Kamino vault deposits not implemented due to SDK version conflicts (@solana/kit v2 vs @solana/web3.js v1)

## License

MIT

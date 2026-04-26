# Sentinel

Your AI powered DeFi portfolio manager on Solana. Connect your wallet, see your holdings, and execute automated yield, trade, and hedge strategies.

## What it does

- Reads your wallet holdings and prices them in real-time
- Generates a multi-step strategy based on your risk profile (Conservative / Balanced / Aggressive)
- Allocates across three tracks: **Yield** (Kamino vault deposits), **Trade** (TP/SL limit orders, DCA), and **Hedge** (prediction markets, perps)
- Executes the strategy on-chain through Jupiter APIs

## Built with

- **React + Vite + Tailwind CSS** — frontend
- **Solana Wallet Adapter** — Solflare wallet connection
- **Jupiter Developer Platform** — Swap V2, Price, Tokens, Trigger, Recurring, Prediction Markets, Lend, Perps
- **Kamino Finance** — vault data and yield strategies
- **QuickNode** — RPC infrastructure
- **DFlow** — MEV-protected swap routing

## Setup

```bash
git clone https://github.com/vectordotsats/Sentinel.git
cd Sentinel
npm install
```

Create a `.env` file:

```
VITE_JUPITER_API_KEY=your_jupiter_api_key
VITE_RPC_ENDPOINT=your_quicknode_endpoint
```

Get your Jupiter API key at [developers.jup.ag](https://developers.jup.ag). Get a free QuickNode endpoint at [quicknode.com](https://quicknode.com).

```bash
npm run dev
```

## Project structure

```
src/
├── components/       # UI components
├── context/          # App state (AppContext)
├── services/         # API integrations (Jupiter, Kamino, DCA, Perps)
├── data/             # Mock data and risk profiles
└── main.jsx          # Entry point with wallet providers
```

## Jupiter API coverage

| API                | Usage                               |
| ------------------ | ----------------------------------- |
| Tokens             | Wallet token detection and metadata |
| Price              | Real-time USD pricing               |
| Swap V2            | Token swaps with DFlow routing      |
| Lend               | Yield rate queries                  |
| Trigger            | TP/SL limit orders (OCO)            |
| Recurring          | DCA position setup                  |
| Prediction Markets | Downside hedging                    |
| Perps              | Leveraged short hedging             |

## License

MIT

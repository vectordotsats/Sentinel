import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import ConnectPrompt from "./components/ConnectPrompt";
import PortfolioSummary from "./components/PortfolioSummary";
import IdleAssets from "./components/IdleAssets";
import ActivePositions from "./components/ActivePositions";
import StrategyPanel from "./components/StrategyPanel";
import SimulationPanel from "./components/SimulationPanel";
import KaminoVaults from "./components/KaminoVaults";
import ExecutionLog from "./components/ExecutionLog";
import SolPrice from "./components/SolPrice";

function Dashboard() {
  const { connected } = useApp();

  if (!connected) return <ConnectPrompt />;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <PortfolioSummary />

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5 lg:col-span-2 min-w-0">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <IdleAssets />
            <ActivePositions />
          </div>
          <SimulationPanel />
          <KaminoVaults />
        </div>

        {/* Right column */}
        <div className="space-y-5 min-w-0">
          <SolPrice />
          <StrategyPanel />
          <ExecutionLog />
        </div>
      </div>

      <footer className="border-t border-sentinel-border pt-4 pb-8 text-center text-[10px] text-sentinel-muted uppercase tracking-widest">
        Sentinel · DeFi Portfolio Manager · Solana Mainnet
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-sentinel-bg text-sentinel-text">
        <Navbar />
        <Dashboard />
      </div>
    </AppProvider>
  );
}

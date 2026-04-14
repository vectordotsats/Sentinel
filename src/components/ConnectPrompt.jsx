import React from "react";
import { Shield, Wallet, Zap, Eye, BarChart3 } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function ConnectPrompt() {
  const { setVisible } = useWalletModal();

  const features = [
    {
      icon: Eye,
      title: "Portfolio Overview",
      desc: "See all token holdings with real-time USD values",
    },
    {
      icon: Zap,
      title: "AI Strategy Engine",
      desc: "Conservative, Balanced, or Aggressive allocation profiles",
    },
    {
      icon: BarChart3,
      title: "DeFi Positions",
      desc: "Track active positions across Kamino, Marinade, Drift and more",
    },
  ];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h2 className="mb-2 text-3xl font-bold text-sentinel-textBright">
        Welcome to Sentinel
      </h2>
      <p className="mb-10 max-w-md text-center text-sentinel-muted">
        Connect your Solflare wallet to manage your Solana DeFi portfolio with
        automated strategy execution.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-sentinel-border bg-sentinel-card/50 p-5 text-center backdrop-blur"
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/10">
              <Icon className="h-5 w-5 text-sentinel-accent" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-sentinel-textBright">
              {title}
            </h3>
            <p className="text-xs text-sentinel-muted">{desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setVisible(true)}
        className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-sentinel-accent to-purple-500 px-8 py-3.5 text-base font-semibold text-white shadow-2xl shadow-sentinel-accent/30 transition-all hover:scale-[1.02] hover:shadow-sentinel-accent/40 active:scale-[0.98]"
      >
        <Wallet className="h-5 w-5 transition-transform group-hover:-rotate-12" />
        Connect Solflare Wallet
      </button>

      <footer className="fixed bottom-0 left-0 w-full py-5 text-center border-t border-sentinel-border bg-sentinel-bg/80 backdrop-blur-xl">
        <p className="text-xs text-sentinel-muted">
          Powered by QuickNode RPC — Kamino Vaults — DFlow Routing
        </p>
      </footer>
    </div>
  );
}

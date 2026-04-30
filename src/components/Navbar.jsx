import React from "react";
import { LogOut, Activity } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { connected, walletAddress, disconnectWallet, totalPortfolioValue } =
    useApp();
  const { setVisible } = useWalletModal();

  return (
    <nav className="sticky top-0 z-50 border-b border-sentinel-border bg-sentinel-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <img
            src="/images/Sentinel-logo.png"
            alt="Sentinel"
            className="h-8 w-8 rounded-lg object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-sentinel-textBright tracking-tight uppercase tracking-widest">
              Sentinel
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-sentinel-muted">
              DeFi Portfolio Manager
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          {connected && (
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-3.5 w-3.5 text-sentinel-success animate-pulse" />
              <span className="text-sentinel-muted">Portfolio</span>
              <span className="font-semibold text-sentinel-textBright font-mono">
                $
                {totalPortfolioValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>

        <div>
          {connected ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-sentinel-card border border-sentinel-border px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-sentinel-success" />
                <span className="text-sm font-mono text-sentinel-text">
                  {walletAddress}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="flex items-center gap-1.5 rounded-lg border border-sentinel-border bg-sentinel-card px-3 py-1.5 text-sm text-sentinel-muted hover:text-sentinel-danger hover:border-sentinel-danger/50 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sentinel-accent to-purple-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-sentinel-accent/25"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

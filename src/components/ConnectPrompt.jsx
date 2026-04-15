import React from "react";
import {
  Wallet,
  Zap,
  Eye,
  BarChart3,
  Shield,
  ArrowRight,
  Lock,
  Globe,
} from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

function TypewriterText() {
  const phrases = [
    "Connect your Solflare wallet",
    "Manage your Solana DeFi portfolio with automated strategy execution",
    "SENTINEL, Your DeFi Portfolio Manager.",
  ];

  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const current = phrases[phraseIndex];
    let timeout;

    if (!isDeleting && text === current) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else if (isDeleting) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), 30);
    } else {
      timeout = setTimeout(
        () => setText(current.slice(0, text.length + 1)),
        60,
      );
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  return (
    <p className="text-sentinel-muted text-base">
      {text}
      <span className="animate-pulse text-sentinel-accent">|</span>
    </p>
  );
}

function StatBadge({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold text-sentinel-textBright font-mono">
        {value}
      </span>
      <span className="text-[10px] text-sentinel-muted uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default function ConnectPrompt() {
  const { setVisible } = useWalletModal();

  const features = [
    {
      icon: Eye,
      title: "Portfolio Overview",
      desc: "Real-time token balances with USD values powered by Jupiter Price API",
    },
    {
      icon: Zap,
      title: "AI Strategy Engine",
      desc: "Automated yield, trade, and hedge strategies across 8 Jupiter APIs",
    },
    {
      icon: BarChart3,
      title: "DeFi Positions",
      desc: "Track and manage positions across Kamino vaults and lending markets",
    },
    {
      icon: Shield,
      title: "Portfolio Defense",
      desc: "Automated TP/SL, DCA buyback, and prediction market hedging",
    },
  ];

  const integrations = [
    { name: "Jupiter", role: "Swap & Trading" },
    { name: "Kamino", role: "Yield Vaults" },
    { name: "QuickNode", role: "RPC Infrastructure" },
    { name: "DFlow", role: "MEV Protection" },
    { name: "Solflare", role: "Wallet" },
  ];

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-10">
      {/* Hero */}
      <div className="relative mb-6">
        <div className="absolute -inset-6 rounded-full bg-sentinel-accent/10 blur-2xl" />
      </div>

      <h2 className="mb-1 text-4xl font-bold text-sentinel-textBright tracking-tight">
        Welcome to{" "}
        <span className="bg-gradient-to-r from-sentinel-accent to-purple-400 bg-clip-text text-transparent">
          SENTINEL
        </span>
      </h2>

      {/* Typewriter */}
      <div className="mb-10 h-16 max-w-xl text-center flex items-center justify-center">
        <TypewriterText />
      </div>

      {/* Stats */}
      <div className="mb-10 flex items-center gap-8 rounded-xl border border-sentinel-border bg-sentinel-card/50 px-8 py-4 backdrop-blur">
        <StatBadge value="8" label="Jupiter APIs" />
        <div className="h-8 w-px bg-sentinel-border" />
        <StatBadge value="5" label="Integrations" />
        <div className="h-8 w-px bg-sentinel-border" />
        <StatBadge value="3" label="Strategy Tracks" />
      </div>

      {/* Feature Cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-xl border border-sentinel-border bg-sentinel-card/50 p-5 backdrop-blur transition-all hover:border-sentinel-accent/30 hover:bg-sentinel-card"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sentinel-accent/10 transition-colors group-hover:bg-sentinel-accent/20">
              <Icon className="h-5 w-5 text-sentinel-accent" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-sentinel-textBright">
              {title}
            </h3>
            <p className="text-xs text-sentinel-muted leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* Connect Button */}
      <button
        onClick={() => setVisible(true)}
        className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-sentinel-accent to-purple-500 px-10 py-4 text-base font-semibold text-white shadow-2xl shadow-sentinel-accent/30 transition-all hover:scale-[1.02] hover:shadow-sentinel-accent/40 active:scale-[0.98]"
      >
        <Wallet className="h-5 w-5 transition-transform group-hover:-rotate-12" />
        Connect Wallet
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Security note */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-sentinel-muted">
        <Lock className="h-3 w-3" />
        <span>Non-custodial — your keys, your assets</span>
      </div>

      {/* Integration bar */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {integrations.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5 rounded-full border border-sentinel-border px-3 py-1.5 text-[10px] text-sentinel-muted"
          >
            <Globe className="h-3 w-3" />
            <span className="font-semibold text-sentinel-text">
              {item.name}
            </span>
            <span>· {item.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

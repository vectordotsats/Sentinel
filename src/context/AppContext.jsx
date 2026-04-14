import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { generateStrategy } from "../services/ai-strategy";
import {
  MOCK_ACTIVE_POSITIONS,
  RISK_PROFILES,
  generateMockTxHash,
} from "../data/mockData";

const AppContext = createContext(null);

const STORAGE_KEY = "sentinel_state";

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    /* ignore */
  }
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* ignore */
  }
}

export function AppProvider({ children }) {
  const saved = loadState();
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();

  const [tokens, setTokens] = useState([]);
  const [activePositions] = useState([]);
  const [riskProfile, setRiskProfile] = useState(
    saved?.riskProfile || "balanced",
  );
  const [allocation, setAllocation] = useState(
    saved?.allocation || { yield: 45, trade: 30, hedge: 25 },
  );
  const [simulationSteps, setSimulationSteps] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState(saved?.executionLog || []);
  const [solPrice, setSolPrice] = useState(0);
  const [loadingTokens, setLoadingTokens] = useState(false);

  useEffect(() => {
    saveState({ riskProfile, allocation, executionLog });
  }, [riskProfile, allocation, executionLog]);

  // Fetch wallet balances when connected
  useEffect(() => {
    if (connected && publicKey) {
      addLogEntry(
        "system",
        `Wallet connected: ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`,
      );
      fetchTokens();
    } else {
      setTokens([]);
    }
  }, [connected, publicKey]);

  async function fetchTokens() {
    if (!publicKey || !connection) return;
    setLoadingTokens(true);
    try {
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;

      // Get SPL token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: new (await import("@solana/web3.js")).PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          ),
        },
      );

      // Build token list starting with SOL
      const walletTokens = [
        {
          symbol: "SOL",
          name: "Solana",
          mint: "So11111111111111111111111111111111111111112",
          balance: solBalanceFormatted,
          usdPrice: 0, // will be filled by price fetch
          icon: "◎",
          decimals: 9,
          idle: true,
        },
      ];

      // Add SPL tokens with non-zero balances
      for (const account of tokenAccounts.value) {
        const parsed = account.account.data.parsed.info;
        const amount = parsed.tokenAmount.uiAmount;
        if (amount > 0) {
          walletTokens.push({
            symbol: parsed.mint.slice(0, 4) + "...",
            name: parsed.mint,
            mint: parsed.mint,
            balance: amount,
            usdPrice: 0,
            icon: "●",
            decimals: parsed.tokenAmount.decimals,
            idle: true,
          });
        }
      }

      // Fetch prices from Jupiter Price API
      const mints = walletTokens.map((t) => t.mint).join(",");
      const priceRes = await fetch(`https://api.jup.ag/price/v2?ids=${mints}`, {
        headers: { "x-api-key": import.meta.env.VITE_JUPITER_API_KEY },
      });
      const priceData = await priceRes.json();

      // Fetch token metadata from Jupiter for symbol/name
      for (const token of walletTokens) {
        if (priceData.data?.[token.mint]) {
          token.usdPrice = parseFloat(priceData.data[token.mint].price);
        }
        // Get metadata for non-SOL tokens
        if (token.mint !== "So11111111111111111111111111111111111111112") {
          try {
            const metaRes = await fetch(
              `https://api.jup.ag/tokens/v1/token/${token.mint}`,
              {
                headers: { "x-api-key": import.meta.env.VITE_JUPITER_API_KEY },
              },
            );
            if (metaRes.ok) {
              const meta = await metaRes.json();
              token.symbol = meta.symbol || token.symbol;
              token.name = meta.name || token.name;
            }
          } catch {
            /* keep defaults */
          }
        }
      }

      if (priceData.data?.["So11111111111111111111111111111111111111112"]) {
        setSolPrice(
          parseFloat(
            priceData.data["So11111111111111111111111111111111111111112"].price,
          ),
        );
      }

      // Filter out tokens worth less than $0.01
      const meaningful = walletTokens.filter(
        (t) => t.balance * t.usdPrice >= 0.01 || t.symbol === "SOL",
      );
      setTokens(meaningful);
      addLogEntry("system", `Found ${meaningful.length} tokens in wallet`);
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
      addLogEntry("system", `Error fetching tokens: ${err.message}`);
    } finally {
      setLoadingTokens(false);
    }
  }

  const disconnectWallet = useCallback(() => {
    disconnect();
    setTokens([]);
    setSimulationSteps([]);
    addLogEntry("system", "Wallet disconnected");
  }, [disconnect]);

  const updateRiskProfile = useCallback((profile) => {
    setRiskProfile(profile);
    const preset = RISK_PROFILES[profile];
    setAllocation({
      yield: preset.yield,
      trade: preset.trade,
      hedge: preset.hedge,
    });
    setSimulationSteps([]);
  }, []);

  const updateAllocation = useCallback((track, value) => {
    setAllocation((prev) => {
      const newAlloc = { ...prev, [track]: value };
      const total = newAlloc.yield + newAlloc.trade + newAlloc.hedge;
      if (total > 100) {
        const others = Object.keys(newAlloc).filter((k) => k !== track);
        const remaining = 100 - value;
        const otherTotal = others.reduce((s, k) => s + prev[k], 0);
        if (otherTotal > 0) {
          others.forEach((k) => {
            newAlloc[k] = Math.round((prev[k] / otherTotal) * remaining);
          });
          const adjustedTotal = others.reduce((s, k) => s + newAlloc[k], 0);
          if (adjustedTotal + value !== 100) {
            newAlloc[others[0]] += 100 - value - adjustedTotal;
          }
        }
      }
      return newAlloc;
    });
    setSimulationSteps([]);
  }, []);

  const simulate = useCallback(async () => {
    setIsSimulating(true);
    setSimulationSteps([]);
    try {
      const steps = await generateStrategy(tokens, allocation, riskProfile, []);
      setSimulationSteps(steps);
      addLogEntry(
        "simulate",
        `AI generated ${steps.length} steps for ${RISK_PROFILES[riskProfile].label} profile`,
      );
    } catch (err) {
      console.error("Simulation error:", err);
      addLogEntry("system", `Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  }, [tokens, allocation, riskProfile]);

  const execute = useCallback(async () => {
    if (simulationSteps.length === 0) return;
    setIsExecuting(true);

    for (let i = 0; i < simulationSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
      const step = simulationSteps[i];
      const txHash = generateMockTxHash();

      setSimulationSteps((prev) =>
        prev.map((s, idx) =>
          idx === i
            ? { ...s, status: "complete", txHash }
            : idx === i + 1
              ? { ...s, status: "executing" }
              : s,
        ),
      );

      addLogEntry("execute", step.action, txHash);
    }

    setIsExecuting(false);
    addLogEntry("system", "Strategy execution complete");
  }, [simulationSteps]);

  function addLogEntry(type, message, txHash = null) {
    setExecutionLog((prev) =>
      [
        {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          type,
          message,
          txHash,
        },
        ...prev,
      ].slice(0, 100),
    );
  }

  const clearLog = useCallback(() => setExecutionLog([]), []);

  const walletAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  const totalPortfolioValue =
    tokens.reduce((sum, t) => sum + t.balance * t.usdPrice, 0) +
    activePositions.reduce((sum, p) => sum + p.currentValue, 0);

  const totalIdleValue = tokens
    .filter((t) => t.idle)
    .reduce((sum, t) => sum + t.balance * t.usdPrice, 0);
  const totalActiveValue = activePositions.reduce(
    (sum, p) => sum + p.currentValue,
    0,
  );

  const value = {
    connected,
    walletAddress,
    tokens,
    activePositions,
    riskProfile,
    allocation,
    simulationSteps,
    isSimulating,
    isExecuting,
    executionLog,
    solPrice,
    totalPortfolioValue,
    totalIdleValue,
    totalActiveValue,
    loadingTokens,
    connectWallet: () => {}, // handled by wallet adapter modal now
    disconnectWallet,
    updateRiskProfile,
    updateAllocation,
    simulate,
    execute,
    clearLog,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

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
  openPerpPosition,
  placePredictionBet,
} from "../services/jupiter-perps";
import { getSwapOrder, signAndSendSwap, MINTS } from "../services/jupiter-swap";
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
  const wallet = useWallet();
  const { publicKey, connected, disconnect } = wallet;
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
      // const priceRes = await fetch(`/api/jup-price?ids=${mints}`);
      const priceUrl = import.meta.env.DEV
        ? `/api/jup-price?ids=${mints}`
        : `/.netlify/functions/jup-price?ids=${mints}`;
      const priceRes = await fetch(priceUrl);
      const priceData = await priceRes.json();
      // console.log("Price data:", JSON.stringify(priceData));

      // Fetch token metadata from Jupiter for symbol/name
      for (const token of walletTokens) {
        if (priceData[token.mint]) {
          token.usdPrice = parseFloat(priceData[token.mint].usdPrice);
        }
        // Get metadata for non-SOL tokens
        if (token.mint !== "So11111111111111111111111111111111111111112") {
          try {
            // const metaRes = await fetch(
            //   `/api/jup-tokens/search?query=${token.mint}`,
            // );
            const metaUrl = import.meta.env.DEV
              ? `/api/jup-tokens/search?query=${token.mint}`
              : `/.netlify/functions/jup-tokens?query=${token.mint}`;
            const metaRes = await fetch(metaUrl);
            if (metaRes.ok) {
              const meta = await metaRes.json();
              if (Array.isArray(meta) && meta.length > 0) {
                token.symbol = meta[0].symbol || token.symbol;
                token.name = meta[0].name || token.name;
                // token.icon = meta[0].icon || token.icon;
              }
            }
          } catch {
            /* keep defaults */
          }
        }
      }

      if (priceData["So11111111111111111111111111111111111111112"]) {
        setSolPrice(
          parseFloat(
            priceData["So11111111111111111111111111111111111111112"].usdPrice,
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

  // ====== Simulate Function ======
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

  // ===== Execute Function ======

  const execute = useCallback(async () => {
    if (simulationSteps.length === 0) return;
    setIsExecuting(true);

    for (let i = 0; i < simulationSteps.length; i++) {
      setSimulationSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "executing" } : s)),
      );

      const step = simulationSteps[i];
      console.log("Step:", JSON.stringify(step));
      let txHash = null;

      try {
        // Try real swap for swap-type steps
        if (
          step.type === "swap" &&
          step.api === "Swap V2" &&
          publicKey &&
          tokens.length > 0
        ) {
          const mainToken = tokens[0];
          const swapAmountUsd = parseFloat(
            step.action.match(/\$(\d+\.?\d*)/)?.[1] || "0",
          );

          if (swapAmountUsd > 0 && mainToken.balance > 0) {
            const swapAmountLamports = Math.floor(
              (swapAmountUsd / mainToken.usdPrice) *
                Math.pow(10, mainToken.decimals),
            );

            addLogEntry(
              "system",
              `Getting swap order: ${mainToken.symbol} → USDC...`,
            );

            const order = await getSwapOrder(
              mainToken.mint,
              MINTS.USDC,
              swapAmountLamports,
              publicKey.toBase58(),
            );

            addLogEntry("system", `Order received. Signing transaction...`);

            txHash = await signAndSendSwap(order, wallet, connection);

            addLogEntry("execute", `Swap confirmed: ${step.action}`, txHash);
          } else {
            // Insufficient balance — simulate
            await new Promise((r) => setTimeout(r, 1000));
            txHash = generateMockTxHash();
            addLogEntry(
              "execute",
              `${step.action} (simulated — insufficient balance)`,
              txHash,
            );
          }
        } else if (
          step.type === "order" &&
          step.api === "Trigger" &&
          publicKey &&
          tokens.length > 0
        ) {
          const mainToken = tokens[0];
          const tradeAmountUsd = parseFloat(
            step.action.match(/\$(\d+\.?\d*)/)?.[1] || "0",
          );

          if (
            tradeAmountUsd > 0 &&
            mainToken.balance > 0 &&
            mainToken.usdPrice > 0
          ) {
            const tradeAmount = Math.floor(
              (tradeAmountUsd / mainToken.usdPrice) *
                Math.pow(10, mainToken.decimals),
            );

            const tpMatch = step.detail.match(/TP: \$(\d+\.?\d*)/);
            const slMatch = step.detail.match(/SL: \$(\d+\.?\d*)/);
            const tpPrice = tpMatch
              ? parseFloat(tpMatch[1])
              : mainToken.usdPrice * 1.12;
            const slPrice = slMatch
              ? parseFloat(slMatch[1])
              : mainToken.usdPrice * 0.95;

            addLogEntry("system", `Authenticating with Trigger API...`);

            try {
              const { createTriggerOrder } =
                await import("../services/jupiter-trigger");

              addLogEntry(
                "system",
                `Creating OCO order: TP $${tpPrice.toFixed(2)} / SL $${slPrice.toFixed(2)}...`,
              );

              const order = await createTriggerOrder(
                wallet,
                publicKey,
                connection,
                {
                  inputMint: mainToken.mint,
                  outputMint: MINTS.USDC,
                  amount: tradeAmount,
                  triggerMint: mainToken.mint,
                  orderType: "oco",
                  tpPrice,
                  slPrice,
                },
              );

              txHash = order.txSignature || order.id;
              addLogEntry(
                "execute",
                `OCO order created: TP $${tpPrice.toFixed(2)} / SL $${slPrice.toFixed(2)}`,
                txHash,
              );
            } catch (err) {
              addLogEntry("system", `Trigger order simulated: ${err.message}`);
              await new Promise((r) => setTimeout(r, 1000));
              txHash = generateMockTxHash();
              addLogEntry("execute", `${step.action} (simulated)`, txHash);
            }
          } else {
            await new Promise((r) => setTimeout(r, 1000));
            txHash = generateMockTxHash();
            addLogEntry(
              "execute",
              `${step.action} (simulated — insufficient balance)`,
              txHash,
            );
          }
        } else if (
          step.type === "order" &&
          step.api === "Recurring" &&
          publicKey &&
          tokens.length > 0
        ) {
          const mainToken = tokens[0];
          const dcaAmountUsd = parseFloat(
            step.action.match(/\$(\d+\.?\d*)/)?.[1] || "0",
          );

          if (dcaAmountUsd > 0 && mainToken.usdPrice > 0) {
            const totalAmount = Math.floor(
              (dcaAmountUsd / mainToken.usdPrice) *
                Math.pow(10, mainToken.decimals),
            );

            addLogEntry(
              "system",
              `Creating DCA: USDC → ${mainToken.symbol} weekly over 4 weeks...`,
            );

            try {
              const { createDCAOrder } =
                await import("../services/jupiter-dca");

              txHash = await createDCAOrder(wallet, publicKey, connection, {
                inputMint: MINTS.USDC,
                outputMint: mainToken.mint,
                amount: totalAmount,
                numberOfOrders: 4,
                interval: 604800,
              });

              addLogEntry(
                "execute",
                `DCA order created: ${step.action}`,
                txHash,
              );
            } catch (err) {
              addLogEntry("system", `DCA simulated: ${err.message}`);
              await new Promise((r) => setTimeout(r, 1000));
              txHash = generateMockTxHash();
              addLogEntry("execute", `${step.action} (simulated)`, txHash);
            }
          } else {
            await new Promise((r) => setTimeout(r, 1000));
            txHash = generateMockTxHash();
            addLogEntry(
              "execute",
              `${step.action} (simulated — insufficient balance)`,
              txHash,
            );
          }
        } else if (
          step.type === "hedge" &&
          step.api === "Prediction Markets" &&
          publicKey
        ) {
          const betAmount = parseFloat(
            step.action.match(/\$(\d+\.?\d*)/)?.[1] || "0",
          );

          if (betAmount > 0) {
            addLogEntry("system", `Placing prediction market hedge...`);
            try {
              const mainToken = tokens[0]?.symbol || "SOL";
              const result = await placePredictionBet(
                `${mainToken}-downside`,
                "NO",
                Math.floor(betAmount * 1e6),
                publicKey,
              );
              txHash = await signAndSendSwap(result, wallet, connection);
              addLogEntry(
                "execute",
                `Prediction hedge placed: ${step.action}`,
                txHash,
              );
            } catch (err) {
              addLogEntry(
                "system",
                `Prediction market simulated: ${err.message}`,
              );
              await new Promise((r) => setTimeout(r, 1000));
              txHash = generateMockTxHash();
              addLogEntry("execute", `${step.action} (simulated)`, txHash);
            }
          } else {
            await new Promise((r) => setTimeout(r, 1000));
            txHash = generateMockTxHash();
            addLogEntry("execute", `${step.action} (simulated)`, txHash);
          }
        } else if (step.type === "hedge" && step.api === "Perps" && publicKey) {
          const perpAmount = parseFloat(
            step.action.match(/\$(\d+\.?\d*)/)?.[1] || "0",
          );
          const leverageMatch = step.action.match(/(\d+\.?\d*)x/);
          const leverage = leverageMatch ? parseFloat(leverageMatch[1]) : 2;

          if (perpAmount > 0) {
            addLogEntry("system", `Opening ${leverage}x short hedge...`);
            try {
              const result = await openPerpPosition(
                "SOL-PERP",
                "short",
                Math.floor(perpAmount * 1e6),
                leverage,
                publicKey,
              );
              txHash = await signAndSendSwap(result, wallet, connection);
              addLogEntry(
                "execute",
                `Perp position opened: ${step.action}`,
                txHash,
              );
            } catch (err) {
              addLogEntry("system", `Perp position simulated: ${err.message}`);
              await new Promise((r) => setTimeout(r, 1000));
              txHash = generateMockTxHash();
              addLogEntry("execute", `${step.action} (simulated)`, txHash);
            }
          } else {
            await new Promise((r) => setTimeout(r, 1000));
            txHash = generateMockTxHash();
            addLogEntry("execute", `${step.action} (simulated)`, txHash);
          }
        } else {
          // Other steps — simulate for now
          await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
          txHash = generateMockTxHash();
          addLogEntry("execute", `${step.action} (simulated)`, txHash);
        }

        setSimulationSteps((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: "complete", txHash } : s,
          ),
        );
      } catch (err) {
        console.error(`Step ${i + 1} failed:`, err);
        txHash = null;
        addLogEntry("system", `Step ${i + 1} failed: ${err.message}`);

        setSimulationSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "failed" } : s)),
        );
      }
    }

    setIsExecuting(false);
    addLogEntry("system", "Strategy execution complete");

    // Refresh token balances after execution
    if (connected && publicKey) {
      setTimeout(() => fetchTokens(), 3000);
    }
  }, [simulationSteps, publicKey, tokens, wallet, connection, connected]);

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

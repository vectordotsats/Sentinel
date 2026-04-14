import React, { useState, useEffect } from "react";
import { Vault, ArrowUpRight, Search, Loader2 } from "lucide-react";
import { fetchKaminoVaults } from "../services/kamino";

const riskBadge = {
  Low: "bg-sentinel-success/10 text-sentinel-success border-sentinel-success/30",
  Medium: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  High: "bg-sentinel-danger/10 text-sentinel-danger border-sentinel-danger/30",
};

export default function KaminoVaults() {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("apy");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchKaminoVaults();
      setVaults(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = vaults
    .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sortBy === "apy" ? b.apy - a.apy : b.tvl - a.tvl));

  return (
    <div className="rounded-xl border border-sentinel-border bg-sentinel-card">
      <div className="flex items-center justify-between border-b border-sentinel-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Vault className="h-4 w-4 text-sentinel-highlight" />
          <h3 className="text-sm font-semibold text-sentinel-textBright">
            Kamino Vaults
          </h3>
          <span className="text-[10px] text-sentinel-muted">Live</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-sentinel-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-28 rounded-lg border border-sentinel-border bg-sentinel-surface py-1 pl-7 pr-2 text-xs text-sentinel-text placeholder:text-sentinel-muted focus:border-sentinel-accent focus:outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-sentinel-border bg-sentinel-surface px-2 py-1 text-xs text-sentinel-text focus:border-sentinel-accent focus:outline-none"
          >
            <option value="apy">APY ↓</option>
            <option value="tvl">TVL ↓</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 text-sentinel-accent animate-spin" />
            <span className="ml-2 text-sm text-sentinel-muted">
              Loading vaults...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-sentinel-muted">
            No vaults found
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-sentinel-border text-[10px] uppercase tracking-wider text-sentinel-muted">
                <th className="px-5 py-2.5">Vault</th>
                <th className="px-3 py-2.5">TVL</th>
                <th className="px-3 py-2.5">APY</th>
                <th className="px-3 py-2.5">Risk</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sentinel-border">
              {filtered.map((vault) => (
                <tr
                  key={vault.address}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-sentinel-textBright">
                      {vault.name}
                    </p>
                    <p className="text-[10px] text-sentinel-muted font-mono">
                      {vault.address.slice(0, 6)}...{vault.address.slice(-4)}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-sm font-mono text-sentinel-text">
                    $
                    {vault.tvl >= 1e6
                      ? (vault.tvl / 1e6).toFixed(1) + "M"
                      : vault.tvl >= 1e3
                        ? (vault.tvl / 1e3).toFixed(0) + "K"
                        : vault.tvl.toFixed(0)}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm font-semibold font-mono text-sentinel-success">
                      {vault.apy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${riskBadge[vault.risk]}`}
                    >
                      {vault.risk}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <a
                      href={`https://app.kamino.finance/lending/earn/${vault.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-sentinel-border p-1.5 text-sentinel-muted hover:border-sentinel-accent hover:text-sentinel-accent transition-colors inline-flex"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

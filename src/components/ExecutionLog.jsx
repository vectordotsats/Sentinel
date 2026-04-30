import React from "react";
import {
  ScrollText,
  Trash2,
  ExternalLink,
  Zap,
  Play,
  Monitor,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const typeIcons = {
  simulate: { icon: Play, color: "text-sentinel-accent" },
  execute: { icon: Zap, color: "text-sentinel-success" },
  system: { icon: Monitor, color: "text-sentinel-muted" },
};

export default function ExecutionLog() {
  const { executionLog, clearLog } = useApp();

  return (
    <div className="rounded-xl border border-sentinel-border bg-sentinel-card">
      <div className="flex items-center justify-between border-b border-sentinel-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-sentinel-muted" />
          <h3 className="text-sm font-semibold text-sentinel-textBright">
            Execution Log
          </h3>
          <span className="rounded-full bg-sentinel-surface px-2 py-0.5 text-[10px] font-mono text-sentinel-muted">
            {executionLog.length}
          </span>
        </div>
        {executionLog.length > 0 && (
          <button
            onClick={clearLog}
            className="flex items-center gap-1 rounded-lg border border-sentinel-border px-2 py-1 text-[10px] text-sentinel-muted hover:border-sentinel-danger/50 hover:text-sentinel-danger transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="max-h-64 sm:max-h-[32rem] overflow-y-auto">
        {executionLog.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-sentinel-muted">
            No activity yet
          </div>
        ) : (
          <div className="divide-y divide-sentinel-border">
            {executionLog.map((entry) => {
              const config = typeIcons[entry.type] || typeIcons.system;
              const Icon = config.icon;
              const time = new Date(entry.timestamp).toLocaleTimeString();

              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-5 py-2.5 hover:bg-white/[0.02]"
                >
                  <Icon
                    className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${config.color}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-sentinel-text truncate">
                      {entry.message}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-sentinel-muted">
                        {time}
                      </span>
                      {entry.txHash && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-sentinel-accent">
                          {entry.txHash.slice(0, 8)}...
                          <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Shield, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ModelSelector } from "../common/ModelSelector";

export const Header = ({ onRefresh, refreshing = false }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
      {/* System Status */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-subtle border border-border rounded text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-200 font-semibold">SYSTEM OPERATIONAL</span>
        </div>

        <div className="hidden sm:flex items-center">
          <ModelSelector variant="compact" />
        </div>
      </div>

      {/* Header Actions & Profile Tag */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1.5 text-zinc-300 hover:text-white bg-surface-subtle hover:bg-surface-hover border border-border rounded transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        )}

        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border text-xs font-mono text-zinc-400">
          <Shield className="w-3.5 h-3.5 text-zinc-300" />
          <span>BRANCH:</span>
          <span className="text-zinc-200 font-semibold">{user?.branch || "HQ Risk Division"}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

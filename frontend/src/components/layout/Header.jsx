import React from "react";
import { Activity, Shield, Bell, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Header = ({ onRefresh, refreshing = false }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-surface border-b border-border px-6 flex items-center justify-between shrink-0 select-none">
      {/* System Status Indicators */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-subtle border border-border rounded text-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-neutral-300 font-medium">SYSTEM OPERATIONAL</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-muted text-[11px]">
          <span>ML ENGINE:</span>
          <span className="text-emerald-400 font-semibold">XGBOOST V2.4</span>
        </div>
      </div>

      {/* Header Actions & Profile Tag */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1.5 text-muted hover:text-white bg-surface-subtle hover:bg-surface-hover border border-border rounded transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        )}

        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border text-xs font-mono text-muted">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>BRANCH:</span>
          <span className="text-neutral-200">{user?.branch || "HQ Risk Division"}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

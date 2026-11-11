import React from "react";
import { Shield, RefreshCw, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ModelSelector } from "../common/ModelSelector";

export const Header = ({
  onToggleSidebar,
  sidebarCollapsed = false,
  onRefresh,
  refreshing = false
}) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-surface border-b border-border px-3.5 sm:px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Mobile Toggle & System Status */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-surface-subtle border border-border/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={sidebarCollapsed ? "Open navigation menu" : "Close navigation menu"}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-subtle border border-border rounded-md text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-200 font-semibold text-[11px] sm:text-xs">SYSTEM OPERATIONAL</span>
        </div>

        <div className="hidden lg:flex items-center">
          <ModelSelector variant="compact" />
        </div>
      </div>

      {/* Header Actions & Profile Tag */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 text-zinc-300 hover:text-white bg-surface-subtle hover:bg-surface-hover border border-border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            title="Refresh Data"
            aria-label="Refresh telemetry data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`}
            />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border text-xs font-mono text-zinc-400">
          <Shield className="w-3.5 h-3.5 text-zinc-300" />
          <span>BRANCH:</span>
          <span className="text-zinc-200 font-semibold">{user?.branch || "HQ Risk Division"}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

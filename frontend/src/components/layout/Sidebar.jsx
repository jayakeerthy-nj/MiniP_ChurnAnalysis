import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PieChart,
  ShieldAlert,
  TrendingDown,
  Sparkles,
  Sliders,
  FileText,
  ShieldCheck,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CmdLogo } from "../common/CmdLogo";
import clsx from "clsx";

export const Sidebar = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/segments", label: "Segments", icon: PieChart },
    { to: "/risk", label: "Risk Matrix", icon: ShieldAlert },
    { to: "/churn", label: "Churn Analytics", icon: TrendingDown },
    { to: "/recommendations", label: "Recommendations", icon: Sparkles },
    { to: "/simulator", label: "What-If Simulator", icon: Sliders },
    { to: "/reports", label: "Reports", icon: FileText }
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-panel">
        <Link to="/" title="Go to Landing Page">
          <CmdLogo size="md" />
        </Link>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-bold text-muted-dark uppercase tracking-wider px-3 pb-2 font-mono">
          Analytics Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors group",
                  isActive
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "text-muted hover:text-neutral-200 hover:bg-surface-subtle"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-muted group-hover:text-neutral-200"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Administration Section */}
        <div className="pt-4 mt-4 border-t border-border">
          <div className="text-[10px] font-bold text-muted-dark uppercase tracking-wider px-3 pb-2 font-mono">
            Administration
          </div>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors group",
                isActive
                  ? "bg-primary text-white font-semibold shadow-sm"
                  : "text-muted hover:text-neutral-200 hover:bg-surface-subtle"
              )
            }
          >
            {({ isActive }) => (
              <>
                <ShieldCheck
                  className={clsx(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-muted group-hover:text-neutral-200"
                  )}
                />
                <span className="flex-1">Admin Portal</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </>
            )}
          </NavLink>
        </div>
      </div>

      {/* Role Quick-Switch Bar */}
      <div className="px-3 py-2 bg-panel border-t border-border">
        <div className="flex items-center justify-between text-[10px] text-muted font-mono mb-1.5 px-1">
          <span>Active Role</span>
          <span className="text-primary font-bold">{user?.role || "GUEST"}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {["ADMIN", "ANALYST", "MANAGER"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => switchRole(r)}
              className={clsx(
                "py-1 px-1.5 text-[10px] font-mono rounded font-medium border text-center transition-all",
                user?.role === r
                  ? "bg-primary/20 text-primary border-primary/50"
                  : "bg-surface-subtle text-muted hover:text-neutral-200 border-border hover:border-border-light"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 bg-surface border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded bg-surface-subtle border border-border flex items-center justify-center text-xs font-mono text-neutral-300 font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-neutral-200 truncate">
              {user?.name || "Authenticated User"}
            </div>
            <div className="text-[10px] text-muted font-mono truncate">
              {user?.email || "user@bank.com"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 text-muted hover:text-red-400 hover:bg-surface-subtle rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

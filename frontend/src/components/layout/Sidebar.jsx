import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";
import { CmdLogo } from "../common/CmdLogo";
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
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Lock
} from "lucide-react";

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  // Navigation Items defined with explicit RBAC role permissions
  const allNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "ANALYST", "MANAGER"] },
    { to: "/customers", label: "Customers", icon: Users, roles: ["ADMIN", "ANALYST", "MANAGER"] },
    { to: "/segments", label: "Segments", icon: PieChart, roles: ["ADMIN", "ANALYST"] },
    { to: "/risk", label: "Risk Matrix", icon: ShieldAlert, roles: ["ADMIN", "ANALYST"] },
    { to: "/churn", label: "Churn Intelligence", icon: TrendingDown, roles: ["ADMIN", "ANALYST"] },
    { to: "/recommendations", label: "Recommendations", icon: Sparkles, roles: ["ADMIN", "ANALYST", "MANAGER"] },
    { to: "/simulator", label: "What-If Simulator", icon: Sliders, roles: ["ADMIN", "ANALYST"] },
    { to: "/reports", label: "Reports", icon: FileText, roles: ["ADMIN", "ANALYST", "MANAGER"] }
  ];

  const currentRole = user?.role || "GUEST";
  // Filter nav items so users ONLY see features permitted for their role
  const navItems = allNavItems.filter((item) => item.roles.includes(currentRole));

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside
      className={clsx(
        "bg-surface border-r border-border flex flex-col h-screen select-none shrink-0 transition-all duration-300 ease-in-out z-30",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-3.5 bg-panel">
        {!collapsed ? (
          <>
            <Link to="/" title="Go to Landing Page" className="flex items-center min-w-0">
              <CmdLogo size="md" />
            </Link>
            {setCollapsed && (
              <button
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar taskbar"
                className="p-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-surface-subtle transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            {setCollapsed ? (
              <button
                onClick={() => setCollapsed(false)}
                title="Expand sidebar taskbar"
                className="p-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-surface-subtle transition-colors"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded bg-neutral-900 border border-border flex items-center justify-center font-mono font-black text-white text-xs">
                <span>cmd</span>
                <span className="text-emerald-400">.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Navigation - Filtered by Active Role */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {!collapsed && (
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 pb-2 font-mono flex items-center justify-between">
            <span>Analytics Platform</span>
            <span className="text-[9px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700">
              {currentRole}
            </span>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                clsx(
                  "flex items-center rounded-lg text-[13px] font-medium transition-all group",
                  collapsed
                    ? "w-10 h-10 mx-auto justify-center"
                    : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-zinc-800 text-white font-semibold ring-1 ring-zinc-700 shadow-sm"
                    : "text-zinc-200 hover:text-white hover:bg-zinc-800/60"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-zinc-300 group-hover:text-white"
                    )}
                  />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Administration Section - EXCLUSIVELY VISIBLE TO ADMIN */}
        {currentRole === "ADMIN" && (
          <div className={clsx("mt-3 pt-3 border-t border-border/80", collapsed && "border-t border-border")}>
            {!collapsed && (
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 pb-2 font-mono">
                Administration
              </div>
            )}

            <NavLink
              to="/admin"
              title={collapsed ? "Admin Portal" : undefined}
              className={({ isActive }) =>
                clsx(
                  "flex items-center rounded-lg text-[13px] font-medium transition-all group",
                  collapsed
                    ? "w-10 h-10 mx-auto justify-center"
                    : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-zinc-800 text-white font-semibold ring-1 ring-zinc-700 shadow-sm"
                    : "text-zinc-200 hover:text-white hover:bg-zinc-800/60"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck
                    className={clsx(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-zinc-300 group-hover:text-white"
                    )}
                  />
                  {!collapsed && <span className="flex-1 truncate">Admin Portal</span>}
                  {!collapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </>
              )}
            </NavLink>
          </div>
        )}
      </div>

      {/* Role Quick-Switch Bar */}
      {!collapsed ? (
        <div className="px-3 py-2.5 bg-panel border-t border-border">
          <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono mb-1.5 px-1">
            <span className="font-semibold">Active Role</span>
            <span className="text-white font-bold bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
              {currentRole}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {["ADMIN", "ANALYST", "MANAGER"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={clsx(
                  "py-1 px-1.5 text-[10.5px] font-mono rounded font-semibold border text-center transition-all",
                  currentRole === r
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-surface-subtle text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-2 flex justify-center border-t border-border bg-panel">
          <span
            title={`Role: ${currentRole}`}
            className="w-8 h-6 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono font-bold text-white flex items-center justify-center"
          >
            {currentRole ? currentRole.charAt(0) : "G"}
          </span>
        </div>
      )}

      {/* User Footer Profile */}
      <div className="p-3 bg-surface border-t border-border flex items-center justify-between gap-2">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono text-white font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-zinc-100 truncate">
                  {user?.name || "Authenticated User"}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">
                  {user?.email || "user@bank.com"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-surface-subtle rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            title={`Sign Out (${user?.name || "User"})`}
            className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

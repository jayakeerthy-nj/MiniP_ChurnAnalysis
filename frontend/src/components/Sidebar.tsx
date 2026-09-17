"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CmdLogo } from "./CmdLogo";
import { useAuthStore } from "../stores/authStore";
import {
  Terminal,
  LayoutDashboard,
  Users,
  AlertTriangle,
  Sliders,
  PieChart,
  TrendingDown,
  Sparkles,
  FileText,
  ShieldCheck,
  LogOut,
  ArrowLeft
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { activeTab, setActiveTab, user, switchRole, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { id: "dashboard", fKey: "1", label: "Dashboard", icon: LayoutDashboard },
    { id: "customers", fKey: "2", label: "Customer 360", icon: Users },
    { id: "risk", fKey: "3", label: "Risk Watchlist", icon: AlertTriangle },
    { id: "simulator", fKey: "4", label: "What-If Engine", icon: Sliders },
    { id: "segments", fKey: "5", label: "Segments", icon: PieChart },
    { id: "churn", fKey: "6", label: "Churn Analytics", icon: TrendingDown },
    { id: "recommendations", fKey: "7", label: "Retention Engine", icon: Sparkles },
    { id: "reports", fKey: "8", label: "Reports", icon: FileText },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ id: "admin", fKey: "9", label: "Admin Console", icon: ShieldCheck });
  }

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Terminal size={18} />
          </div>
          <span className="brand-title">CMD</span>
          <span className="text-[10px] text-[#8b9098] bg-[#f1f3f5] px-1.5 py-0.5 border border-[#e2e4e8] rounded-[2px] ml-auto font-bold">
            v4.2
          </span>
        </div>

        {/* Back link */}
        <div className="px-2 pt-1 pb-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[11px] text-[#8b9098] hover:text-[#3d7eff] transition-colors py-1 px-1 font-mono uppercase"
          >
            <ArrowLeft size={12} />
            <span>[ ESC: LANDING ]</span>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="nav-stack">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-link text-left w-full cursor-pointer ${isActive ? "active" : ""}`}
              >
                <span className="text-[9px] font-bold text-[#3d7eff] bg-[#3d7eff]/10 border border-[#3d7eff]/20 px-1 py-0.2 rounded-[2px]">
                  [{item.fKey}]
                </span>
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User / Role Switcher */}
      <div className="sidebar-footer">
        {/* Quick Role Switcher */}
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-[#8b9098] uppercase px-1">
            DESK PRESET:
          </span>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <button
              onClick={() => switchRole("ANALYST")}
              className={`py-1 px-0.5 border text-center font-bold rounded-[2px] cursor-pointer ${
                user?.role === "ANALYST"
                  ? "bg-[#3d7eff] text-white border-[#3d7eff]"
                  : "bg-[#f8f9fa] text-[#8b9098] border-[#e2e4e8] hover:border-[#b3b3b3]"
              }`}
            >
              ANL
            </button>
            <button
              onClick={() => switchRole("MANAGER")}
              className={`py-1 px-0.5 border text-center font-bold rounded-[2px] cursor-pointer ${
                user?.role === "MANAGER"
                  ? "bg-[#3d7eff] text-white border-[#3d7eff]"
                  : "bg-[#f8f9fa] text-[#8b9098] border-[#e2e4e8] hover:border-[#b3b3b3]"
              }`}
            >
              MGR
            </button>
            <button
              onClick={() => switchRole("ADMIN")}
              className={`py-1 px-0.5 border text-center font-bold rounded-[2px] cursor-pointer ${
                user?.role === "ADMIN"
                  ? "bg-[#3d7eff] text-white border-[#3d7eff]"
                  : "bg-[#f8f9fa] text-[#8b9098] border-[#e2e4e8] hover:border-[#b3b3b3]"
              }`}
            >
              CRO
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="user-chip">
          <div className="user-avatar">
            {user?.name?.[0]?.toUpperCase() || "O"}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || "Operator"}</span>
            <span className="user-role">{user?.role || "ANALYST"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto text-[#8b9098] hover:text-[#ef4444] p-1 cursor-pointer"
            title="Log out from CMD Terminal"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};

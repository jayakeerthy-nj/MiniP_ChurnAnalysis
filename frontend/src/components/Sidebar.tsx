"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import {
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
  UserCheck,
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
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "customers", label: "Customer 360", icon: Users },
    { id: "risk", label: "Risk Watchlist", icon: AlertTriangle },
    { id: "simulator", label: "What-If Engine", icon: Sliders },
    { id: "segments", label: "Segments", icon: PieChart },
    { id: "churn", label: "Churn Analytics", icon: TrendingDown },
    { id: "recommendations", label: "Retention Engine", icon: Sparkles },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ id: "admin", label: "Admin Console", icon: ShieldCheck });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <span className="brand-title">AegisRisk</span>
        </div>
      </div>

      <div className="px-3 pt-1 pb-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-[11px] font-semibold text-[#94a3b8] hover:text-white px-2.5 py-1.5 rounded-lg bg-[#141820] hover:bg-[#1c222c] border border-[#1d232c] transition-all"
        >
          <ArrowLeft size={13} className="text-[#00b4d8]" />
          <span>Landing Page</span>
        </Link>
      </div>

      <nav className="nav-stack">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === "customers" && activeTab === "customer-detail");
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-link text-left w-full flex items-center gap-2.5 transition-colors ${
                isActive ? "active" : ""
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role Switcher & Profile */}
      <div className="sidebar-footer">
        <div className="mb-2.5 px-1 flex items-center justify-between text-[11px] text-[#64748b]">
          <span>ACTIVE ROLE</span>
          <div className="flex gap-1">
            {(["ADMIN", "ANALYST", "MANAGER"] as const).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                  user?.role === r ? "bg-[#00b4d8] text-black font-semibold" : "bg-[#1c222c] text-[#94a3b8] hover:text-white"
                }`}
              >
                {r[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="user-chip">
          <div className="user-avatar">
            {user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "AK"}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || "Arjun Kapoor"}</span>
            <span className="user-role font-mono text-[10px]">{user?.role || "ADMIN"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <button
            onClick={() => router.push("/login")}
            className="btn-cyan-action text-[11px] py-1.5 justify-center"
            title="Switch Persona / Login"
          >
            <UserCheck size={13} />
            <span>Switch</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#1c222c] hover:bg-red-500/20 text-[#94a3b8] hover:text-red-400 border border-[#27303d] text-[11px] font-semibold transition-all"
            title="Sign out of AegisRisk"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

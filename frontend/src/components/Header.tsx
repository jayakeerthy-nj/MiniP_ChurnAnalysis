"use client";

import React from "react";
import { useAuthStore } from "../stores/authStore";
import { ChevronDown, RefreshCw, Sliders } from "lucide-react";

export const Header: React.FC = () => {
  const { user, setActiveTab } = useAuthStore();

  return (
    <header className="header-strip">
      <div>
        <h1 className="welcome-heading">Welcome back, {user?.name?.split(" ")[0] || "Admin"}</h1>
        <p className="welcome-sub">
          Portfolio Intelligence & Bullseye Churn Risk Monitoring &bull; <span className="font-mono text-cyanMain">{user?.role} ACCESS</span>
        </p>
      </div>
      <div className="header-actions flex items-center gap-3">
        <div className="dropdown-pill flex items-center gap-1.5 cursor-pointer">
          <span>Portfolio: Retail Tier-1</span>
          <ChevronDown size={13} />
        </div>
        <button
          onClick={() => setActiveTab("simulator")}
          className="btn-cyan-sm flex items-center gap-1.5"
        >
          <Sliders size={13} />
          <span>What-If Simulator</span>
        </button>
      </div>
    </header>
  );
};
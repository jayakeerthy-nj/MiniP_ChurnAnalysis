"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { CmdLogo } from "./CmdLogo";
import { Terminal, Sliders, FileDown, Search } from "lucide-react";

export const Header: React.FC = () => {
  const { user, setActiveTab } = useAuthStore();
  const [commandInput, setCommandInput] = useState("");
  const [clockStr, setClockStr] = useState("00:00:00 UTC");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClockStr(d.toUTCString().split(" ")[4] + " UTC");
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (cmd.includes("sim") || cmd.includes("what")) {
      setActiveTab("simulator");
    } else if (cmd.includes("risk") || cmd.includes("watch")) {
      setActiveTab("risk");
    } else if (cmd.includes("cust") || cmd.includes("360")) {
      setActiveTab("customers");
    } else if (cmd.includes("churn") || cmd.includes("attrition")) {
      setActiveTab("churn");
    } else if (cmd.includes("seg")) {
      setActiveTab("segments");
    } else if (cmd.includes("rec") || cmd.includes("retention")) {
      setActiveTab("recommendations");
    } else if (cmd.includes("rep")) {
      setActiveTab("reports");
    } else if (cmd.includes("admin")) {
      setActiveTab("admin");
    } else if (cmd.includes("dash")) {
      setActiveTab("dashboard");
    }
    setCommandInput("");
  };

  return (
    <header className="flex flex-col gap-2 w-full bg-[#ffffff] border border-[#e2e4e8] p-2.5 rounded-[2px] font-mono text-xs shadow-sm">
      {/* Top Telemetry Line */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e4e8] pb-2">
        <div className="flex items-center gap-3">
          <CmdLogo size="sm" showSubtitle={false} />
          <span className="text-[#d4d4d4]">|</span>
          <span className="text-[#8b9098] uppercase hidden md:inline font-mono font-semibold text-[11px]">CHURN MODELING & DECISION ENGINE</span>
          <span className="text-[#d4d4d4] hidden md:inline">|</span>
          <span className="inline-flex items-center gap-1.5 text-[#10b981] font-bold">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#10b981]"></span>
            LIVE
          </span>
          <span className="text-[#8b9098] font-mono hidden sm:inline">{clockStr}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-[#6b7280] bg-[#f8f9fa] border border-[#e2e4e8] px-2 py-0.5 rounded-[2px]">
            DESK: <span className="text-[#2f2f34] font-bold">{user?.name?.split(" ")[0] || "OPERATOR"}</span> [
            <span className="text-[#3d7eff] font-bold">{user?.role || "ANALYST"}</span>]
          </div>

          <button
            onClick={() => setActiveTab("simulator")}
            className="btn-blue-sm flex items-center gap-1.5 py-1 px-2.5 cursor-pointer"
            title="Execute What-If Churn Simulator"
          >
            <Sliders size={12} />
            <span>[ SIMULATOR ]</span>
          </button>
        </div>
      </div>

      {/* Command Bar Input Line */}
      <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 bg-[#f8f9fa] px-2.5 py-1 border border-[#e2e4e8] rounded-[2px]">
        <span className="text-[#3d7eff] font-extrabold select-none">&gt;</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Enter command (/dashboard, /risk, /watchlist, /simulate, /customers, /churn, /reports, /admin)..."
          className="flex-1 bg-transparent text-[#2f2f34] placeholder-[#8b9098] text-xs outline-none font-mono"
        />
        <span className="text-[10px] text-[#8b9098] uppercase hidden sm:inline">[PRESS ENTER TO EXECUTE]</span>
      </form>
    </header>
  );
};

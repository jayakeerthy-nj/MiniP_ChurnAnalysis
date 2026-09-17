"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Sliders,
  Users,
  ArrowRight,
  BarChart2,
  TrendingDown,
  Activity,
  CheckCircle2,
  Layers,
  Sparkles,
  Zap,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { CmdLogo } from "@/components/CmdLogo";
import { useAuthStore } from "@/stores/authStore";

export default function LandingPage() {
  const router = useRouter();
  const { loginDemoProfile } = useAuthStore();
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [simulatedIntervention, setSimulatedIntervention] = useState(false);
  const [activeTab, setActiveTab] = useState<"shap" | "segments" | "simulator">("shap");

  const demoRoles = [
    {
      key: "Chief Risk Officer",
      name: "Arjun Kapoor",
      badge: "ADMIN",
      role: "Executive Portfolio & Governance",
      avatar: "AK",
      color: "bg-[#3d7eff] text-white",
    },
    {
      key: "Risk Analyst",
      name: "Priya Sharma",
      badge: "ANALYST",
      role: "SHAP Explainability & Risk Watchlists",
      avatar: "PS",
      color: "bg-[#10b981] text-white",
    },
    {
      key: "Branch Manager",
      name: "Vikram Mehta",
      badge: "MANAGER",
      role: "Branch Retention & Customer Outreach",
      avatar: "VM",
      color: "bg-[#f59e0b] text-white",
    },
    {
      key: "Compliance Officer",
      name: "Ananya Deshmukh",
      badge: "ADMIN",
      role: "Model Audit Trail & Fair Lending Logs",
      avatar: "AD",
      color: "bg-[#8b5cf6] text-white",
    },
  ];

  const handleLaunchRole = async (roleKey: string) => {
    setActiveRole(roleKey);
    await loginDemoProfile(roleKey);
    setTimeout(() => {
      router.push("/workspace");
    }, 250);
  };

  // 12-Month Baseline Churn Curve vs Intervened Churn Curve
  const baselineMonths = [
    { month: "Jan", rate: 14.2 },
    { month: "Feb", rate: 15.1 },
    { month: "Mar", rate: 14.8 },
    { month: "Apr", rate: 16.0 },
    { month: "May", rate: 15.5 },
    { month: "Jun", rate: 17.2 },
    { month: "Jul", rate: 18.4 },
    { month: "Aug", rate: 19.2 },
    { month: "Sep", rate: 18.1 },
    { month: "Oct", rate: 16.5 },
    { month: "Nov", rate: 15.8 },
    { month: "Dec", rate: 15.0 },
  ];

  const intervenedMonths = [
    { month: "Jan", rate: 14.2 },
    { month: "Feb", rate: 14.8 },
    { month: "Mar", rate: 13.9 },
    { month: "Apr", rate: 13.5 },
    { month: "May", rate: 12.8 },
    { month: "Jun", rate: 12.1 },
    { month: "Jul", rate: 11.4 },
    { month: "Aug", rate: 10.8 },
    { month: "Sep", rate: 10.2 },
    { month: "Oct", rate: 9.8 },
    { month: "Nov", rate: 9.5 },
    { month: "Dec", rate: 9.2 },
  ];

  const currentPoints = simulatedIntervention ? intervenedMonths : baselineMonths;
  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 30;
  const paddingY = 20;

  const pathD = currentPoints
    .map((p, idx) => {
      const x = paddingX + (idx / (currentPoints.length - 1)) * (svgWidth - paddingX * 2);
      const y = svgHeight - paddingY - ((p.rate - 8) / (22 - 8)) * (svgHeight - paddingY * 2);
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const areaD = `${pathD} L ${svgWidth - paddingX} ${svgHeight - paddingY} L ${paddingX} ${svgHeight - paddingY} Z`;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1e293b] font-sans selection:bg-[#3d7eff] selection:text-white flex flex-col justify-between">
      {/* 1. MINIMALIST TOP NAV */}
      <header className="w-full bg-[#ffffff] border-b border-[#e2e4e8] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <CmdLogo size="md" showSubtitle={true} />
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#f1f5f9] border border-[#e2e8f0] rounded-md text-[11px] font-mono text-[#64748b]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
              <span>FastAPI Inference Microservice Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/login"
              className="px-3.5 py-2 text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-md transition-all font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/workspace"
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md transition-all font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span>Launch Workspace</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION: VALUE PROP + INTERACTIVE TELEMETRY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eff6ff] border border-[#bfdbfe] rounded-full text-xs font-mono font-bold text-[#1d4ed8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
              <span>CHURN MODELING & DECISION ENGINE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-[1.15]">
              Predict Attrition <br className="hidden sm:inline" />
              <span className="text-[#2563eb]">Before Capital Drainage.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl">
              An institutional analytical engine designed for retail banking. Correlating transaction velocity,
              unresolved grievances, balance volatility, and tenure into calibrated machine learning predictions
              with transparent TreeSHAP explainability.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
              <Link
                href="/workspace"
                className="px-5 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-md transition-all flex items-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>EXPLORE RISK WORKSPACE</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/login"
                className="px-4 py-3 bg-[#ffffff] hover:bg-[#f8fafc] text-[#334155] border border-[#cbd5e1] hover:border-[#94a3b8] font-bold rounded-md transition-all shadow-sm"
              >
                <span>DEMO CREDENTIALS</span>
              </Link>
            </div>

            {/* Metric Ticker Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#e2e8f0] font-mono">
              <div className="bg-[#ffffff] p-3 rounded-md border border-[#e2e8f0] shadow-sm">
                <div className="text-[10px] text-[#64748b] font-bold uppercase">Capital Monitored</div>
                <div className="text-base font-extrabold text-[#0f172a] mt-0.5">INR 482.15 Cr</div>
              </div>
              <div className="bg-[#ffffff] p-3 rounded-md border border-[#e2e8f0] shadow-sm">
                <div className="text-[10px] text-[#64748b] font-bold uppercase">Avg Churn Rate</div>
                <div className="text-base font-extrabold text-[#2563eb] mt-0.5">15.2%</div>
              </div>
              <div className="bg-[#ffffff] p-3 rounded-md border border-[#e2e8f0] shadow-sm">
                <div className="text-[10px] text-[#64748b] font-bold uppercase">Model ROC-AUC</div>
                <div className="text-base font-extrabold text-[#10b981] mt-0.5">0.884</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Interactive Analytics Preview (Graphs First!) */}
          <div className="lg:col-span-6">
            <div className="bg-[#0f172a] text-[#f8fafc] rounded-xl p-5 border border-[#1e293b] shadow-2xl font-mono space-y-4">
              {/* Telemetry Window Header */}
              <div className="flex items-center justify-between border-b border-[#334155] pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                  <span className="text-[#94a3b8] font-bold ml-1 text-[11px]">
                    cmd.telemetry // 12-MONTH ATTRITION TRAJECTORY
                  </span>
                </div>
                <span className="text-[#38bdf8] text-[10px] font-bold bg-[#0284c7]/20 border border-[#0284c7]/30 px-2 py-0.5 rounded">
                  {simulatedIntervention ? "PROJECTION: -38.4% RISK" : "BASELINE OBSERVED"}
                </span>
              </div>

              {/* Interactive Simulation Toggle */}
              <div className="flex items-center justify-between bg-[#1e293b] p-2.5 rounded-md text-xs">
                <span className="text-[#cbd5e1] text-[11px]">
                  What-If Retention Intervention Simulation:
                </span>
                <button
                  type="button"
                  onClick={() => setSimulatedIntervention(!simulatedIntervention)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    simulatedIntervention
                      ? "bg-[#10b981] text-white shadow-sm"
                      : "bg-[#334155] text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {simulatedIntervention ? "[ APPLIED: RM + FEE WAIVER ]" : "[ SIMULATE INTERVENTION ]"}
                </button>
              </div>

              {/* SVG Area & Line Chart */}
              <div className="relative pt-2">
                <div className="flex justify-between text-[10px] text-[#64748b] mb-1">
                  <span>RATE: 20%</span>
                  <span className="text-[#38bdf8] font-bold">
                    {simulatedIntervention ? "Target Exit: 9.2%" : "Observed Exit: 15.0%"}
                  </span>
                </div>

                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-36 overflow-visible">
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1={paddingX} y1="20" x2={svgWidth - paddingX} y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1={paddingX} y1="70" x2={svgWidth - paddingX} y2="70" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1={paddingX} y1="120" x2={svgWidth - paddingX} y2="120" stroke="#1e293b" strokeDasharray="3 3" />

                  {/* Gradient Area Fill */}
                  <path d={areaD} fill="url(#curveGradient)" />

                  {/* Main Trajectory Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={simulatedIntervention ? "#10b981" : "#38bdf8"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />

                  {/* Current Active Anchor Dot */}
                  {currentPoints.map((p, i) => {
                    const x = paddingX + (i / (currentPoints.length - 1)) * (svgWidth - paddingX * 2);
                    const y = svgHeight - paddingY - ((p.rate - 8) / (22 - 8)) * (svgHeight - paddingY * 2);
                    if (i === 7 || i === currentPoints.length - 1) {
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="4"
                          fill={simulatedIntervention ? "#10b981" : "#38bdf8"}
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                      );
                    }
                    return null;
                  })}
                </svg>

                {/* Month labels */}
                <div className="flex justify-between text-[9px] text-[#64748b] px-4 pt-1">
                  {currentPoints.map((p) => (
                    <span key={p.month}>{p.month}</span>
                  ))}
                </div>
              </div>

              {/* Risk Distribution Breakdown Bar */}
              <div className="pt-2 border-t border-[#334155] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#94a3b8]">
                  <span>PORTFOLIO RISK TIER DISTRIBUTION:</span>
                  <span className="text-[#f8fafc] font-bold">10,000 MONITORED ACCOUNTS</span>
                </div>
                {/* Segmented Bar */}
                <div className="w-full h-2.5 bg-[#1e293b] rounded flex overflow-hidden">
                  <div className="bg-[#10b981] h-full" style={{ width: "62%" }} title="Low Risk: 62%"></div>
                  <div className="bg-[#f59e0b] h-full" style={{ width: "22%" }} title="Medium Risk: 22%"></div>
                  <div className="bg-[#f97316] h-full" style={{ width: "11%" }} title="High Risk: 11%"></div>
                  <div className="bg-[#ef4444] h-full" style={{ width: "5%" }} title="Critical Risk: 5%"></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#94a3b8] pt-0.5">
                  <span className="flex items-center gap-1 text-[#10b981]">● Low: 6,200</span>
                  <span className="flex items-center gap-1 text-[#f59e0b]">● Med: 2,200</span>
                  <span className="flex items-center gap-1 text-[#f97316]">● High: 1,100</span>
                  <span className="flex items-center gap-1 text-[#ef4444]">● Critical: 500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VISUAL ANALYTICS MODULES: CHARTS & GRAPHS FIRST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full border-t border-[#e2e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <div className="text-xs font-mono font-bold text-[#2563eb] uppercase tracking-wider">
              DATA ANALYTICS CAPABILITIES
            </div>
            <h2 className="text-xl font-extrabold text-[#0f172a]">
              Interactive Machine Learning Modules
            </h2>
          </div>

          {/* Module Tabs */}
          <div className="flex items-center bg-[#ffffff] border border-[#cbd5e1] p-1 rounded-md font-mono text-xs">
            <button
              onClick={() => setActiveTab("shap")}
              className={`px-3 py-1.5 rounded transition-all font-bold cursor-pointer ${
                activeTab === "shap" ? "bg-[#2563eb] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              SHAP Attribution
            </button>
            <button
              onClick={() => setActiveTab("segments")}
              className={`px-3 py-1.5 rounded transition-all font-bold cursor-pointer ${
                activeTab === "segments" ? "bg-[#2563eb] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              K-Means Clusters
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-3 py-1.5 rounded transition-all font-bold cursor-pointer ${
                activeTab === "simulator" ? "bg-[#2563eb] text-white shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              Retention Simulator
            </button>
          </div>
        </div>

        {/* Dynamic Graphic Card for Selected Tab */}
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 shadow-sm">
          {activeTab === "shap" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-3 font-sans">
                <div className="text-xs font-mono text-[#2563eb] font-bold">TREE-SHAP EXPLAINABILITY</div>
                <h3 className="text-lg font-extrabold text-[#0f172a]">
                  Mathematical Feature Attribution
                </h3>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Every churn prediction is decomposed into specific Shapley additive values, highlighting
                  the exact behavioral risk drivers and protective customer assets that determine account stability.
                </p>
                <div className="pt-2 font-mono text-xs">
                  <span className="text-[#ef4444] font-bold">+ Impact:</span> Increases Attrition Risk &nbsp;|&nbsp;
                  <span className="text-[#10b981] font-bold">- Impact:</span> Protective Retention
                </div>
              </div>

              {/* Visual SHAP Waterfall Bars */}
              <div className="lg:col-span-7 font-mono text-xs space-y-2.5 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#1e293b]">Account Balance Volatility</span>
                    <span className="text-[#ef4444] font-bold">+0.34 SHAP (Risk Driver)</span>
                  </div>
                  <div className="w-full bg-[#e2e8f0] h-2.5 rounded overflow-hidden">
                    <div className="bg-[#ef4444] h-full rounded" style={{ width: "82%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#1e293b]">Product Holdings &le; 1</span>
                    <span className="text-[#ef4444] font-bold">+0.26 SHAP (Risk Driver)</span>
                  </div>
                  <div className="w-full bg-[#e2e8f0] h-2.5 rounded overflow-hidden">
                    <div className="bg-[#ef4444] h-full rounded" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#1e293b]">Branch Inactivity &gt; 90d</span>
                    <span className="text-[#f59e0b] font-bold">+0.19 SHAP (Moderate Risk)</span>
                  </div>
                  <div className="w-full bg-[#e2e8f0] h-2.5 rounded overflow-hidden">
                    <div className="bg-[#f59e0b] h-full rounded" style={{ width: "48%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#1e293b]">Unresolved Grievances &gt; 5d</span>
                    <span className="text-[#f59e0b] font-bold">+0.15 SHAP (Moderate Risk)</span>
                  </div>
                  <div className="w-full bg-[#e2e8f0] h-2.5 rounded overflow-hidden">
                    <div className="bg-[#f59e0b] h-full rounded" style={{ width: "38%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#1e293b]">Digital App Engagement (&gt;70%)</span>
                    <span className="text-[#10b981] font-bold">-0.28 SHAP (Protective Factor)</span>
                  </div>
                  <div className="w-full bg-[#e2e8f0] h-2.5 rounded overflow-hidden">
                    <div className="bg-[#10b981] h-full rounded" style={{ width: "70%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "segments" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-3 font-sans">
                <div className="text-xs font-mono text-[#2563eb] font-bold">K-MEANS BEHAVIORAL CLUSTERING</div>
                <h3 className="text-lg font-extrabold text-[#0f172a]">
                  Unsupervised Cohort Segmentation
                </h3>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Identifies behavioral profiles across multi-dimensional customer features. Allows proactive targeting
                  of high-capital segments prior to balance disengagement.
                </p>
                <div className="text-xs font-mono text-[#64748b]">
                  4 Calibrated Clusters: Affluent, Salaried, Low-Balance, Grievance.
                </div>
              </div>

              {/* 2D Segment Cluster Visualization */}
              <div className="lg:col-span-7 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 bg-[#ffffff] border border-[#ef4444]/30 rounded-md">
                    <div className="flex items-center justify-between text-[#ef4444] font-bold text-[11px]">
                      <span>CLUSTER 0: AT-RISK AFFLUENT</span>
                      <span className="px-1.5 py-0.5 bg-[#ef4444]/10 rounded">CRITICAL</span>
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mt-1">INR 18.5L Avg Capital</div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">High balance volatility, declining transactions.</div>
                  </div>

                  <div className="p-3 bg-[#ffffff] border border-[#10b981]/30 rounded-md">
                    <div className="flex items-center justify-between text-[#10b981] font-bold text-[11px]">
                      <span>CLUSTER 1: CORE SALARIED</span>
                      <span className="px-1.5 py-0.5 bg-[#10b981]/10 rounded">LOW RISK</span>
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mt-1">INR 4.2L Avg Capital</div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">Consistent monthly inflows, high app usage.</div>
                  </div>

                  <div className="p-3 bg-[#ffffff] border border-[#f59e0b]/30 rounded-md">
                    <div className="flex items-center justify-between text-[#f59e0b] font-bold text-[11px]">
                      <span>CLUSTER 2: DORMANT SAVINGS</span>
                      <span className="px-1.5 py-0.5 bg-[#f59e0b]/10 rounded">MODERATE</span>
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mt-1">INR 85K Avg Capital</div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">Low digital touchpoints, 1 product held.</div>
                  </div>

                  <div className="p-3 bg-[#ffffff] border border-[#ef4444]/30 rounded-md">
                    <div className="flex items-center justify-between text-[#ef4444] font-bold text-[11px]">
                      <span>CLUSTER 3: ESCALATED GRIEVANCE</span>
                      <span className="px-1.5 py-0.5 bg-[#ef4444]/10 rounded">HIGH RISK</span>
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mt-1">INR 6.8L Avg Capital</div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">Multiple unresolved service tickets.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "simulator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-3 font-sans">
                <div className="text-xs font-mono text-[#2563eb] font-bold">WHAT-IF RETENTION SIMULATION</div>
                <h3 className="text-lg font-extrabold text-[#0f172a]">
                  Dynamic Parameter Scenario Modeling
                </h3>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Test and evaluate targeted interventions like fee waivers, interest concessions, or relationship manager
                  reassignment. View immediate projected risk reduction before deployment.
                </p>
                <div className="pt-1">
                  <Link
                    href="/workspace"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#2563eb] hover:underline"
                  >
                    Open Full Simulator in Workspace &rarr;
                  </Link>
                </div>
              </div>

              {/* Simulation Gauge Visual */}
              <div className="lg:col-span-7 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] font-mono">
                <div className="flex items-center justify-around text-center py-2">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#64748b]">BASELINE CHURN</div>
                    <div className="text-2xl font-black text-[#ef4444]">74.8%</div>
                    <div className="text-[10px] text-[#ef4444] font-bold">CRITICAL EXPOSURE</div>
                  </div>

                  <div className="text-xl font-bold text-[#64748b]">&rarr;</div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-[#64748b]">WITH RM INTERVENTION</div>
                    <div className="text-2xl font-black text-[#10b981]">38.2%</div>
                    <div className="text-[10px] text-[#10b981] font-bold">-36.6% PROBABILITY</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#e2e8f0] flex justify-between items-center text-xs text-[#64748b]">
                  <span>INTERVENTIONS: Fee Waiver ($50) + Senior RM Touchpoint</span>
                  <span className="text-[#10b981] font-bold">CAPITAL PRESERVED</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. SLEEK 1-CLICK DEMO ACCESS (MINIMALIST & USER FRIENDLY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full border-t border-[#e2e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <div className="text-xs font-mono font-bold text-[#2563eb] uppercase tracking-wider">
              INSTANT DEMO PROFILES
            </div>
            <h2 className="text-xl font-extrabold text-[#0f172a]">
              One-Click Role Launch
            </h2>
          </div>
          <span className="text-xs text-[#64748b] font-mono">
            No password required to evaluate preset roles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoRoles.map((role) => (
            <div
              key={role.key}
              onClick={() => handleLaunchRole(role.key)}
              className="bg-[#ffffff] border border-[#e2e8f0] hover:border-[#2563eb] p-4 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg font-mono font-bold flex items-center justify-center text-xs ${role.color}`}>
                    {role.avatar}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">
                    {role.badge}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#0f172a] group-hover:text-[#2563eb] transition-colors">
                  {role.key}
                </h3>
                <div className="text-xs text-[#2563eb] font-semibold">{role.name}</div>
                <p className="text-xs text-[#64748b] mt-1.5 leading-snug">{role.role}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between font-mono text-xs">
                <span className="text-[#2563eb] font-bold group-hover:underline">
                  {activeRole === role.key ? "Launching..." : "Launch Profile"}
                </span>
                <ChevronRight size={14} className="text-[#2563eb] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MINIMALIST FOOTER */}
      <footer className="w-full bg-[#ffffff] border-t border-[#e2e8f0] mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b] font-mono gap-4">
          <div className="flex items-center gap-3">
            <CmdLogo size="sm" showSubtitle={false} clickable={false} />
            <span className="text-[#cbd5e1]">|</span>
            <span>Churn Modeling & Decision Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/workspace" className="hover:text-[#2563eb] transition-colors">
              Workspace
            </Link>
            <Link href="/login" className="hover:text-[#2563eb] transition-colors">
              Sign In
            </Link>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

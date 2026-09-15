"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Globe,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  BarChart3,
  Sliders,
  Users,
  CheckCircle2,
  Lock,
  Zap,
  Layers,
  ArrowUpRight,
  Activity,
  Cpu,
  AlertTriangle
} from "lucide-react";
import { useAuthStore, DEMO_PROFILES } from "../stores/authStore";

export default function LandingPage() {
  const router = useRouter();
  const { loginDemoProfile } = useAuthStore();
  const [langDropdown, setLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const [activeDemoPill, setActiveDemoPill] = useState<string | null>(null);

  const demoRoles = [
    { key: "Risk Analyst", label: "Risk Analyst", role: "ANALYST", subtitle: "SHAP Explainability & Risk Watchlist" },
    { key: "Branch Manager", label: "Branch Manager", role: "MANAGER", subtitle: "Branch Retention & Interventions" },
    { key: "Chief Risk Officer", label: "Chief Risk Officer", role: "ADMIN", subtitle: "Executive Portfolio & Governance" },
    { key: "Compliance Officer", label: "Compliance Officer", role: "ADMIN", subtitle: "Audit Logs & Model Governance" },
  ];

  const handleLaunchDemo = async (roleKey: string) => {
    setActiveDemoPill(roleKey);
    await loginDemoProfile(roleKey);
    setTimeout(() => {
      router.push("/workspace");
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#f8fafc] font-sans selection:bg-[#00d2ff] selection:text-black relative overflow-x-hidden">
      {/* High-tech ambient cyan & electric blue grid glow */}
      <div className="absolute top-[-100px] right-[-100px] w-[700px] h-[700px] bg-gradient-to-bl from-[#00b4d8]/15 via-[#0077b6]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[450px] left-[-150px] w-[600px] h-[600px] bg-gradient-to-tr from-[#00d2ff]/10 via-[#0a0c10] to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle telemetry grid background overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#00d2ff 1px, transparent 1px), linear-gradient(90deg, #00d2ff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* TOP NAVIGATION */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between z-20 relative border-b border-[#1d232c]/60">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#141820] border border-[#00b4d8]/40 flex items-center justify-center text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.2)] group-hover:border-[#00d2ff] transition-all">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wider uppercase text-white font-sans">
              Aegis<span className="text-[#00b4d8]">Risk</span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94a3b8]">
          <a href="#how-it-works" className="hover:text-[#00d2ff] transition-colors">How it works</a>
          <a href="#capabilities" className="hover:text-[#00d2ff] transition-colors">Risk Engine</a>
          <a href="#governance" className="hover:text-[#00d2ff] transition-colors">Trust & Governance</a>
        </nav>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Selector */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setLangDropdown(!langDropdown)}
              className="flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white font-semibold px-2.5 py-1.5 rounded-lg bg-[#141820] border border-[#1d232c] hover:border-[#27303d] transition-colors"
            >
              <Globe size={14} className="text-[#00b4d8]" />
              <span>{selectedLang}</span>
              <span className="text-[10px] text-[#64748b]">▼</span>
            </button>
            {langDropdown && (
              <div className="absolute right-0 mt-1.5 w-36 bg-[#141820] rounded-xl shadow-2xl border border-[#27303d] py-1.5 z-30 text-xs font-medium">
                {["English", "Hindi (हिंदी)", "Marathi (मराठी)"].map((l) => (
                  <button
                    key={l}
                    onClick={() => { setSelectedLang(l.split(" ")[0]); setLangDropdown(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#1c222c] text-[#94a3b8] hover:text-[#00d2ff]"
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sign In link */}
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-[#94a3b8] hover:text-white px-2.5 py-1.5 transition-colors"
          >
            Sign in
          </Link>

          {/* Open Platform CTA */}
          <button
            onClick={() => handleLaunchDemo("Risk Analyst")}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#00b4d8] hover:bg-[#00d2ff] active:scale-95 text-black font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)] cursor-pointer"
          >
            <span>Open platform</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 relative">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00b4d8]/10 border border-[#00b4d8]/30 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#00d2ff] mb-6 shadow-[0_0_15px_rgba(0,210,255,0.1)]">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
            <span>AI Risk Intelligence for Enterprise Banking</span>
          </div>

          {/* Big Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-[68px] font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Know the risk.
            <br />
            <span
              className="text-[#00d2ff] italic font-normal tracking-normal block mt-1 sm:mt-2"
              style={{ fontFamily: "'Newsreader', 'Instrument Serif', Georgia, serif" }}
            >
              Retain with confidence.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#94a3b8] leading-relaxed max-w-xl mb-8 sm:mb-10 font-normal">
            AegisRisk empowers tier-1 banks, risk analysts, and branch managers to discover impending customer churn signals, explain behavioral drivers via SHAP AI, and trigger automated Gemini AI retention workflows.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-10 sm:mb-12">
            {/* Primary Cyan Glow Button */}
            <button
              onClick={() => handleLaunchDemo("Risk Analyst")}
              className="px-6 py-3.5 rounded-full bg-[#00b4d8] hover:bg-[#00d2ff] active:scale-95 text-black font-extrabold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-[0_0_30px_rgba(0,210,255,0.4)] cursor-pointer"
            >
              <span>Explore your portfolio</span>
              <ArrowRight size={17} />
            </button>

            {/* Secondary Text Link */}
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-[#f8fafc] hover:text-[#00d2ff] transition-colors py-2"
            >
              <span>See how AegisRisk works</span>
              <ChevronRight size={17} />
            </a>
          </div>

          {/* Social Proof Row */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1c222c] text-[#00d2ff] font-bold text-xs border-2 border-[#0a0c10]">R</div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0077b6] text-white font-bold text-xs border-2 border-[#0a0c10]">S</div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#141820] text-[#10b981] font-bold text-xs border-2 border-[#0a0c10]">A</div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#00b4d8] text-black font-bold text-xs border-2 border-[#0a0c10]">+</div>
            </div>
            <span className="text-xs sm:text-sm text-[#94a3b8] font-medium">
              Calibrated for 50,000+ accounts, risk teams & branch leaders
            </span>
          </div>
        </div>

        {/* Right Column: Signature Arch & Floating Badges */}
        <div className="lg:col-span-5 relative flex justify-center items-center mt-6 lg:mt-0">
          {/* Concentric Neon Rings behind Arch */}
          <div className="absolute w-[440px] h-[440px] sm:w-[500px] h-[500px] rounded-full border border-dashed border-[#00b4d8]/20 pointer-events-none" />
          <div className="absolute w-[360px] h-[360px] sm:w-[420px] h-[420px] rounded-full border border-dashed border-[#00b4d8]/15 pointer-events-none" />

          {/* TOP FLOATING CARD */}
          <div className="absolute -top-4 sm:-top-6 left-0 sm:-left-6 z-20 bg-[#141820]/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-[0_12px_35px_rgba(0,0,0,0.6)] border border-[#27303d] flex items-center gap-3.5 max-w-[240px] sm:max-w-[260px] animate-bounce-subtle">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/40 flex items-center justify-center text-[#f59e0b] shrink-0">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-medium text-[#94a3b8]">Today's risk signal</div>
              <div className="text-xs sm:text-sm font-bold text-white leading-snug">Review within 24-48 hrs</div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#ef4444] flex items-center gap-0.5 mt-0.5">
                <span>↑ 14.8% projected churn</span>
              </div>
            </div>
          </div>

          {/* SIGNATURE ARCH CONTAINER IN AEGIS DARK THEME */}
          <div className="w-[300px] sm:w-[350px] h-[420px] sm:h-[480px] rounded-t-[170px] sm:rounded-t-[200px] rounded-b-3xl overflow-hidden bg-gradient-to-b from-[#141820] via-[#0f1217] to-[#0a0c10] relative shadow-[0_20px_50px_rgba(0,180,216,0.15)] border-2 border-[#27303d] hover:border-[#00b4d8]/50 transition-colors flex flex-col justify-between p-5 group">
            {/* Top Arch Tech Status */}
            <div className="relative z-10 pt-16 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#00b4d8]/10 border border-[#00b4d8]/30 flex items-center justify-center text-[#00d2ff] mb-3 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
                <Activity size={24} />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00d2ff]">
                Live Risk Telemetry
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Portfolio Churn Index
              </h3>
            </div>

            {/* Radar / Waveform Visual Graphic */}
            <div className="relative z-10 my-auto py-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#94a3b8]">Overall Attrition Risk</span>
                  <span className="text-[#ef4444] font-bold">14.2% CRITICAL</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1c222c] overflow-hidden p-0.5 border border-[#27303d]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#00b4d8] via-[#f59e0b] to-[#ef4444] w-[74%] animate-pulse" />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-[#1d232c] text-left">
                  <div className="p-2 rounded-lg bg-[#0a0c10]/80 border border-[#1d232c]">
                    <div className="text-[10px] text-[#64748b] font-mono">FLAGGED ACCOUNTS</div>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">14 Customers</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0a0c10]/80 border border-[#1d232c]">
                    <div className="text-[10px] text-[#64748b] font-mono">RETAINABLE CAPITAL</div>
                    <div className="text-sm font-bold text-[#10b981] font-mono mt-0.5">₹42.8 Lakhs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inner bottom caption badge */}
            <div className="relative z-10 bg-[#141820]/90 backdrop-blur-md border border-[#27303d] px-3.5 py-2 rounded-xl text-[#f8fafc] flex items-center justify-center gap-2 text-xs font-medium">
              <Sparkles size={14} className="text-[#00d2ff]" />
              <span>SHAP Explainability &bull; Real-time ML</span>
            </div>
          </div>

          {/* BOTTOM FLOATING CARD */}
          <div className="absolute -bottom-4 sm:-bottom-6 right-0 sm:-right-6 z-20 bg-[#141820]/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-[0_12px_35px_rgba(0,0,0,0.6)] border border-[#27303d] flex items-center gap-3.5 max-w-[250px] sm:max-w-[270px]">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-medium text-[#94a3b8]">Prescriptive retention ready</div>
              <div className="text-xs sm:text-sm font-bold text-white leading-snug">HNI Fee Waiver + Wealth Advisory</div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#10b981] mt-0.5">
                94% retention fit score
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK WORKSPACE PREVIEW BANNER (Aegis Dark Theme) */}
      <section className="w-full bg-[#0f1217] border-y border-[#1d232c] py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff] animate-ping" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Instant Demo Workspaces:
            </span>
            <span className="text-xs text-[#94a3b8] hidden sm:inline">
              1-click test drive directly into any role
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {demoRoles.map((role) => (
              <button
                key={role.key}
                onClick={() => handleLaunchDemo(role.key)}
                className="px-3.5 py-1.5 rounded-lg bg-[#141820] hover:bg-[#1c222c] border border-[#27303d] hover:border-[#00b4d8] text-xs font-semibold text-[#f8fafc] transition-all flex items-center gap-1.5 shadow-sm group cursor-pointer"
              >
                <span>{role.label}</span>
                <ArrowUpRight size={13} className="text-[#64748b] group-hover:text-[#00d2ff] transition-colors" />
              </button>
            ))}
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-[#00b4d8] text-black text-xs font-bold hover:bg-[#00d2ff] transition-colors shadow-sm"
            >
              Sign In Form →
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-extrabold uppercase tracking-widest text-[#00b4d8] mb-2 font-mono">
            Architecture Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How AegisRisk Safeguards Customer Portfolios
          </h2>
          <p className="text-[#94a3b8] text-sm sm:text-base mt-3">
            Predict customer attrition months in advance with full behavioral explainability and GenAI interventions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#141820] rounded-2xl p-7 border border-[#1d232c] hover:border-[#27303d] transition-all shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#00b4d8]/10 border border-[#00b4d8]/30 text-[#00d2ff] flex items-center justify-center font-bold text-lg mb-5 font-mono">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Customer 360 Ingestion</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Synthesizes real-time deposits, transaction velocities, digital engagement sessions, and grievance tickets into unified feature vectors.
            </p>
          </div>

          <div className="bg-[#141820] rounded-2xl p-7 border border-[#1d232c] hover:border-[#27303d] transition-all shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#0077b6]/20 border border-[#0077b6]/50 text-[#00b4d8] flex items-center justify-center font-bold text-lg mb-5 font-mono">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">XGBoost & SHAP Engine</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Evaluates churn propensity across multi-model benchmarks, calculating exact SHAP feature attributions that explain root-cause attrition triggers.
            </p>
          </div>

          <div className="bg-[#141820] rounded-2xl p-7 border border-[#1d232c] hover:border-[#27303d] transition-all shadow-md">
            <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] flex items-center justify-center font-bold text-lg mb-5 font-mono">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Gemini AI Retention</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Prescribes personalized fee restructuring, relationship manager outreach scripts, and tailored wealth upgrades with quantified recovery scores.
            </p>
          </div>
        </div>
      </section>

      {/* CAPABILITIES SECTION */}
      <section id="capabilities" className="w-full bg-[#0f1217] border-t border-[#1d232c] py-20 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-[#00b4d8] mb-2 font-mono">
                Platform Capabilities
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Built for High-Stakes Banking Decisions
              </h2>
            </div>
            <button
              onClick={() => handleLaunchDemo("Chief Risk Officer")}
              className="px-4 py-2 rounded-xl bg-[#00b4d8] text-black text-xs font-extrabold flex items-center gap-2 hover:bg-[#00d2ff] self-start md:self-auto cursor-pointer shadow-[0_0_15px_rgba(0,180,216,0.3)]"
            >
              <span>Launch CRO Console</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#141820] border border-[#1d232c] hover:border-[#00b4d8]/40 transition-colors">
              <Users size={24} className="text-[#00d2ff] mb-4" />
              <h4 className="font-bold text-white mb-1.5">Customer 360 View</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Full longitudinal customer accounts with real-time balance velocity and grievance timelines.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141820] border border-[#1d232c] hover:border-[#00b4d8]/40 transition-colors">
              <Sliders size={24} className="text-[#00d2ff] mb-4" />
              <h4 className="font-bold text-white mb-1.5">What-If Simulator</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Adjust balance dips, fee hikes, and credit limits to observe churn risk changes in real-time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141820] border border-[#1d232c] hover:border-[#00b4d8]/40 transition-colors">
              <Layers size={24} className="text-[#00d2ff] mb-4" />
              <h4 className="font-bold text-white mb-1.5">K-Means Segments</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Automated clustering into High Net Worth, Digital Transactors, and Dormant Savers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141820] border border-[#1d232c] hover:border-[#00b4d8]/40 transition-colors">
              <Lock size={24} className="text-[#00d2ff] mb-4" />
              <h4 className="font-bold text-white mb-1.5">Governance & RBAC</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Bank-grade access control for Admins, Analysts, and Branch Managers with immutable audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#07090c] text-[#94a3b8] py-12 px-6 sm:px-8 border-t border-[#1d232c]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#1d232c] pb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00b4d8] flex items-center justify-center text-black font-bold">
              <ShieldCheck size={18} />
            </div>
            <span className="text-lg font-bold text-white tracking-wider uppercase font-sans">
              Aegis<span className="text-[#00b4d8]">Risk</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Risk Engine</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/workspace" className="text-[#00d2ff] hover:underline">Workspace App</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b] gap-4">
          <p>© 2026 AegisRisk Intelligence. Enterprise Banking Risk & Churn Decision Platform.</p>
          <p className="font-mono">Dark Enterprise System &bull; Port 3000</p>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CmdLogo } from "../components/common/CmdLogo";
import { useAuth } from "../context/AuthContext";
import { Dock } from "../components/ui/dock-two";
import RadialOrbitalTimeline from "../components/ui/radial-orbital-timeline";
import {
  ShieldAlert,
  Activity,
  Cpu,
  Sliders,
  Sparkles,
  PieChart,
  ArrowRight,
  ChevronRight,
  Lock,
  BarChart3,
  Home,
  Layers,
  FileSpreadsheet,
  Settings,
  LineChart,
  Network
} from "lucide-react";

export const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const dockItems = [
    { icon: Home, label: "Home", onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { icon: LineChart, label: "Risk Engine", onClick: () => document.getElementById("pipeline")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: Network, label: "Architecture", onClick: () => window.open("/architecture.html", "_blank") },
    { icon: Layers, label: "Segmentation", onClick: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: Sliders, label: "Simulation", onClick: () => document.getElementById("simulation")?.scrollIntoView({ behavior: "smooth" }) },
    { icon: FileSpreadsheet, label: "Reports", onClick: () => navigate("/reports") },
    { icon: Settings, label: "Dashboard", onClick: () => navigate("/dashboard") }
  ];

  const bankingPipelineTimelineData = [
    {
      id: 1,
      title: "Real-time Telemetry",
      date: "Stage 01",
      content: "Stream transaction logs, balance fluctuations, and service ticket frequencies through Kafka & FastAPI ingestion pipelines.",
      category: "Ingestion",
      icon: Cpu,
      relatedIds: [2],
      status: "completed",
      energy: 98,
    },
    {
      id: 2,
      title: "XGBoost Calibration",
      date: "Stage 02",
      content: "Isotonic regression calibrates raw tree probabilities to reflect true mathematical churn likelihoods across accounts.",
      category: "Classification",
      icon: ShieldAlert,
      relatedIds: [1, 3],
      status: "completed",
      energy: 94,
    },
    {
      id: 3,
      title: "K-Means Clustering",
      date: "Stage 03",
      content: "Unsupervised clustering categorizes customers into 5 structural behavioral profiles (Dormant, Wealth, Active, Friction).",
      category: "Segmentation",
      icon: PieChart,
      relatedIds: [2, 4],
      status: "in-progress",
      energy: 88,
    },
    {
      id: 4,
      title: "SHAP Explainability",
      date: "Stage 04",
      content: "Decomposes risk drivers into auditable feature contributions (e.g., tenure drops, digital inactivity, credit utilization).",
      category: "Explainability",
      icon: Activity,
      relatedIds: [3, 5],
      status: "in-progress",
      energy: 82,
    },
    {
      id: 5,
      title: "Counterfactuals",
      date: "Stage 05",
      content: "Interactive what-if simulations compute minimum parameter shifts required to flip accounts into safe retention thresholds.",
      category: "Simulation",
      icon: Sliders,
      relatedIds: [4, 6],
      status: "completed",
      energy: 90,
    },
    {
      id: 6,
      title: "AI Action Briefs",
      date: "Stage 06",
      content: "Generative Gemini summaries formulate institutional retention playbooks, fee waiver recommendations, and relationship reviews.",
      category: "Synthesis",
      icon: Sparkles,
      relatedIds: [5],
      status: "in-progress",
      energy: 75,
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-grotesk overflow-x-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-gradient-to-b from-blue-900/15 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/85 border-b border-neutral-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CmdLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-300 font-grotesk">
            <a href="#pipeline" className="hover:text-white transition-colors duration-200">
              Platform
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors duration-200">
              Risk Engine
            </a>
            <a href="#simulation" className="hover:text-white transition-colors duration-200">
              Simulation
            </a>
            <a href="/architecture.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
              Architecture
            </a>
            <Link to="/reports" className="hover:text-white transition-colors duration-200">
              Documentation
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-white text-black hover:bg-neutral-200 transition-all font-semibold text-xs px-4 py-2 rounded-md shadow-md hover:shadow-lg font-grotesk flex items-center gap-1.5"
              >
                <span>Open Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-neutral-300 hover:text-white transition-colors px-2 py-1 font-grotesk tracking-wide"
                >
                  Sign in
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-black hover:bg-neutral-200 transition-all font-semibold text-xs px-4 py-2 rounded-md shadow-md hover:shadow-lg font-grotesk flex items-center gap-1.5"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 1. HERO SECTION WITH TRANSLUCENT 6-STAGE ML PIPELINE */}
      {/* ======================================================== */}
      <section className="pt-14 pb-20 px-4 text-center relative z-10 max-w-6xl mx-auto min-h-[660px] flex flex-col items-center justify-center">
        {/* 3D Rotating Orbital Animation Translucent Behind Hero Texts */}
        <div className="absolute inset-0 flex items-center justify-center -top-6 pointer-events-none z-0 overflow-hidden">
          <div className="w-full max-w-4xl h-[640px] opacity-45 md:opacity-55 scale-95 md:scale-105 pointer-events-auto">
            <RadialOrbitalTimeline
              timelineData={bankingPipelineTimelineData}
              isHeroBackground={true}
              radius={245}
            />
          </div>
        </div>

        {/* Foreground Content Stack */}
        <div className="relative z-10 space-y-7 max-w-4xl mx-auto">
          {/* Announcement Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 hover:border-neutral-700 transition-colors shadow-xl backdrop-blur-lg font-grotesk cursor-pointer group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-neutral-300 group-hover:text-white transition-colors">
                New version of calibrated ML engine is out!
              </span>
              <Link
                to="/login"
                className="text-white hover:text-emerald-400 flex items-center font-medium ml-1 transition-colors"
              >
                <span>Read more</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Hero Headline & Subtitle */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight text-white leading-[1.08] font-grotesk drop-shadow-sm">
              Closing the gap between churn prediction and retention strategy
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed font-grotesk drop-shadow-sm">
              A decision-support system for banking
            </p>
          </div>

          {/* Primary Hero Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 font-semibold text-sm px-8 py-3.5 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-150 font-grotesk tracking-wide flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAuthenticated ? "Enter Terminal" : "Get started"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-medium text-sm px-6 py-3.5 rounded-lg backdrop-blur-md transition-all font-grotesk flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Simulated Terminal Preview</span>
            </Link>
          </div>

          {/* Interactive Floating Dock Showcase */}
          <div className="pt-2">
            <div className="text-[11px] uppercase tracking-widest text-neutral-400 font-mono mb-2">
              Interactive Analytics Control Bar
            </div>
            <Dock items={dockItems} className="h-auto" />
          </div>

          {/* Security / Compliance Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-grotesk">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-neutral-300" />
              <span>256-Bit Encrypted Sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>XGBoost + SHAP Explainability</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>FastAPI Real-time Ingestion</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. DEDICATED PIPELINE SHOWCASE & EXPLORATION */}
      {/* ======================================================== */}
      <section id="pipeline" className="max-w-6xl mx-auto px-4 py-16 relative z-10 font-grotesk border-t border-neutral-900">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-mono font-semibold text-white tracking-widest uppercase px-3 py-1 bg-neutral-900 border border-neutral-700 rounded-full inline-block">
            DECISION ENGINE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            6-Stage Telemetry & ML Calibration Pipeline
          </h2>
          <p className="text-sm text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
            Click on any pipeline node below to inspect real-time transaction ingestion, Platt calibration thresholds, and counterfactual simulation parameters.
          </p>
        </div>

        {/* Orbital Timeline Frame */}
        <div className="w-full max-w-5xl mx-auto h-[620px] rounded-2xl bg-neutral-950/80 border border-neutral-800 shadow-2xl overflow-hidden relative p-4 flex items-center justify-center">
          <RadialOrbitalTimeline
            timelineData={bankingPipelineTimelineData}
            isHeroBackground={false}
            radius={210}
          />
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SIMULATION PREVIEW SECTION */}
      {/* ======================================================== */}
      <section id="simulation" className="max-w-6xl mx-auto px-4 py-16 relative z-10 font-grotesk border-t border-neutral-900">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Mock Terminal Header */}
          <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
            </div>
            <div className="text-[11px] font-mono text-neutral-300 bg-black/60 px-4 py-1 rounded border border-neutral-800">
              https://bank-analytics.internal/dashboard
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE ML TELEMETRY (PORT 5000 & 8000)</span>
            </div>
          </div>

          {/* Metric Cards Inside Preview */}
          <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-neutral-950 to-neutral-900/60">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Portfolio Attrition</div>
                <div className="text-2xl font-normal font-grotesk text-white mt-1">18.4%</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">-2.3% vs prior 30 days</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Monitored Portfolio</div>
                <div className="text-2xl font-normal font-grotesk text-white mt-1">₹15.7 Cr</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Total Monitored Deposits</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Monitored Accounts</div>
                <div className="text-2xl font-normal font-grotesk text-white mt-1">1,200</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">High-Vulnerability Watchlist</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Model ROC-AUC</div>
                <div className="text-2xl font-normal font-grotesk text-white mt-1">0.9980</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">BankShield-Hybrid Calibration</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800 text-xs text-neutral-300">
              <div>Continuous real-time evaluation with calibrated decision boundaries</div>
              <Link
                to="/login"
                className="text-white hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Launch Institutional Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. CAPABILITIES MATRIX */}
      {/* ======================================================== */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16 space-y-12 font-grotesk border-t border-neutral-900">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-semibold text-white tracking-widest uppercase px-3 py-1 bg-neutral-900 border border-neutral-700 rounded-full inline-block">
            CAPABILITIES MATRIX
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Built for Risk Officers & Portfolio Managers
          </h2>
          <p className="text-sm text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
            Everything your credit risk, operations, and retention teams need to prevent customer churn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">Calibrated Risk Scoring</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Supervised XGBoost classification calibrated with isotonic regression gives mathematically true churn probabilities.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">K-Means Segmentation</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Unsupervised multi-attribute clustering groups customers into 5 structural behavioral profiles based on channel activity and balance velocity.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">What-If Counterfactuals</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Interactively adjust digital usage, product holdings, balance tiers, and grievance resolutions to project churn reduction sensitivity.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">Gemini Strategic Summaries</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              AI narratives synthesize customer 360 histories and generate executive briefs for high-vulnerability account reviews.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">SHAP Risk Drivers</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Decompose individual customer predictions into concrete positive and negative feature contributions with full auditability.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">Automated Compliance Reports</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              One-click executive dossier compilation and CSV data export for regulatory audit compliance and risk committee distribution.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. CALL TO ACTION BANNER */}
      {/* ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10 font-grotesk border-t border-neutral-900">
        <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-10 sm:p-14 space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-light text-white">
            Ready to secure your customer portfolio?
          </h2>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto font-light leading-relaxed">
            Access the calibrated analytics engine and begin exploring retention signals immediately.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-200 font-semibold text-sm px-8 py-3.5 rounded-lg shadow-xl transition-all font-grotesk tracking-wide"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FOOTER */}
      {/* ======================================================== */}
      <footer className="border-t border-neutral-900 py-10 px-6 bg-black text-xs text-neutral-400 font-grotesk">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CmdLogo size="sm" showSubtitle={false} />
            <span>&bull;</span>
            <span className="text-neutral-300">Customer Risk & Churn Analytics</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/reports" className="hover:text-white transition-colors">
              Compliance Reports
            </Link>
          </div>
          <div className="text-neutral-400">&copy; {new Date().getFullYear()} cmd. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

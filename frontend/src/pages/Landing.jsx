import React from "react";
import { Link } from "react-router-dom";
import { CmdLogo } from "../components/common/CmdLogo";
import {
  ShieldAlert,
  Activity,
  Cpu,
  Sliders,
  Sparkles,
  PieChart,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  ChevronRight,
  Lock,
  BarChart3
} from "lucide-react";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white font-grotesk overflow-x-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-blue-900/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-t from-amber-950/20 via-orange-950/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/70 border-b border-neutral-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CmdLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400 font-grotesk">
            <a href="#features" className="hover:text-white transition-colors">
              Platform
            </a>
            <a href="#models" className="hover:text-white transition-colors">
              Risk Engine
            </a>
            <a href="#simulation" className="hover:text-white transition-colors">
              Simulation
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
            <Link to="/reports" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </nav>

          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 text-center relative z-10 max-w-5xl mx-auto space-y-8">
        {/* Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:border-neutral-700 transition-colors shadow-sm font-grotesk">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>New version of calibrated ML engine is out!</span>
          <Link
            to="/login"
            className="text-primary hover:underline flex items-center font-medium ml-1"
          >
            <span>Read more</span>
            <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Hero Headline with Grotesk Typography */}
        <div className="space-y-5">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight text-white max-w-4xl mx-auto leading-[1.08] font-grotesk">
            Give your banking portfolio the risk intelligence it deserves
          </h1>
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed font-grotesk">
            Calibrated customer churn modeling, unsupervised behavioral clustering,
            and explainable counterfactual simulation built for institutional banking.
          </p>
        </div>

        {/* Main Hero CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto bg-white text-black hover:bg-neutral-200 font-medium text-sm px-8 py-3.5 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-150 font-grotesk tracking-wide flex items-center justify-center gap-2"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-medium text-sm px-6 py-3.5 rounded-lg transition-all font-grotesk flex items-center justify-center gap-2"
          >
            <span>Live Terminal Preview</span>
          </Link>
        </div>

        {/* Security / Compliance Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500 font-grotesk">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>256-Bit Encrypted Sessions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>XGBoost + SHAP Explainability</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>FastAPI Real-time Ingestion</span>
          </div>
        </div>
      </section>

      {/* Interactive Platform Dashboard Preview */}
      <section className="max-w-6xl mx-auto px-4 pb-20 relative z-10 font-grotesk">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Mock Browser Header */}
          <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-700" />
            </div>
            <div className="text-[11px] font-mono text-neutral-400 bg-black/60 px-4 py-1 rounded border border-neutral-800">
              https://bank-analytics.internal/dashboard
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE ML PROD</span>
            </div>
          </div>

          {/* Feature Strip Inside Preview */}
          <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-neutral-950 to-neutral-900/60">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Portfolio Attrition</div>
                <div className="text-2xl font-normal font-grotesk text-amber-400 mt-1">14.2%</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">-1.8% vs last quarter</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Vulnerable Capital</div>
                <div className="text-2xl font-normal font-grotesk text-red-400 mt-1">$320M</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">High-Risk Exposure</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Active Accounts</div>
                <div className="text-2xl font-normal font-grotesk text-white mt-1">8,580</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">10,000 Total Monitored</div>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg">
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Retention Playbooks</div>
                <div className="text-2xl font-normal font-grotesk text-emerald-400 mt-1">94.8%</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Intervention Precision</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800 text-xs text-neutral-400">
              <div>Continuous real-time evaluation with calibrated decision boundaries</div>
              <Link
                to="/login"
                className="text-primary hover:text-white font-medium flex items-center gap-1"
              >
                <span>Launch Institutional Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16 space-y-12 font-grotesk">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">
            CAPABILITIES MATRIX
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Built for Risk Officers & Portfolio Managers
          </h2>
          <p className="text-sm text-neutral-400 max-w-2xl mx-auto font-light">
            Everything your credit risk, operations, and retention teams need to prevent customer churn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-600/40 flex items-center justify-center text-primary">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">Calibrated Risk Scoring</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Supervised XGBoost classification calibrated with isotonic regression gives mathematically true churn probabilities.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">K-Means Segmentation</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Unsupervised multi-attribute clustering groups customers into 5 structural behavioral profiles based on channel activity and balance velocity.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">What-If Counterfactuals</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Interactively adjust digital usage, product holdings, balance tiers, and grievance resolutions to project live churn reduction.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-600/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">Gemini Strategic Summaries</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              AI narratives synthesize customer 360 histories and generate executive briefs for high-vulnerability account reviews.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-600/40 flex items-center justify-center text-red-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">SHAP Risk Drivers</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Decompose individual customer predictions into concrete positive and negative feature contributions with full auditability.
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 p-6 rounded-xl space-y-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-normal text-white">Automated Compliance Reports</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              One-click executive dossier compilation and CSV data export for regulatory audit compliance and risk committee distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10 font-grotesk">
        <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-10 sm:p-14 space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-light text-white">
            Ready to secure your customer portfolio?
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto font-light">
            Access the calibrated analytics engine and begin exploring retention signals immediately.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-200 font-medium text-sm px-8 py-3.5 rounded-lg shadow-xl transition-all font-grotesk tracking-wide"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-10 px-6 bg-black text-xs text-neutral-500 font-grotesk">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CmdLogo size="sm" showSubtitle={false} />
            <span>&bull;</span>
            <span>Customer Risk & Churn Analytics</span>
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
          <div>&copy; {new Date().getFullYear()} cmd. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

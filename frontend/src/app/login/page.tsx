"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";
import { CmdLogo } from "@/components/CmdLogo";
import { useAuthStore, DEMO_PROFILES } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loginDemoProfile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"quick" | "form">("quick");
  const [email, setEmail] = useState("admin@bank.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);

  const demoAccounts = [
    {
      roleKey: "Chief Risk Officer",
      name: "Arjun Kapoor",
      badge: "ADMIN",
      title: "Chief Risk Officer & Admin",
      email: "admin@bank.com",
      avatar: "AK",
      color: "bg-[#2563eb] text-white",
      desc: "Full administrative access, risk watchlists, user management, and executive governance."
    },
    {
      roleKey: "Risk Analyst",
      name: "Priya Sharma",
      badge: "ANALYST",
      title: "Senior Risk & Churn Analyst",
      email: "analyst@bank.com",
      avatar: "PS",
      color: "bg-[#10b981] text-white",
      desc: "SHAP explainability, model diagnostics, customer 360 dossiers, and scenario simulation."
    },
    {
      roleKey: "Branch Manager",
      name: "Vikram Mehta",
      badge: "MANAGER",
      title: "Regional Branch Manager",
      email: "manager@bank.com",
      avatar: "VM",
      color: "bg-[#f59e0b] text-white",
      desc: "Regional branch customer surveillance, escalation tracking, and retention outreach."
    },
    {
      roleKey: "Compliance Officer",
      name: "Ananya Deshmukh",
      badge: "ADMIN",
      title: "Governance & Audit Lead",
      email: "compliance@bank.com",
      avatar: "AD",
      color: "bg-[#8b5cf6] text-white",
      desc: "Regulatory audit trails, model version histories, and fair lending governance."
    }
  ];

  const handleQuickLogin = async (roleKey: string) => {
    setLoggingInRole(roleKey);
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginDemoProfile(roleKey);
      setStatusNotice(`Signed in as ${roleKey}. Redirecting to workspace...`);
      setTimeout(() => {
        router.push("/workspace");
      }, 300);
    } catch (e) {
      router.push("/workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const ok = await loginWithCredentials(email, password);
      if (ok) {
        setStatusNotice("Authentication successful. Launching workspace...");
        setTimeout(() => {
          router.push("/workspace");
        }, 300);
      } else {
        setErrorMessage("Invalid credentials. Please verify your email and password, or use 1-click demo login.");
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.error || "Authentication error. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillPreset = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setActiveTab("form");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1e293b] font-sans flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#64748b] hover:text-[#0f172a] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
          <span className="text-xs font-mono text-[#64748b]">RBAC Gateway Online</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-2xl mx-auto my-6 bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 sm:p-8 shadow-sm">
        {/* Brand Banner */}
        <div className="text-center pb-6 border-b border-[#e2e8f0]">
          <div className="flex justify-center mb-3">
            <CmdLogo size="lg" showSubtitle={true} clickable={false} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f172a]">
            Portal Authentication
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            Choose an authorized evaluation role below for 1-click access, or sign in with your email.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 my-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("quick")}
            className={`px-4 py-2 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "quick"
                ? "bg-[#2563eb] text-white shadow-sm"
                : "bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            1-Click Demo Profiles (Recommended)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`px-4 py-2 rounded-md font-bold transition-all cursor-pointer ${
              activeTab === "form"
                ? "bg-[#2563eb] text-white shadow-sm"
                : "bg-[#f1f5f9] text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            Sign In with Email
          </button>
        </div>

        {/* Status & Error Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-xs font-mono rounded-lg flex items-center gap-2">
            <span>&bull;</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {statusNotice && (
          <div className="mb-5 p-3 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-mono rounded-lg flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* TAB 1: 1-CLICK DEMO PROFILES */}
        {activeTab === "quick" && (
          <div className="space-y-3">
            <div className="text-xs text-[#64748b] font-mono mb-2">
              Select a pre-configured role to immediately enter the authenticated workspace:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((account) => (
                <div
                  key={account.roleKey}
                  className="border border-[#e2e8f0] hover:border-[#2563eb] bg-[#f8fafc] hover:bg-[#ffffff] p-4 rounded-lg transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-md font-mono font-bold flex items-center justify-center text-xs ${account.color}`}>
                        {account.avatar}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded">
                        {account.badge}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-[#0f172a]">{account.roleKey}</div>
                    <div className="text-xs font-semibold text-[#2563eb]">{account.name}</div>
                    <p className="text-[11px] text-[#64748b] mt-1 leading-snug">{account.desc}</p>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(account.roleKey)}
                    className="mt-4 w-full py-2 bg-[#ffffff] hover:bg-[#2563eb] text-[#2563eb] hover:text-white border border-[#2563eb] text-xs font-mono font-bold rounded-md transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>{loggingInRole === account.roleKey ? "Signing In..." : `Sign In as ${account.name.split(" ")[0]}`}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL FORM SIGN-IN */}
        {activeTab === "form" && (
          <form onSubmit={handleManualLogin} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1">
                Banking Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#2563eb] text-[#0f172a] px-3.5 py-2.5 rounded-lg outline-none font-mono transition-colors"
                placeholder="e.g. admin@bank.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#2563eb] text-[#0f172a] px-3.5 py-2.5 rounded-lg outline-none font-mono pr-10 transition-colors"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748b]">
              <span>Sample: admin@bank.com / Admin@123</span>
              <button
                type="button"
                onClick={() => handleFillPreset("admin@bank.com", "Admin@123")}
                className="text-[#2563eb] hover:underline font-bold"
              >
                Auto-fill Admin Credentials
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3 rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <span>{loading ? "AUTHENTICATING..." : "SIGN IN TO RISK WORKSPACE"}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto flex items-center justify-between text-xs text-[#64748b] font-mono border-t border-[#e2e8f0] pt-4">
        <span>cmd. Churn Modeling & Decision Engine</span>
        <span>Role-Based Access Control Active</span>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Globe, ArrowRight, ShieldCheck, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useAuthStore, DEMO_PROFILES } from "../../stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loginDemoProfile } = useAuthStore();

  const [email, setEmail] = useState("analyst@bank.com");
  const [password, setPassword] = useState("Analyst@123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [langDropdown, setLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const demoRoles = [
    { key: "Risk Analyst", label: "Risk Analyst", desc: "Priya Sharma (Portfolio & SHAP Analyst)" },
    { key: "Branch Manager", label: "Branch Manager", desc: "Vikram Mehta (Branch Interventions)" },
    { key: "Chief Risk Officer", label: "Chief Risk Officer", desc: "Arjun Kapoor (Admin & Governance)" },
    { key: "Compliance Officer", label: "Compliance Officer", desc: "Ananya Deshmukh (Audit & RBAC)" },
    { key: "Demo Guest", label: "Demo Guest", desc: "Instant Sandbox Evaluation" },
  ];

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const ok = await loginWithCredentials(email, password);
      if (ok) {
        setToastMsg("Authentication verified. Redirecting to intelligence workspace...");
        setTimeout(() => {
          router.push("/workspace");
        }, 350);
      } else {
        setErrorMessage("Invalid credentials. Select a demo workspace below for instant access.");
      }
    } catch (err: any) {
      setErrorMessage("Authentication encountered an issue. Launching demo workspace...");
      setTimeout(() => router.push("/workspace"), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoRole = async (roleKey: string) => {
    setActiveDemo(roleKey);
    setLoading(true);
    setErrorMessage(null);

    const profile = DEMO_PROFILES[roleKey];
    if (profile) {
      setEmail(profile.user.email);
      setPassword(profile.pass);
    }

    try {
      await loginDemoProfile(roleKey);
      setToastMsg(`Logged in as ${roleKey} (${profile?.user.name || "Demo User"}). Launching workspace...`);
      setTimeout(() => {
        router.push("/workspace");
      }, 400);
    } catch (e) {
      router.push("/workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans text-[#f8fafc] relative selection:bg-[#00d2ff] selection:text-black overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-[#00b4d8]/15 via-[#0077b6]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#00d2ff]/10 via-[#0a0c10] to-transparent rounded-full blur-3xl pointer-events-none" />
      
      {/* Telemetry Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#00d2ff 1px, transparent 1px), linear-gradient(90deg, #00d2ff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* Top Header / Back Link */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#94a3b8] hover:text-[#00d2ff] transition-colors px-3 py-1.5 rounded-lg bg-[#141820] border border-[#1d232c] hover:border-[#27303d]"
        >
          <ArrowLeft size={16} className="text-[#00b4d8]" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Login Card Area */}
      <main className="w-full max-w-md mx-auto my-auto py-6 z-10">
        <div className="bg-[#141820] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-[#27303d] hover:border-[#00b4d8]/40 p-6 sm:p-9 transition-all">
          {/* Top Bar: Language selector */}
          <div className="flex items-center justify-between mb-3">
            <div className="w-6" /> {/* spacer */}
            
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdown(!langDropdown)}
                className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white font-medium px-2.5 py-1 rounded-md bg-[#0a0c10] border border-[#1d232c] hover:border-[#27303d] transition-colors"
              >
                <Globe size={14} className="text-[#00b4d8]" />
                <span>{selectedLang}</span>
                <span className="text-[10px] text-[#64748b]">▼</span>
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-1.5 w-36 bg-[#141820] rounded-xl shadow-2xl border border-[#27303d] py-1.5 z-30 text-xs font-medium">
                  {["English", "Hindi (हिंदी)", "Marathi (मराठी)", "Tamil (தமிழ்)"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang.split(" ")[0]);
                        setLangDropdown(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-[#1c222c] text-[#94a3b8] hover:text-[#00d2ff]"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Brand Emblem & Logo */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0a0c10] border border-[#00b4d8]/40 flex items-center justify-center text-[#00d2ff] mb-2.5 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl font-extrabold tracking-wider uppercase text-white font-sans">
              Aegis<span className="text-[#00b4d8]">Risk</span>
            </h1>
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center mt-5 mb-7">
            <h2 className="text-xl sm:text-[22px] font-bold text-white leading-tight">
              One market. Every decision connected.
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] mt-1.5 font-normal">
              Sign in to your AegisRisk intelligence workspace.
            </p>
          </div>

          {/* Toast / Notification */}
          {toastMsg && (
            <div className="mb-5 p-3 rounded-xl bg-[#00b4d8]/10 border border-[#00b4d8]/40 text-[#00d2ff] text-xs font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#00d2ff] shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/40 text-[#ef4444] text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                Email / Mobile Number
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@bank.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#27303d] text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] transition-all bg-[#0a0c10]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#27303d] text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] transition-all bg-[#0a0c10]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#00d2ff] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#94a3b8] font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#27303d] text-[#00b4d8] focus:ring-[#00b4d8] rounded-sm cursor-pointer accent-[#00b4d8]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Demo Password Reset: Use one of the 1-click preview workspaces below for instant demo access.")}
                className="text-[#64748b] hover:text-[#00d2ff] font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#00b4d8] hover:bg-[#00d2ff] active:scale-[0.99] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)] disabled:opacity-75 cursor-pointer"
            >
              <span>{loading ? "Authenticating..." : "LOGIN"}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Create Account Link */}
          <div className="mt-6 text-center text-xs text-[#94a3b8]">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => handleSelectDemoRole("Demo Guest")}
              className="text-[#00d2ff] font-bold tracking-wide hover:underline uppercase text-[11px]"
            >
              CREATE ACCOUNT
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Bar: Preview a Workspace (Aegis Dark Enterprise Theme) */}
      <footer className="w-full max-w-5xl mx-auto pt-4 pb-2 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs">
          <span className="text-[#94a3b8] font-medium shrink-0 flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#00d2ff]" />
            Preview a workspace:
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {demoRoles.map((role) => {
              const isSelected = activeDemo === role.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleSelectDemoRole(role.key)}
                  title={role.desc}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                    isSelected
                      ? "bg-[#00b4d8] text-black border-[#00d2ff] scale-105 shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                      : "bg-[#141820] text-[#f8fafc] border-[#27303d] hover:border-[#00b4d8] hover:text-[#00d2ff] active:scale-95"
                  }`}
                >
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth, DEMO_PROFILES } from "../context/AuthContext";
import { CmdLogo } from "../components/common/CmdLogo";

export const Login = () => {
  const [email, setEmail] = useState("analyst@bank.com");
  const [password, setPassword] = useState("Analyst@123");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { loginWithCredentials, loginDemoProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      const success = await loginWithCredentials(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setErrorMsg("Invalid credentials. Please verify your email and password.");
      }
    } catch {
      setErrorMsg("Authentication service unavailable.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (profileKey) => {
    setErrorMsg("");
    setSubmitting(true);
    try {
      const success = await loginDemoProfile(profileKey);
      if (success) {
        navigate("/dashboard");
      } else {
        setErrorMsg("Failed to authenticate demo profile.");
      }
    } catch {
      setErrorMsg("Authentication service error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-grotesk flex flex-col justify-center items-center px-4 py-12 select-none relative overflow-hidden">
      {/* Ambient background glow matching Landing page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-900/15 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-t from-amber-950/20 via-orange-950/10 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header with prominent CmdLogo */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <Link to="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity">
            <CmdLogo size="lg" showSubtitle={true} />
          </Link>
          <p className="text-xs text-neutral-400 font-light max-w-xs mx-auto leading-relaxed">
            Calibrated Customer Risk & Churn Analytics Decision Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-950/90 border border-neutral-800/90 rounded-xl shadow-2xl p-6 sm:p-7 space-y-5 backdrop-blur-md">
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-600/40 rounded-lg text-red-300 text-xs flex items-center gap-2 font-grotesk animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@bank.com"
                  className="w-full bg-neutral-900/90 border border-neutral-800 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 font-grotesk transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900/90 border border-neutral-800 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 font-grotesk transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 uppercase tracking-wider flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in to terminal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-2">
            <div className="text-[10.5px] font-medium text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Demo Security Roles</span>
              <span className="text-primary font-normal text-[10px]">One-Click Access</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(DEMO_PROFILES).map((key) => {
                const p = DEMO_PROFILES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleQuickDemo(key)}
                    disabled={submitting}
                    className="p-2 text-left bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all group cursor-pointer"
                  >
                    <div className="text-[10px] font-semibold text-primary">
                      {p.role}
                    </div>
                    <div className="text-[11px] font-normal text-neutral-300 truncate mt-0.5">
                      {p.name.split(" ")[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-neutral-500 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Back to overview</span>
          </Link>
        </div>

        {/* Security Notice Footer */}
        <div className="text-center text-[10.5px] text-neutral-600 font-light space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>Authorized Access Only &bull; 256-Bit Encrypted Session</span>
          </div>
          <div>Banking Customer Risk & Churn Analytics Engine v1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default Login;

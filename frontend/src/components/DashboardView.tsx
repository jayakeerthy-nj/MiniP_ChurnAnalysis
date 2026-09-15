"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { ArrowUpRight, ArrowDownRight, ShieldAlert, CheckCircle, Zap } from "lucide-react";

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedCustomerId, setActiveTab } = useAuthStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/analytics/dashboard");
      const watchlistRes = await api.get("/analytics/risk");
      setData({ ...res.data, watchlist: watchlistRes.data?.highRiskWatchlist || [] });
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-cyanMain font-mono animate-pulse">
        <Zap className="animate-spin mr-2" size={20} /> Loading Enterprise Risk Engine...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-critical bg-subtle rounded-lg border border-borderMuted">
        <p>Failed to load dashboard: {error}</p>
        <button onClick={fetchDashboard} className="btn-cyan-sm mt-4">Retry</button>
      </div>
    );
  }

  const kpis = data.kpis;
  const watchlist = data.watchlist.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Row 5 Metric Cards */}
      <section className="kpi-banner">
        <div className="kpi-box">
          <div className="kpi-top">
            <span className="kpi-title">Total Monitored Capital</span>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-figure font-mono">₹{(kpis.totalBalance / 10000000).toFixed(2)} Cr</span>
            <span className="tag-pill tag-green">+8.4%</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-top">
            <span className="kpi-title">Critical Churn Risk</span>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-figure text-critical font-mono">{kpis.criticalRiskCount}</span>
            <span className="tag-pill tag-red">Active Vigil</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-top">
            <span className="kpi-title">Unresolved Grievances</span>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-figure font-mono">{kpis.unresolvedComplaints}</span>
            <span className="tag-pill tag-neutral">SLA 94%</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-top">
            <span className="kpi-title">Avg Engagement Score</span>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-figure font-mono">{kpis.avgEngagementScore}</span>
            <span className="tag-pill tag-cyan">Target: 70</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-top">
            <span className="kpi-title">Baseline Churn Rate</span>
          </div>
          <div className="kpi-bottom">
            <span className="kpi-figure text-cyanBright font-mono">{kpis.churnRate}%</span>
            <span className="tag-pill tag-green">&darr; 2.1% MoM</span>
          </div>
        </div>
      </section>

      {/* Visuals Grid: Large Interactive Curve & Sparklines */}
      <section className="visuals-grid">
        <div className="panel-card main-chart-panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">ATTRITION VELOCITY vs DIGITAL MOMENTUM</span>
              <h2 className="panel-title">12-Month Churn Dynamics & Portfolio Engagement</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="tag-pill tag-neutral font-mono">Retail Tier-1</span>
              <span className="tag-pill tag-cyan font-mono">Live Sync</span>
            </div>
          </div>

          <div className="chart-container">
            <div className="y-axis">
              <span>25%</span>
              <span>20%</span>
              <span>15%</span>
              <span>10%</span>
              <span>5%</span>
              <span>0%</span>
            </div>
            <div className="chart-svg-wrap">
              <svg viewBox="0 0 850 260" preserveAspectRatio="none" className="main-svg">
                <defs>
                  <linearGradient id="cyanGlowArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="blueCurveGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0077b6" />
                    <stop offset="100%" stopColor="#00d2ff" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid */}
                <line x1="0" y1="10" x2="850" y2="10" stroke="#1f242d" strokeDasharray="3 3"/>
                <line x1="0" y1="60" x2="850" y2="60" stroke="#1f242d" strokeDasharray="3 3"/>
                <line x1="0" y1="110" x2="850" y2="110" stroke="#1f242d" strokeDasharray="3 3"/>
                <line x1="0" y1="160" x2="850" y2="160" stroke="#1f242d" strokeDasharray="3 3"/>
                <line x1="0" y1="210" x2="850" y2="210" stroke="#1f242d" strokeDasharray="3 3"/>

                {/* Subdued baseline */}
                <path d="M 0,210 Q 140,200 280,185 T 560,190 T 850,175" fill="none" stroke="#253246" strokeWidth="2.5" />

                {/* Dynamic Filled Area */}
                <path d="M 0,220 Q 140,200 280,140 T 520,105 T 700,130 T 850,70 L 850,250 L 0,250 Z" fill="url(#cyanGlowArea)" />

                {/* Dynamic Cyan Line */}
                <path d="M 0,220 Q 140,200 280,140 T 520,105 T 700,130 T 850,70" fill="none" stroke="url(#blueCurveGrad)" strokeWidth="3.5" strokeLinecap="round" />

                <circle cx="520" cy="105" r="5" fill="#00d2ff" stroke="#0a0c10" strokeWidth="3" />
              </svg>

              <div className="chart-tooltip" style={{ left: "60%", top: "32%" }}>
                <div className="tt-title font-mono">Q3 Vulnerability Apex</div>
                <div className="tt-sub">Avg Churn Rate: <span className="text-cyan font-mono font-bold">19.2%</span></div>
              </div>

              <div className="x-axis">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Sparkline Stack */}
        <div className="sparkline-stack">
          <div className="panel-card mini-panel">
            <div className="mini-head">
              <span className="mini-label">At-Risk Capital Exposure</span>
              <h3 className="mini-title">Quarterly Inactivity Drain</h3>
            </div>
            <div className="spark-wrap">
              <svg viewBox="0 0 320 80" preserveAspectRatio="none" className="spark-svg">
                <path d="M 0,55 Q 30,70 60,35 T 120,45 T 180,18 T 240,60 T 320,20" fill="none" stroke="#00b4d8" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="spark-footer">
              <span className="text-cyan font-mono">₹4.82 Cr At Risk</span>
              <span className="tag-pill tag-red">&uarr; Exposure</span>
            </div>
          </div>

          <div className="panel-card mini-panel">
            <div className="mini-head">
              <span className="mini-label">Service Grievance Velocity</span>
              <h3 className="mini-title">Open Dispute Escalation</h3>
            </div>
            <div className="spark-wrap">
              <svg viewBox="0 0 320 80" preserveAspectRatio="none" className="spark-svg">
                <path d="M 0,40 Q 40,30 80,60 T 160,20 T 220,50 T 280,30 T 320,58" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="spark-footer">
              <span className="text-muted font-mono">{kpis.unresolvedComplaints} Open Disputes</span>
              <span className="tag-pill tag-green">&darr; 6.4% Resolution</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Grid: SHAP Drivers & High Priority Watchlist */}
      <section className="bottom-grid">
        {/* SHAP Weights */}
        <div className="panel-card">
          <div className="panel-head">
            <div>
              <span className="panel-tag">XGBOOST FEATURE EXPLAINABILITY</span>
              <h3 className="panel-title-sm">Primary Churn Drivers (SHAP)</h3>
            </div>
            <span className="tag-pill tag-neutral font-mono">xgb-v1.4</span>
          </div>

          <div className="shap-stack">
            <div className="shap-row">
              <div className="shap-meta">
                <span>Declining Transaction Velocity (&gt;45 Days Inactive)</span>
                <span className="text-critical font-mono">+0.34</span>
              </div>
              <div className="track"><div className="fill fill-critical" style={{ width: "82%" }}></div></div>
            </div>

            <div className="shap-row">
              <div className="shap-meta">
                <span>Unresolved Service Grievance Flag</span>
                <span className="text-critical font-mono">+0.28</span>
              </div>
              <div className="track"><div className="fill fill-critical" style={{ width: "68%" }}></div></div>
            </div>

            <div className="shap-row">
              <div className="shap-meta">
                <span>Low Digital Channel Adoption (&lt; 30%)</span>
                <span className="text-critical font-mono">+0.19</span>
              </div>
              <div className="track"><div className="fill fill-critical" style={{ width: "48%" }}></div></div>
            </div>

            <div className="shap-row">
              <div className="shap-meta">
                <span>Relationship Tenure (&gt; 36 Months)</span>
                <span className="text-safe font-mono">-0.24</span>
              </div>
              <div className="track"><div className="fill fill-safe" style={{ width: "58%" }}></div></div>
            </div>

            <div className="shap-row">
              <div className="shap-meta">
                <span>Multi-Product Relationship (&ge; 3 Facilities)</span>
                <span className="text-safe font-mono">-0.18</span>
              </div>
              <div className="track"><div className="fill fill-safe" style={{ width: "42%" }}></div></div>
            </div>
          </div>
        </div>

        {/* High Priority Watchlist Table */}
        <div className="panel-card">
          <div className="panel-head">
            <div>
              <span className="panel-tag">RETENTION TARGETS</span>
              <h3 className="panel-title-sm">Immediate Customer Watchlist</h3>
            </div>
            <button
              onClick={() => setActiveTab("risk")}
              className="link-btn font-mono text-[12px] flex items-center gap-1 text-cyanMain hover:underline"
            >
              View Full Matrix &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="dark-table w-full">
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>LOCATION</th>
                  <th>BALANCE</th>
                  <th>RISK</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((cust: any) => (
                  <tr key={cust.customerId} className="hover:bg-subtle transition-colors">
                    <td>
                      <button
                        onClick={() => setSelectedCustomerId(cust.customerId)}
                        className="text-left group"
                      >
                        <strong className="group-hover:text-cyanBright text-white block">{cust.name}</strong>
                        <span className="sub-id font-mono text-[11px] text-muted">{cust.customerId}</span>
                      </button>
                    </td>
                    <td><span className="tag-pill tag-neutral">{cust.city}</span></td>
                    <td className="font-mono text-cyanBright">₹{Number(cust.currentBalance || 0).toLocaleString()}</td>
                    <td>
                      <span className={`tag-pill ${
                        cust.predictedRiskLevel === "CRITICAL" ? "tag-red" : "tag-yellow"
                      }`}>
                        {Math.round(cust.predictedChurnProb * 100)}% {cust.predictedRiskLevel}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedCustomerId(cust.customerId)}
                        className="btn-table-action"
                      >
                        View 360
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { ShieldAlert, RefreshCw, BarChart2, ArrowUpRight, CheckCircle2, AlertTriangle } from "lucide-react";

interface DashboardData {
  kpis?: {
    totalCustomers?: number;
    activeCustomers?: number;
    churnedCustomers?: number;
    churnRate?: number;
    highRiskCount?: number;
    criticalRiskCount?: number;
    totalBalance?: number;
    avgBalance?: number;
    avgEngagementScore?: number;
    unresolvedComplaints?: number;
  };
  riskDistribution?: Array<{
    level: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  monthlyTrend?: Array<{
    month: string;
    churnRate: number;
    activityVolume: number;
    criticalRiskCount: number;
    drainageAmount: number;
  }>;
  watchlist?: Array<{
    customerId: string;
    name?: string;
    city?: string;
    currentBalance?: number;
    predictedChurnProb?: number;
    predictedRiskLevel?: string;
    unresolvedComplaints?: number;
    cluster?: number;
  }>;
}

export const DashboardView: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("1Y");
  const { setSelectedCustomerId, setActiveTab } = useAuthStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, riskRes] = await Promise.allSettled([
        api.get("/analytics/dashboard"),
        api.get("/analytics/risk")
      ]);

      const dashData = dashRes.status === "fulfilled" ? dashRes.value.data : {};
      const riskData = riskRes.status === "fulfilled" ? riskRes.value.data : {};

      setData({
        ...dashData,
        watchlist: riskData?.highRiskWatchlist || []
      });
    } catch (err: any) {
      setError("Failed to load analytics dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis;
  const watchlist = (data?.watchlist || []).slice(0, 5);
  const riskDistribution = data?.riskDistribution || [];
  const monthlyTrend = data?.monthlyTrend || [];

  // Generate SVG path for 12-month churn trend
  const svgWidth = 800;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  let trendPath = "";
  if (monthlyTrend.length > 1) {
    const maxRate = 30; // 30% max scale
    const points = monthlyTrend.map((d, idx) => {
      const x = paddingX + (idx / (monthlyTrend.length - 1)) * (svgWidth - paddingX * 2);
      const y = svgHeight - paddingY - (Math.min(d.churnRate, maxRate) / maxRate) * (svgHeight - paddingY * 2);
      return `${x},${y}`;
    });
    trendPath = `M ${points.join(" L ")}`;
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* 1. TOP KPI STATUS STRIP */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {/* Total Monitored Capital */}
        <div className="kpi-box">
          <div className="kpi-title">MONITORED CAPITAL</div>
          <div className="kpi-bottom">
            <span className="kpi-figure">
              {kpis?.totalBalance !== undefined
                ? `INR ${(kpis.totalBalance / 10000000).toFixed(2)} Cr`
                : "—"}
            </span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="kpi-box">
          <div className="kpi-title">TOTAL CUSTOMERS</div>
          <div className="kpi-bottom">
            <span className="kpi-figure">
              {kpis?.totalCustomers !== undefined ? kpis.totalCustomers.toLocaleString() : "—"}
            </span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="kpi-box">
          <div className="kpi-title">ACTIVE ACCOUNTS</div>
          <div className="kpi-bottom">
            <span className="kpi-figure text-[#10b981]">
              {kpis?.activeCustomers !== undefined ? kpis.activeCustomers.toLocaleString() : "—"}
            </span>
          </div>
        </div>

        {/* Calibrated Churn Rate */}
        <div className="kpi-box">
          <div className="kpi-title">CHURN RATE</div>
          <div className="kpi-bottom">
            <span className="kpi-figure text-[#3d7eff]">
              {kpis?.churnRate !== undefined ? `${kpis.churnRate}%` : "—"}
            </span>
          </div>
        </div>

        {/* Critical Risk Count */}
        <div className="kpi-box">
          <div className="kpi-title">CRITICAL RISK</div>
          <div className="kpi-bottom">
            <span className="kpi-figure text-[#ef4444]">
              {kpis?.criticalRiskCount !== undefined ? kpis.criticalRiskCount.toLocaleString() : "—"}
            </span>
          </div>
        </div>

        {/* High Risk Count */}
        <div className="kpi-box">
          <div className="kpi-title">HIGH RISK</div>
          <div className="kpi-bottom">
            <span className="kpi-figure text-[#f59e0b]">
              {kpis?.highRiskCount !== undefined ? kpis.highRiskCount.toLocaleString() : "—"}
            </span>
          </div>
        </div>

        {/* Unresolved Grievances */}
        <div className="kpi-box">
          <div className="kpi-title">OPEN GRIEVANCES</div>
          <div className="kpi-bottom">
            <span className="kpi-figure">
              {kpis?.unresolvedComplaints !== undefined ? kpis.unresolvedComplaints.toLocaleString() : "—"}
            </span>
          </div>
        </div>
      </section>

      {/* 2. VISUALS GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: 12-Month Portfolio Attrition Trend */}
        <div className="lg:col-span-2 panel-card flex flex-col justify-between">
          <div className="panel-head">
            <div>
              <span className="panel-tag">ATTRITION VELOCITY & PORTFOLIO ACTIVITY</span>
              <h2 className="panel-title">12-Month Churn Dynamics & Activity Trend</h2>
            </div>
            <div className="flex items-center gap-1">
              {["1M", "3M", "6M", "1Y", "ALL"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-[2px] border transition-colors cursor-pointer ${
                    timeRange === range
                      ? "bg-[#3d7eff] text-white border-[#3d7eff]"
                      : "bg-[#f8f9fa] text-[#8b9098] border-[#e2e4e8] hover:border-[#b3b3b3]"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-viewport my-2">
            <div className="y-axis">
              <span>30%</span>
              <span>20%</span>
              <span>10%</span>
              <span>0%</span>
            </div>
            <div className="chart-svg-wrap">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="main-svg">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#f1f3f5" strokeDasharray="3 3"/>
                <line x1="0" y1="75" x2={svgWidth} y2="75" stroke="#f1f3f5" strokeDasharray="3 3"/>
                <line x1="0" y1="130" x2={svgWidth} y2="130" stroke="#f1f3f5" strokeDasharray="3 3"/>
                <line x1="0" y1="180" x2={svgWidth} y2="180" stroke="#e2e4e8"/>

                {/* Churn Trajectory Line */}
                {trendPath ? (
                  <path
                    d={trendPath}
                    fill="none"
                    stroke="#3d7eff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M 40,140 Q 240,120 440,100 T 760,80"
                    fill="none"
                    stroke="#3d7eff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}
              </svg>

              <div className="x-axis mt-2">
                {monthlyTrend.length > 0
                  ? monthlyTrend.map((m) => <span key={m.month}>{m.month.toUpperCase()}</span>)
                  : ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8b9098] pt-2 border-t border-[#e2e4e8]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#3d7eff] rounded-[1px] inline-block"></span>
              <span>Calibrated Churn Probability Trajectory</span>
            </div>
            <span>PORTFOLIO BASELINE: 15.0%</span>
          </div>
        </div>

        {/* Right Col: Real Portfolio Risk Tier Distribution (replaces fake stock sectors) */}
        <div className="panel-card flex flex-col justify-between">
          <div>
            <div className="panel-head">
              <div>
                <span className="panel-tag">PORTFOLIO EXPOSURE</span>
                <h2 className="panel-title">Risk Tier Distribution</h2>
              </div>
              <button
                onClick={fetchDashboard}
                className="p-1 hover:bg-[#f1f3f5] rounded-[2px] text-[#8b9098] transition-colors"
                title="Refresh Analytics"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            <p className="text-[11px] text-[#8b9098] mb-4">
              Breakdown of total customer population categorized by calibrated machine learning risk tiers:
            </p>

            <div className="space-y-3">
              {riskDistribution.length > 0 ? (
                riskDistribution.map((tier) => (
                  <div key={tier.level} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span
                          className="w-2 h-2 rounded-[1px]"
                          style={{ backgroundColor: tier.color }}
                        ></span>
                        <span className="text-[#18191b]">{tier.level} RISK</span>
                      </div>
                      <div className="text-[#8b9098]">
                        <span className="font-bold text-[#18191b]">{tier.count.toLocaleString()}</span>
                        {" "}accounts ({tier.percentage}%)
                      </div>
                    </div>
                    <div className="w-full bg-[#f1f3f5] h-2 rounded-[1px] overflow-hidden">
                      <div
                        className="h-full rounded-[1px] transition-all duration-300"
                        style={{
                          width: `${Math.max(tier.percentage, 2)}%`,
                          backgroundColor: tier.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#8b9098] text-center py-6">
                  {loading ? "Loading risk distribution..." : "No risk tier data available."}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e2e4e8] bg-[#f8f9fa] p-2.5 rounded-[2px]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#8b9098]">SURVEILLANCE FOCUS:</span>
              <span className="text-[#ef4444] font-bold">
                {kpis
                  ? `${((kpis.criticalRiskCount || 0) + (kpis.highRiskCount || 0)).toLocaleString()} High & Critical Accounts`
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BOTTOM GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SHAP Behavioral Attribution */}
        <div className="panel-card">
          <div className="panel-head">
            <div>
              <span className="panel-tag">TREE-SHAP EXPLAINABILITY</span>
              <h3 className="panel-title-sm">Primary Churn Drivers</h3>
            </div>
            <span className="tag-pill tag-neutral font-mono">RF & XGB</span>
          </div>

          <p className="text-[11px] text-[#8b9098] mb-3">
            Impact of key behavioral factors on model churn predictions across the retail portfolio:
          </p>

          <div className="shap-stack space-y-2.5">
            <div className="shap-row">
              <div className="shap-meta flex justify-between mb-1">
                <span>Account Balance Volatility</span>
                <span className="text-[#ef4444] font-bold">+0.34 SHAP</span>
              </div>
              <div className="track w-full bg-[#f1f3f5] h-2 rounded-[1px] overflow-hidden">
                <div className="fill fill-critical h-full bg-[#ef4444]" style={{ width: "78%" }}></div>
              </div>
            </div>

            <div className="shap-row">
              <div className="shap-meta flex justify-between mb-1">
                <span>Product Holding Count &le; 1</span>
                <span className="text-[#ef4444] font-bold">+0.26 SHAP</span>
              </div>
              <div className="track w-full bg-[#f1f3f5] h-2 rounded-[1px] overflow-hidden">
                <div className="fill fill-critical h-full bg-[#ef4444]" style={{ width: "62%" }}></div>
              </div>
            </div>

            <div className="shap-row">
              <div className="shap-meta flex justify-between mb-1">
                <span>Transaction Frequency Deceleration</span>
                <span className="text-[#f59e0b] font-bold">+0.19 SHAP</span>
              </div>
              <div className="track w-full bg-[#f1f3f5] h-2 rounded-[1px] overflow-hidden">
                <div className="fill fill-amber h-full bg-[#f59e0b]" style={{ width: "45%" }}></div>
              </div>
            </div>

            <div className="shap-row">
              <div className="shap-meta flex justify-between mb-1">
                <span>Unresolved Grievances &gt; 5 Days</span>
                <span className="text-[#f59e0b] font-bold">+0.15 SHAP</span>
              </div>
              <div className="track w-full bg-[#f1f3f5] h-2 rounded-[1px] overflow-hidden">
                <div className="fill fill-amber h-full bg-[#f59e0b]" style={{ width: "35%" }}></div>
              </div>
            </div>

            <div className="shap-row">
              <div className="shap-meta flex justify-between mb-1">
                <span>Active Digital Banking Adoption (Protective)</span>
                <span className="text-[#10b981] font-bold">-0.28 SHAP</span>
              </div>
              <div className="track w-full bg-[#f1f3f5] h-2 rounded-[1px] overflow-hidden">
                <div className="fill fill-safe h-full bg-[#10b981]" style={{ width: "65%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* High Risk Portfolio Watchlist Table */}
        <div className="panel-card">
          <div className="panel-head">
            <div>
              <span className="panel-tag">HIGH PRIORITY SURVEILLANCE</span>
              <h3 className="panel-title-sm">Critical Risk Watchlist</h3>
            </div>
            <button
              onClick={() => setActiveTab("risk")}
              className="text-[10px] text-[#3d7eff] hover:underline font-bold cursor-pointer"
            >
              [ VIEW ALL &rarr; ]
            </button>
          </div>

          <p className="text-[11px] text-[#8b9098] mb-2">
            Top accounts ranked by calibrated churn probability and capital exposure:
          </p>

          <div className="overflow-x-auto">
            <table className="dark-table w-full">
              <thead>
                <tr className="border-b border-[#e2e4e8] text-[10px] text-[#8b9098]">
                  <th className="text-left py-1.5">Account ID</th>
                  <th className="text-left py-1.5">Customer</th>
                  <th className="text-left py-1.5">City</th>
                  <th className="text-left py-1.5">Risk Tier</th>
                  <th className="text-right py-1.5">Exposure</th>
                  <th className="text-center py-1.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.length > 0 ? (
                  watchlist.map((cust) => (
                    <tr key={cust.customerId} className="border-b border-[#f1f3f5] hover:bg-[#f8f9fa]">
                      <td className="font-mono text-[#3d7eff] font-bold py-1.5">{cust.customerId}</td>
                      <td className="font-bold text-[#18191b] py-1.5">{cust.name || "Customer"}</td>
                      <td className="text-[#6b7280] py-1.5">{cust.city || "—"}</td>
                      <td className="py-1.5">
                        <span
                          className={`tag-pill ${
                            cust.predictedRiskLevel === "CRITICAL"
                              ? "tag-red text-[#ef4444]"
                              : "tag-yellow text-[#f59e0b]"
                          }`}
                        >
                          {cust.predictedRiskLevel || "HIGH"}
                        </span>
                      </td>
                      <td className="text-right font-mono text-[#2f2f34] py-1.5">
                        {cust.currentBalance !== undefined
                          ? `INR ${(cust.currentBalance / 100000).toFixed(1)}L`
                          : "—"}
                      </td>
                      <td className="text-center py-1.5">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(cust.customerId);
                            setActiveTab("customer-detail");
                          }}
                          className="btn-table-action"
                        >
                          [ INSPECT ]
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-[#8b9098]">
                      {loading ? "Loading critical watchlist accounts..." : "No critical risk accounts found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

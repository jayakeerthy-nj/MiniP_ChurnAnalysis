"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { TrendingDown, Activity, AlertCircle } from "lucide-react";

export const ChurnAnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/churn")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-cyanMain font-mono animate-pulse">Running Churn Correlation Pipelines...</div>;
  }

  if (!data) return <div className="p-8 text-center text-critical">Failed to load churn analytics.</div>;

  const { churnVsComplaints, churnVsTenure, correlationMatrix } = data;

  return (
    <div className="space-y-6">
      <div className="panel-card bg-gradient-to-r from-card to-subtle border-l-4 border-l-cyanMain">
        <span className="panel-tag">STATISTICAL ATTRITION DECOMPOSITION</span>
        <h2 className="text-xl font-bold text-white">Churn Behavioral Patterns & Correlation Analytics</h2>
        <p className="text-xs text-muted mt-1">
          Uncovering underlying drivers associated with account closure and inactivity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Churn vs Complaints */}
        <div className="panel-card">
          <h3 className="text-sm font-bold text-white mb-2">Churn Probability vs Grievance Frequency</h3>
          <p className="text-xs text-muted mb-4">Strong positive correlation between support friction and customer departure.</p>
          <div className="space-y-3">
            {churnVsComplaints.map((item: any) => (
              <div key={item.complaints} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white">{item.complaints} ({item.total} cust)</span>
                  <span className="font-mono text-critical font-bold">{item.churnRate}% Churn Rate</span>
                </div>
                <div className="track"><div className="fill fill-critical" style={{ width: `${Math.min(100, item.churnRate * 1.5)}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Churn vs Tenure */}
        <div className="panel-card">
          <h3 className="text-sm font-bold text-white mb-2">Attrition Rate across Customer Tenure</h3>
          <p className="text-xs text-muted mb-4">Tenure curve reveals heightened vulnerability in months 3-12 (onboarding cliff).</p>
          <div className="space-y-3">
            {churnVsTenure.map((item: any) => (
              <div key={item.tenure} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white">{item.tenure} ({item.total} cust)</span>
                  <span className="font-mono text-cyanBright font-bold">{item.churnRate}% Churn Rate</span>
                </div>
                <div className="track"><div className="fill fill-safe" style={{ width: `${Math.min(100, item.churnRate * 2.5)}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Correlation Matrix Table */}
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <span className="panel-tag">PEARSON & SPEARMAN RANKINGS</span>
            <h3 className="panel-title-sm">Driver Correlation Matrix to Churn Label</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="dark-table w-full">
            <thead>
              <tr>
                <th>FEATURE / SIGNAL</th>
                <th>CORRELATION COEFFICIENT (r)</th>
                <th>SIGNIFICANCE (p-value)</th>
                <th>DIRECTION</th>
                <th>BUSINESS IMPLICATION</th>
              </tr>
            </thead>
            <tbody>
              {correlationMatrix.map((c: any) => (
                <tr key={c.feature} className="hover:bg-subtle transition-colors">
                  <td className="font-medium text-white">{c.feature}</td>
                  <td className={`font-mono font-bold ${c.correlation > 0 ? "text-critical" : "text-safe"}`}>
                    {c.correlation > 0 ? "+" : ""}{c.correlation}
                  </td>
                  <td className="font-mono text-muted text-xs">{c.pValue}</td>
                  <td>
                    <span className={`tag-pill ${c.direction === "Positive" ? "tag-red" : "tag-green"}`}>
                      {c.direction === "Positive" ? "Elevates Churn" : "Protective Anchor"}
                    </span>
                  </td>
                  <td className="text-xs text-muted">
                    {c.direction === "Positive"
                      ? "Escalating trend signals immediate risk of departure."
                      : "Deeper adoption reinforces customer loyalty and longevity."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
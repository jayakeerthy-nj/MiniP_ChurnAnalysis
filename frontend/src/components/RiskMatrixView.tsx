"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { ShieldAlert, AlertTriangle, CheckCircle, Eye } from "lucide-react";

export const RiskMatrixView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setSelectedCustomerId } = useAuthStore();

  useEffect(() => {
    api.get("/analytics/risk")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-cyanMain font-mono animate-pulse">Assembling Risk Watchlist Matrix...</div>;
  }

  if (!data) return <div className="p-8 text-center text-critical">Failed to load risk analytics.</div>;

  const { riskByAge, riskByProducts, riskByDigitalUsage, highRiskWatchlist } = data;

  return (
    <div className="space-y-6">
      <div className="panel-card bg-gradient-to-r from-card to-subtle border-l-4 border-l-cyanMain">
        <span className="panel-tag">EXPOSURE ARCHITECTURE</span>
        <h2 className="text-xl font-bold text-white">Risk Matrix & High-Vulnerability Watchlist</h2>
        <p className="text-xs text-muted mt-1">
          Multivariate decomposition of customer churn risk across demographics, product density, and digital adoption.
        </p>
      </div>

      {/* Grid of Risk Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Risk by Age */}
        <div className="panel-card">
          <h3 className="text-sm font-bold text-white mb-3">Risk Exposure by Age Bracket</h3>
          <div className="space-y-3">
            {riskByAge.map((item: any) => (
              <div key={item.group} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white">{item.group} yrs ({item.total} cust)</span>
                  <span className="font-mono text-critical font-bold">{item.riskRate}% High Risk</span>
                </div>
                <div className="track"><div className="fill fill-critical" style={{ width: `${Math.min(100, item.riskRate * 2.5)}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk by Products */}
        <div className="panel-card">
          <h3 className="text-sm font-bold text-white mb-3">Risk by Product Relationship</h3>
          <div className="space-y-3">
            {riskByProducts.map((item: any) => (
              <div key={item.products} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white">{item.products}</span>
                  <span className="font-mono text-warning font-bold">{item.riskRate}% High Risk</span>
                </div>
                <div className="track"><div className="fill fill-critical" style={{ width: `${Math.min(100, item.riskRate * 2.5)}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk by Digital Adoption */}
        <div className="panel-card">
          <h3 className="text-sm font-bold text-white mb-3">Risk by Digital Adoption Tier</h3>
          <div className="space-y-3">
            {riskByDigitalUsage.map((item: any) => (
              <div key={item.tier} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white">{item.tier}</span>
                  <span className="font-mono text-critical font-bold">{item.riskRate}% High Risk</span>
                </div>
                <div className="track"><div className="fill fill-critical" style={{ width: `${Math.min(100, item.riskRate * 2.5)}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Watchlist Table */}
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <span className="panel-tag">EARLY WARNING ACTION LIST</span>
            <h3 className="panel-title-sm">Top Attrition-Risk Accounts</h3>
          </div>
          <span className="tag-pill tag-red font-mono">{highRiskWatchlist.length} Targets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="dark-table w-full">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>LOCATION</th>
                <th>BALANCE</th>
                <th>TENURE</th>
                <th>TX / MO</th>
                <th>UNRESOLVED</th>
                <th>PREDICTED CHURN</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {highRiskWatchlist.map((c: any) => (
                <tr key={c.customerId} className="hover:bg-subtle transition-colors">
                  <td>
                    <button
                      onClick={() => setSelectedCustomerId(c.customerId)}
                      className="text-left group"
                    >
                      <strong className="text-white group-hover:text-cyanBright block">{c.name}</strong>
                      <span className="sub-id font-mono text-[11px] text-muted">{c.customerId}</span>
                    </button>
                  </td>
                  <td><span className="tag-pill tag-neutral">{c.city}</span></td>
                  <td className="font-mono text-cyanBright">₹{Number(c.currentBalance || 0).toLocaleString()}</td>
                  <td className="font-mono">{c.tenureMonths} Mo</td>
                  <td className="font-mono">{c.transactionsPerMonth}</td>
                  <td>
                    <span className={c.unresolvedComplaints > 0 ? "text-critical font-bold font-mono" : "text-muted font-mono"}>
                      {c.unresolvedComplaints}
                    </span>
                  </td>
                  <td>
                    <span className="tag-pill tag-red font-mono font-bold">
                      {Math.round(c.predictedChurnProb * 100)}% {c.predictedRiskLevel}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedCustomerId(c.customerId)}
                      className="btn-table-action flex items-center gap-1"
                    >
                      <Eye size={12} />
                      <span>360</span>
                    </button>
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
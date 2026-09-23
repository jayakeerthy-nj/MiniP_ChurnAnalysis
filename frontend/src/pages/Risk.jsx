import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi } from "../services/api";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { RiskChart } from "../components/charts/RiskChart";
import { CustomerRiskBadge } from "../components/customers/CustomerRiskBadge";
import { Loading } from "../components/ui/Loading";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { ShieldAlert, AlertTriangle, ArrowUpRight, Activity } from "lucide-react";

export const Risk = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRisk();
  }, []);

  const fetchRisk = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsApi.getRisk();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load risk analytics:", err);
      setError("Unable to load portfolio risk matrix.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Compiling Institutional Risk Matrix..." fullPage />;
  }

  const {
    riskByAge = [],
    riskByProducts = [],
    riskByDigitalUsage = [],
    highRiskWatchlist = []
  } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        category="EXPOSURE ARCHITECTURE"
        title="Risk Matrix & High-Vulnerability Watchlist"
        subtitle="Multivariate decomposition of customer churn risk across demographics, product density, and digital adoption channels."
      />

      {/* Grid of Risk Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Risk by Age */}
        <Card
          title="Risk by Age Cohort"
          subtitle="Churn vulnerability across generation bands"
        >
          <div className="space-y-3 font-mono text-xs">
            {riskByAge.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-300">{item.cohort || item.ageBand}</span>
                  <span className="font-bold text-white">
                    {formatPercent(item.churnRate || item.avgChurnRate || 0)}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-subtle rounded overflow-hidden">
                  <div
                    className="h-full bg-primary rounded"
                    style={{ width: `${Math.min(100, (item.churnRate || 0) * 2.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk by Products */}
        <Card
          title="Risk by Product Density"
          subtitle="Account stickiness vs product holding count"
        >
          <div className="space-y-3 font-mono text-xs">
            {riskByProducts.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-300">{item.products || item.productCount} Products</span>
                  <span className="font-bold text-white">
                    {formatPercent(item.churnRate || item.avgChurnRate || 0)}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-subtle rounded overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded"
                    style={{ width: `${Math.min(100, (item.churnRate || 0) * 2.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk by Digital Adoption */}
        <Card
          title="Risk by Digital Usage"
          subtitle="Online & mobile banking activity tiers"
        >
          <div className="space-y-3 font-mono text-xs">
            {riskByDigitalUsage.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-300">{item.tier || item.usageLevel}</span>
                  <span className="font-bold text-white">
                    {formatPercent(item.churnRate || item.avgChurnRate || 0)}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-subtle rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded"
                    style={{ width: `${Math.min(100, (item.churnRate || 0) * 2.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Full Watchlist Table */}
      <Card
        title="Active Risk Watchlist (High & Critical Accounts)"
        subtitle="Ranked priority customer accounts requiring relationship manager outreach"
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="bank-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>City</th>
                <th>Current Balance</th>
                <th>Risk Tier</th>
                <th>Grievances</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {highRiskWatchlist.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted font-mono">
                    No high-risk accounts currently logged
                  </td>
                </tr>
              ) : (
                highRiskWatchlist.map((c) => (
                  <tr key={c.customerId}>
                    <td className="font-mono font-bold text-neutral-200">
                      {c.customerId}
                    </td>
                    <td className="font-medium text-white">{c.name}</td>
                    <td className="text-muted font-mono">{c.city || "Urban"}</td>
                    <td className="font-mono font-bold text-neutral-100">
                      {formatCurrency(c.currentBalance)}
                    </td>
                    <td>
                      <CustomerRiskBadge
                        level={c.predictedRiskLevel}
                        probability={c.predictedChurnProb}
                      />
                    </td>
                    <td className="font-mono text-muted">
                      {c.unresolvedComplaints || 0} Open
                    </td>
                    <td className="text-right font-mono">
                      <Link
                        to={`/customers/${c.customerId}`}
                        className="text-[11px] text-primary hover:text-white font-semibold"
                      >
                        INVESTIGATE &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Risk;

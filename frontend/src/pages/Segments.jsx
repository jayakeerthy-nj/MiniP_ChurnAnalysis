import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsApi } from "../services/api";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { SegmentChart } from "../components/charts/SegmentChart";
import { Loading } from "../components/ui/Loading";
import { formatCurrency, formatPercent, formatNumber } from "../utils/formatters";
import { Users, PieChart, Activity, Wallet, ShieldAlert, ArrowUpRight } from "lucide-react";

export const Segments = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsApi.getSegments();
      setSegments(res.data.segments || []);
    } catch (err) {
      console.error("Failed to load segments:", err);
      setError("Unable to load customer behavioral segments.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Computing K-Means cluster profiles..." fullPage />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        category="UNSUPERVISED ML"
        title="Customer Behavioral Segments (K-Means)"
        subtitle="Unsupervised multi-attribute clustering identifying structural customer archetypes across transactional velocity, balance tiers, and channel preferences."
      />

      {/* Cluster Overview Chart */}
      <Card
        title="Segment Risk & Engagement Comparison"
        subtitle="Average churn probability vs engagement index per cluster"
      >
        <SegmentChart data={segments} height={260} />
      </Card>

      {/* Cluster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {segments.map((seg) => {
          const metrics = seg.metrics || {};
          const churnRate = metrics.avgChurnProbability || seg.churnRate || 0;
          return (
            <Card
              key={seg.clusterId}
              title={seg.clusterName || `Cluster #${seg.clusterId}`}
              badge={
                <span className="text-[10px] font-mono bg-primary/15 text-primary border border-primary/30 px-1.5 py-0.5 rounded">
                  {formatNumber(seg.size || seg.count)} Accounts
                </span>
              }
              subtitle={seg.description || "Behavioral archetype cohort"}
            >
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Avg Balance</span>
                    <span className="text-white font-bold">
                      {formatCurrency(metrics.avgBalance || seg.avgBalance)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Churn Rate</span>
                    <span
                      className={`font-bold ${
                        churnRate > 0.3 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {formatPercent(churnRate * (churnRate < 1 ? 100 : 1))}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Engagement</span>
                    <span className="text-neutral-200">
                      {(metrics.avgEngagementScore || seg.avgEngagement || 50).toFixed(0)} / 100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted uppercase block">Digital Adoption</span>
                    <span className="text-primary font-semibold">
                      {formatPercent(metrics.avgDigitalUsage || seg.avgDigitalUsage || 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                  <span className="text-muted">Product Holdings:</span>
                  <span className="text-white font-bold">
                    {(metrics.avgProducts || seg.avgProducts || 1).toFixed(1)} avg
                  </span>
                </div>

                <Link
                  to={`/customers?segment=${seg.clusterId}`}
                  className="mt-2 block w-full text-center py-1.5 bg-surface-subtle hover:bg-surface-hover border border-border rounded text-[11px] text-primary font-semibold uppercase tracking-wider transition-colors"
                >
                  View Cohort Customers &rarr;
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Segments;

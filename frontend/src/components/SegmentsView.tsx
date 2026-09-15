"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { Users, PieChart, ArrowUpRight } from "lucide-react";

export const SegmentsView: React.FC = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveTab } = useAuthStore();

  useEffect(() => {
    api.get("/analytics/segments")
      .then((res) => setSegments(res.data.segments || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-cyanMain font-mono animate-pulse">Analyzing K-Means Clusters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="panel-card bg-gradient-to-r from-card to-subtle border-l-4 border-l-cyanMain">
        <span className="panel-tag">UNSUPERVISED CUSTOMER SEGMENTATION</span>
        <h2 className="text-xl font-bold text-white">K-Means Customer Behavioral Clusters (k=5)</h2>
        <p className="text-xs text-muted mt-1">
          Clusters automatically formed on standardized banking activity dimensions (balance, engagement velocity, product holdings, digital usage, service friction).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {segments.map((seg) => (
          <div key={seg.clusterId} className="panel-card hover:border-cyanMain/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-subtle text-cyanMain border border-borderBright">
                Cluster {seg.clusterId}
              </span>
              <span className="tag-pill font-mono" style={{ backgroundColor: `${seg.color}22`, color: seg.color }}>
                {seg.churnRate}% Churn
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{seg.label}</h3>
            <p className="text-xs text-muted mt-1 min-h-[38px] leading-relaxed">{seg.description}</p>

            <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-borderMuted text-xs">
              <div>
                <span className="text-muted block text-[11px]">Size / Share:</span>
                <span className="font-mono text-white font-bold">{seg.size} ({seg.percentage}%)</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Avg Balance:</span>
                <span className="font-mono text-cyanBright font-bold">₹{Number(seg.avgBalance).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Engagement Score:</span>
                <span className="font-mono text-white">{seg.avgEngagement}/100</span>
              </div>
              <div>
                <span className="text-muted block text-[11px]">Digital Usage:</span>
                <span className="font-mono text-white">{seg.digitalUsage}%</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("customers")}
              className="link-btn w-full text-center block pt-2 border-t border-borderMuted text-xs text-cyanMain hover:underline"
            >
              Filter Segment Customers &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
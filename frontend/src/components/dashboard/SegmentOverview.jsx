import React from "react";
import { Link } from "react-router-dom";
import { ChartCard, BarCompare } from "@/components/ui/revenue-charts-kpi";
import { ArrowUpRight } from "lucide-react";

export const SegmentOverview = ({ segments = [] }) => {
  const defaultSegments = [
    { name: "High Net Wealth", churnRate: 8.2, engagementScore: 84 },
    { name: "Digital Transactors", churnRate: 11.5, engagementScore: 78 },
    { name: "Credit Heavy", churnRate: 16.8, engagementScore: 65 },
    { name: "Dormant Savers", churnRate: 24.3, engagementScore: 42 },
    { name: "Marginal Retail", churnRate: 19.1, engagementScore: 56 }
  ];

  const chartData = (segments.length > 0 ? segments : defaultSegments).map((s) => ({
    name: s.clusterName || s.name || `Cluster ${s.clusterId}`,
    churnRate: Number((s.metrics?.avgChurnProbability ? s.metrics.avgChurnProbability * 100 : s.churnRate || 0).toFixed(1)),
    engagementScore: Number((s.metrics?.avgEngagementScore || s.engagementScore || s.avgEngagement || 60).toFixed(1))
  }));

  return (
    <ChartCard
      title="Behavioral Segment Profiles"
      subtitle="K-Means (k=5) cluster comparison of churn velocity vs engagement"
      actions={
        <Link
          to="/segments"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-white transition-colors"
        >
          <span>All Segments</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <BarCompare
        data={chartData}
        xKey="name"
        height={240}
        format={(v) => `${Number(v).toFixed(1)}`}
        description="Behavioral cluster comparison: Churn Rate (%) vs Engagement Index"
        series={[
          { key: "churnRate", label: "Churn Rate (%)", slot: 5 },
          { key: "engagementScore", label: "Engagement Score", slot: 1 }
        ]}
      />
    </ChartCard>
  );
};

export default SegmentOverview;

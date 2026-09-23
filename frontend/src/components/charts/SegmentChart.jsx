import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { formatCurrency, formatPercent } from "../../utils/formatters";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border px-3 py-2 rounded shadow-xl font-mono text-xs">
        <div className="text-white font-bold mb-1">{label}</div>
        {payload.map((entry, index) => (
          <div
            key={`tt-${index}`}
            className="flex items-center justify-between gap-4 text-muted"
          >
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-white font-bold">
              {entry.name.includes("Rate") || entry.name.includes("Churn")
                ? formatPercent(entry.value)
                : entry.name.includes("Balance")
                ? formatCurrency(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const SegmentChart = ({ data = [], height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-muted font-mono text-xs"
      >
        No segment comparison data
      </div>
    );
  }

  const chartData = data.map((s) => ({
    name: s.clusterName || `Cluster ${s.clusterId}`,
    churnRate: s.metrics?.avgChurnProbability
      ? s.metrics.avgChurnProbability * 100
      : s.churnRate || 0,
    engagementScore: s.metrics?.avgEngagementScore || s.avgEngagement || 0,
    size: s.size || s.count || 0
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#27272a" }}
            fontFamily="monospace"
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#27272a" }}
            fontFamily="monospace"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={30}
            formatter={(value) => (
              <span className="text-xs font-mono text-neutral-300 mr-2">{value}</span>
            )}
          />
          <Bar
            name="Churn Rate (%)"
            dataKey="churnRate"
            fill="#ef4444"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            name="Engagement Score"
            dataKey="engagementScore"
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SegmentChart;

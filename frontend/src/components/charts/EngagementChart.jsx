import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { formatPercent } from "../../utils/formatters";

export const EngagementChart = ({ data = [], height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-muted font-mono text-xs"
      >
        No engagement metrics available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="bucket"
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
            tickFormatter={(val) => `${val}%`}
            fontFamily="monospace"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-surface border border-border px-3 py-2 rounded shadow-xl font-mono text-xs">
                    <div className="text-white font-bold mb-1">{label}</div>
                    <div className="text-primary flex justify-between gap-4">
                      <span>Avg Churn Rate:</span>
                      <span className="font-bold">{payload[0]?.value}%</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="churnRate"
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EngagementChart;

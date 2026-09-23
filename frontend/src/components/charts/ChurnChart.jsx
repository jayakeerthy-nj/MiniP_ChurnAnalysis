import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { formatPercent } from "../../utils/formatters";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border px-3 py-2 rounded shadow-xl font-mono text-xs">
        <div className="text-white font-bold mb-1">{label}</div>
        <div className="text-primary flex items-center justify-between gap-4">
          <span>Churn Rate:</span>
          <span className="font-bold">{payload[0]?.value?.toFixed(1)}%</span>
        </div>
        {payload[1] && (
          <div className="text-muted flex items-center justify-between gap-4">
            <span>Activity Vol:</span>
            <span>{payload[1]?.value?.toLocaleString()}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ChurnChart = ({ data = [], height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-muted font-mono text-xs"
      >
        No trend data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
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
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="churnRate"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#churnGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChurnChart;

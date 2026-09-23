import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

const RISK_COLORS = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444"
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-surface border border-border px-3 py-2 rounded shadow-xl font-mono text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: RISK_COLORS[d.level] || "#3b82f6" }}
          />
          <span className="text-white font-bold">{d.level} RISK</span>
        </div>
        <div className="text-muted flex justify-between gap-4">
          <span>Customers:</span>
          <span className="text-white font-bold">{d.count?.toLocaleString()}</span>
        </div>
        <div className="text-muted flex justify-between gap-4">
          <span>Share:</span>
          <span className="text-white font-bold">{d.percentage?.toFixed(1)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const RiskChart = ({ data = [], height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-muted font-mono text-xs"
      >
        No risk distribution data
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    name: `${item.level} (${item.percentage?.toFixed(0)}%)`
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="count"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={RISK_COLORS[entry.level] || "#3b82f6"}
                stroke="#121216"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-mono text-neutral-300 mr-2">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskChart;

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

const BNW_COLORS = {
  LOW: "#ffffff",
  MEDIUM: "#a1a1aa",
  HIGH: "#71717a",
  CRITICAL: "#3f3f46"
};

export const RiskOverview = ({ riskDistribution = [], modelName = "BankShield-Hybrid" }) => {
  const defaultDistribution = [
    { level: "LOW", count: 940, percentage: 78.3 },
    { level: "MEDIUM", count: 0, percentage: 0 },
    { level: "HIGH", count: 42, percentage: 3.5 },
    { level: "CRITICAL", count: 218, percentage: 18.2 }
  ];

  const sourceData = riskDistribution.length > 0 ? riskDistribution : defaultDistribution;

  const chartData = sourceData.map((d) => ({
    name: `${d.level.charAt(0) + d.level.slice(1).toLowerCase()} Risk`,
    value: d.count || 0,
    percentage: d.percentage || 0,
    color: BNW_COLORS[d.level] || "#71717a"
  }));

  return (
    <div className="rounded-[16px] bg-card p-5 ring-1 ring-border flex flex-col justify-between">
      {/* Header */}
      <div>
        <h3 className="text-[16px] font-semibold text-foreground tracking-[-0.01em]">
          Risk Distribution by Tier
        </h3>
        <p className="text-[12px] text-neutral-400 mt-0.5">
          {modelName} classification
        </p>

        {/* BNW Donut Chart */}
        <div className="h-[155px] w-full mt-3 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={68}
                stroke="#131316"
                strokeWidth={2}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-[8px] bg-popover px-2.5 py-1.5 text-[11px] text-white shadow-xl ring-1 ring-border">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-neutral-300 tabular-nums">
                        {item.value.toLocaleString()} accounts ({item.percentage}%)
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend with small square swatches */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-[11px] text-neutral-300">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-[2px] shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-foreground">{item.name}</span>
            <span className="tabular-nums text-neutral-400">({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskOverview;

import React from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip
} from "recharts";
import { ArrowDownRight, ArrowRight } from "lucide-react";

export const CriticalRiskTrend = ({ trendData = [] }) => {
  const chartData = (trendData.length > 0 ? trendData : [
    { month: "Jan", val: 3.8 },
    { month: "Mar", val: 3.2 },
    { month: "May", val: 4.1 },
    { month: "Jul", val: 3.5 },
    { month: "Sep", val: 2.9 },
    { month: "Nov", val: 2.6 }
  ]).map((d) => ({
    label: d.month,
    val: d.criticalRiskCount ? Number(((d.criticalRiskCount / 1200) * 100).toFixed(1)) : (d.val || 2.6)
  }));

  const currentVal = chartData[chartData.length - 1]?.val || 2.6;

  return (
    <div className="rounded-[16px] bg-card p-5 ring-1 ring-border flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-[16px] font-semibold text-foreground tracking-[-0.01em]">
              Critical risk rate
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Last 12 months</p>
          </div>
          <div className="text-right">
            <span className="text-[17px] font-semibold text-foreground tabular-nums">
              {currentVal}%
            </span>
            <p className="text-[11px] text-muted-foreground">of accounts critical</p>
          </div>
        </div>

        {/* Minimalist line curve */}
        <div className="h-[140px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 10, left: 10, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickMargin={8}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-[8px] bg-popover px-2.5 py-1.5 text-[11px] text-white shadow-xl ring-1 ring-border">
                      <span className="tabular-nums font-medium">{payload[0]?.value}% critical</span>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="val"
                stroke="#ffffff"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#131316", fill: "#ffffff" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer matching Image 2 */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[12px]">
        <span className="inline-flex items-center gap-0.5 text-emerald-400 font-medium">
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>1.2% vs baseline period</span>
        </span>
        <Link
          to="/risk"
          className="inline-flex items-center gap-1 font-medium text-foreground hover:text-white transition-colors"
        >
          <span>Risk matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default CriticalRiskTrend;

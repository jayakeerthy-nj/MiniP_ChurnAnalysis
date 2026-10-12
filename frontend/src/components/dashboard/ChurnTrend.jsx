import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { ChevronDown, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";

export const ChurnTrend = ({ trendData = [] }) => {
  const [range, setRange] = useState("12m");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const rawData = trendData.length > 0 ? trendData : [
    { month: "Jan", churnRate: 14.8 },
    { month: "Feb", churnRate: 15.2 },
    { month: "Mar", churnRate: 15.9 },
    { month: "Apr", churnRate: 16.4 },
    { month: "May", churnRate: 15.8 },
    { month: "Jun", churnRate: 17.1 },
    { month: "Jul", churnRate: 18.2 },
    { month: "Aug", churnRate: 17.6 },
    { month: "Sep", churnRate: 18.9 },
    { month: "Oct", churnRate: 19.3 },
    { month: "Nov", churnRate: 18.7 },
    { month: "Dec", churnRate: 18.2 }
  ];

  const slicedData = range === "6m" ? rawData.slice(-6) : rawData;
  const firstRate = slicedData[0]?.churnRate || 15;
  const lastRate = slicedData[slicedData.length - 1]?.churnRate || 18.2;
  const delta = firstRate > 0 ? (lastRate - firstRate) / firstRate : 0;

  return (
    <div className="rounded-[16px] bg-card p-5 ring-1 ring-border">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[17px] font-semibold text-foreground tracking-[-0.01em]">
            Attrition Trajectory
          </h2>
        </div>

        {/* Range Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-muted/70 hover:bg-muted text-[12.5px] font-medium text-foreground ring-1 ring-border transition-colors"
          >
            <span>{range === "12m" ? "Last 12 months" : "Last 6 months"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 rounded-[10px] bg-popover ring-1 ring-border shadow-xl py-1 z-20 text-[12.5px]">
              <button
                onClick={() => {
                  setRange("12m");
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-muted/50 transition-colors ${
                  range === "12m" ? "text-white font-medium" : "text-muted-foreground"
                }`}
              >
                Last 12 months
              </button>
              <button
                onClick={() => {
                  setRange("6m");
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-muted/50 transition-colors ${
                  range === "6m" ? "text-white font-medium" : "text-muted-foreground"
                }`}
              >
                Last 6 months
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Monochrome Line/Area Chart */}
      <div className="h-[250px] w-full" aria-label="12-Month Attrition Trajectory">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={slicedData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bnwAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.10} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.00} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#222226" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
              width={46}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-[10px] bg-popover px-3 py-2 text-[12px] text-popover-foreground shadow-xl ring-1 ring-border">
                    <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
                    <p className="font-medium text-white tabular-nums">
                      {Number(payload[0]?.value).toFixed(1)}% churn rate
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="churnRate"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#bnwAreaGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#131316", fill: "#ffffff" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer matching Image 1 */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[12.5px]">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${
              delta <= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(delta * 100).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">
            vs first month in {range === "12m" ? "last 12 months" : "last 6 months"}
          </span>
        </div>

        <Link
          to="/churn"
          className="inline-flex items-center gap-1 font-medium text-foreground hover:text-white transition-colors"
        >
          <span>View report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ChurnTrend;

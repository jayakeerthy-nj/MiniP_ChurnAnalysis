import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatPercent, formatNumber } from "../../utils/formatters";

export const KPIGrid = ({ kpis = {} }) => {
  const cards = [
    {
      title: "Total portfolio customers",
      value: formatNumber(kpis.totalCustomers || 1200),
      delta: 0.032,
      positive: true,
      period: "vs prior 30 days"
    },
    {
      title: "Portfolio churn rate",
      value: formatPercent(kpis.churnRate || 0.193),
      delta: -0.018,
      positive: true, // churn reduction is positive
      period: "vs prior 30 days"
    },
    {
      title: "High-risk accounts",
      value: formatNumber(kpis.highRiskCount || 231),
      delta: 0.024,
      positive: false, // risk increase is negative
      period: "vs prior 30 days"
    },
    {
      title: "Average account balance",
      value: formatCurrency(kpis.avgBalance || 130888),
      delta: 0.048,
      positive: true,
      period: "vs prior 30 days"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="rounded-[16px] bg-card p-5 ring-1 ring-border flex flex-col justify-between"
        >
          <span className="text-[13px] font-normal text-muted-foreground">{card.title}</span>
          <div className="my-2.5">
            <span className="text-[28px] font-semibold tracking-tight text-foreground tabular-nums">
              {card.value}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                card.positive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {card.delta >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(card.delta * 100).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{card.period}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIGrid;

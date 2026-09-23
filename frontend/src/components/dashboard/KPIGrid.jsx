import React from "react";
import {
  Users,
  UserCheck,
  TrendingDown,
  ShieldAlert,
  AlertOctagon,
  Wallet,
  Activity
} from "lucide-react";
import { formatCurrency, formatPercent, formatNumber } from "../../utils/formatters";

export const KPIGrid = ({ kpis = {} }) => {
  const cards = [
    {
      title: "Total Portfolio",
      value: formatNumber(kpis.totalCustomers),
      subtitle: `${formatNumber(kpis.activeCustomers)} Active Accounts`,
      icon: Users,
      color: "text-blue-400",
      border: "border-t-blue-500"
    },
    {
      title: "Portfolio Churn Rate",
      value: formatPercent(kpis.churnRate || 0),
      subtitle: `${formatNumber(kpis.churnedCustomers)} Attrited`,
      icon: TrendingDown,
      color: "text-orange-400",
      border: "border-t-orange-500"
    },
    {
      title: "High Risk Accounts",
      value: formatNumber(kpis.highRiskCount),
      subtitle: "Probability > 60%",
      icon: ShieldAlert,
      color: "text-amber-400",
      border: "border-t-amber-500"
    },
    {
      title: "Critical Vulnerability",
      value: formatNumber(kpis.criticalRiskCount),
      subtitle: "Immediate Intervention",
      icon: AlertOctagon,
      color: "text-red-400",
      border: "border-t-red-500"
    },
    {
      title: "Average Balance",
      value: formatCurrency(kpis.avgBalance),
      subtitle: `Total: ${formatCurrency(kpis.totalBalance)}`,
      icon: Wallet,
      color: "text-emerald-400",
      border: "border-t-emerald-500"
    },
    {
      title: "Avg Engagement Index",
      value: `${(kpis.avgEngagementScore || 0).toFixed(1)} / 100`,
      subtitle: `${formatNumber(kpis.unresolvedComplaints)} Grievances Open`,
      icon: Activity,
      color: "text-primary",
      border: "border-t-primary"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-surface border border-border ${card.border} border-t-2 rounded-md p-3.5 flex flex-col justify-between shadow-sm`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] font-bold text-muted uppercase font-mono tracking-wider">
                {card.title}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
            </div>
            <div>
              <div className="text-base lg:text-lg font-extrabold text-white font-mono tracking-tight">
                {card.value}
              </div>
              <div className="text-[10px] text-muted-dark font-mono mt-0.5 truncate">
                {card.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPIGrid;

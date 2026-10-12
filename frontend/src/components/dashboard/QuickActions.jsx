import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ShieldAlert,
  Users,
  Download,
  ChevronRight
} from "lucide-react";

export const QuickActions = () => {
  const actions = [
    {
      title: "Run churn simulation",
      subtitle: "Test rates & interventions",
      icon: Activity,
      href: "/simulator"
    },
    {
      title: "Review high-risk accounts",
      subtitle: "Priority watchlist accounts",
      icon: ShieldAlert,
      href: "/customers?risk=HIGH"
    },
    {
      title: "Behavioral segments",
      subtitle: "K-Means cluster profiles",
      icon: Users,
      href: "/segments"
    },
    {
      title: "Export risk telemetry",
      subtitle: "Download CSV datasets",
      icon: Download,
      href: "/reports"
    }
  ];

  return (
    <div className="rounded-[16px] bg-card p-5 ring-1 ring-border flex flex-col justify-between">
      {/* Header */}
      <div>
        <h3 className="text-[16px] font-semibold text-foreground tracking-[-0.01em]">
          Quick actions
        </h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Shortcuts to key destinations.
        </p>
      </div>

      {/* Action Items matching Image 2 */}
      <div className="mt-3 space-y-2">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <Link
              key={i}
              to={act.href}
              className="flex items-center justify-between p-2.5 rounded-[12px] bg-muted/40 hover:bg-muted/80 ring-1 ring-border/50 hover:ring-border transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[8px] bg-card ring-1 ring-border flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-[12.5px] font-medium text-foreground group-hover:text-white transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{act.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;

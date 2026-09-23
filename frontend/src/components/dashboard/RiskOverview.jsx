import React from "react";
import { Card } from "../ui/Card";
import { RiskChart } from "../charts/RiskChart";
import { ShieldAlert } from "lucide-react";

export const RiskOverview = ({ riskDistribution = [] }) => {
  return (
    <Card
      title="Portfolio Risk Segmentation"
      subtitle="Multivariate exposure across predicted risk tiers"
      badge={
        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono bg-amber-950/40 border border-amber-600/30 px-1.5 py-0.5 rounded">
          <ShieldAlert className="w-3 h-3" />
          <span>XGBOOST CLASSIFIER</span>
        </div>
      }
    >
      <RiskChart data={riskDistribution} height={220} />
    </Card>
  );
};

export default RiskOverview;

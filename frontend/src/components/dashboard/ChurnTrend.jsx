import React from "react";
import { Card } from "../ui/Card";
import { ChurnChart } from "../charts/ChurnChart";
import { TrendingDown } from "lucide-react";

export const ChurnTrend = ({ trendData = [] }) => {
  return (
    <Card
      title="12-Month Attrition Trajectory"
      subtitle="Historical churn percentage and customer activity trends"
      badge={
        <div className="flex items-center gap-1 text-[10px] text-primary font-mono bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded">
          <TrendingDown className="w-3 h-3" />
          <span>TREND LINE</span>
        </div>
      }
    >
      <ChurnChart data={trendData} height={220} />
    </Card>
  );
};

export default ChurnTrend;

import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/Card";
import { SegmentChart } from "../charts/SegmentChart";
import { PieChart, ArrowUpRight } from "lucide-react";

export const SegmentOverview = ({ segments = [] }) => {
  return (
    <Card
      title="Behavioral Segment Profiles"
      subtitle="K-Means (k=5) cluster churn velocity and engagement"
      action={
        <Link
          to="/segments"
          className="text-[11px] text-primary hover:text-white font-mono flex items-center gap-1 uppercase"
        >
          <span>All Segments</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <SegmentChart data={segments} height={220} />
    </Card>
  );
};

export default SegmentOverview;

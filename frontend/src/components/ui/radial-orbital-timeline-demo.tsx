"use client";
import React from "react";
import {
  Activity,
  Sliders,
  Sparkles,
  PieChart,
  ShieldAlert,
  Cpu,
  Layers,
  BarChart3
} from "lucide-react";
import RadialOrbitalTimeline, { TimelineItem } from "@/components/ui/radial-orbital-timeline";

export const bankingPipelineTimelineData: TimelineItem[] = [
  {
    id: 1,
    title: "Real-time Telemetry",
    date: "Stage 01",
    content: "Stream transaction logs, balance fluctuations, and service ticket frequencies through Kafka & FastAPI ingestion pipelines.",
    category: "Ingestion",
    icon: Cpu,
    relatedIds: [2],
    status: "completed",
    energy: 98,
  },
  {
    id: 2,
    title: "XGBoost Calibration",
    date: "Stage 02",
    content: "Isotonic regression calibrates raw tree probabilities to reflect true mathematical churn likelihoods across accounts.",
    category: "Classification",
    icon: ShieldAlert,
    relatedIds: [1, 3],
    status: "completed",
    energy: 94,
  },
  {
    id: 3,
    title: "K-Means Clustering",
    date: "Stage 03",
    content: "Unsupervised clustering categorizes customers into 5 structural behavioral profiles (Dormant, Wealth, Active, Friction).",
    category: "Segmentation",
    icon: PieChart,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 88,
  },
  {
    id: 4,
    title: "SHAP Explainability",
    date: "Stage 04",
    content: "Decomposes risk drivers into auditable feature contributions (e.g., tenure drops, digital inactivity, credit utilization).",
    category: "Explainability",
    icon: Activity,
    relatedIds: [3, 5],
    status: "in-progress",
    energy: 82,
  },
  {
    id: 5,
    title: "Counterfactuals",
    date: "Stage 05",
    content: "Interactive what-if simulations compute minimum parameter shifts required to flip accounts into safe retention thresholds.",
    category: "Simulation",
    icon: Sliders,
    relatedIds: [4, 6],
    status: "completed",
    energy: 90,
  },
  {
    id: 6,
    title: "AI Action Briefs",
    date: "Stage 06",
    content: "Generative Gemini summaries formulate institutional retention playbooks, fee waiver recommendations, and relationship reviews.",
    category: "Synthesis",
    icon: Sparkles,
    relatedIds: [5],
    status: "in-progress",
    energy: 75,
  }
];

export function RadialOrbitalTimelineDemo() {
  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <RadialOrbitalTimeline timelineData={bankingPipelineTimelineData} />
    </div>
  );
}

export default RadialOrbitalTimelineDemo;

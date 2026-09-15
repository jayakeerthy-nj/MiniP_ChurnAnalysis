"use client";

import React, { useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Header } from "../../components/Header";
import { useAuthStore } from "../../stores/authStore";

import { DashboardView } from "../../components/DashboardView";
import { CustomerExplorerView } from "../../components/CustomerExplorerView";
import { CustomerDetailView } from "../../components/CustomerDetailView";
import { RiskMatrixView } from "../../components/RiskMatrixView";
import { SimulatorView } from "../../components/SimulatorView";
import { SegmentsView } from "../../components/SegmentsView";
import { ChurnAnalyticsView } from "../../components/ChurnAnalyticsView";
import { RecommendationsView } from "../../components/RecommendationsView";
import { ReportsView } from "../../components/ReportsView";
import { AdminView } from "../../components/AdminView";

export default function WorkspacePage() {
  const { activeTab, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "customers":
        return <CustomerExplorerView />;
      case "customer-detail":
        return <CustomerDetailView />;
      case "risk":
        return <RiskMatrixView />;
      case "simulator":
        return <SimulatorView />;
      case "segments":
        return <SegmentsView />;
      case "churn":
        return <ChurnAnalyticsView />;
      case "recommendations":
        return <RecommendationsView />;
      case "reports":
        return <ReportsView />;
      case "admin":
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="main-body">
        <Header />
        <div className="view-content mt-6">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

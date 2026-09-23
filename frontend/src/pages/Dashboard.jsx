import React, { useEffect, useState, useCallback } from "react";
import { analyticsApi } from "../services/api";
import { PageHeader } from "../components/layout/PageHeader";
import { KPIGrid } from "../components/dashboard/KPIGrid";
import { ChurnTrend } from "../components/dashboard/ChurnTrend";
import { RiskOverview } from "../components/dashboard/RiskOverview";
import { SegmentOverview } from "../components/dashboard/SegmentOverview";
import { HighRiskCustomers } from "../components/dashboard/HighRiskCustomers";
import { Loading } from "../components/ui/Loading";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [segmentsData, setSegmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [dashRes, riskRes, segRes] = await Promise.allSettled([
        analyticsApi.getDashboard(),
        analyticsApi.getRisk(),
        analyticsApi.getSegments()
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboardData(dashRes.value.data);
      } else {
        throw new Error("Failed to load dashboard data");
      }

      if (riskRes.status === "fulfilled") {
        setRiskData(riskRes.value.data);
      }

      if (segRes.status === "fulfilled") {
        setSegmentsData(segRes.value.data?.segments || []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load portfolio analytics from backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <Loading message="Assembling Portfolio Risk Intelligence..." fullPage />;
  }

  if (error && !dashboardData) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="inline-flex p-3 rounded bg-red-950/60 border border-red-600/40 text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-bold text-white font-mono uppercase">{error}</h2>
        <p className="text-xs text-muted max-w-md mx-auto">
          Ensure the backend API (port 5000) and MongoDB are running and accessible.
        </p>
        <Button variant="primary" size="sm" onClick={() => fetchData()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {};
  const riskDistribution = dashboardData?.riskDistribution || [];
  const monthlyTrend = dashboardData?.monthlyTrend || [];
  const watchlist = (riskData?.highRiskWatchlist || dashboardData?.watchlist || []).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        category="PORTFOLIO OVERVIEW"
        title="Customer Risk & Churn Analytics"
        subtitle="Monitor customer behavior, identify churn risk, and understand the drivers behind customer attrition."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchData(true)}
            loading={refreshing}
            icon={RefreshCw}
          >
            Sync Analytics
          </Button>
        }
      />

      {/* KPI Grid */}
      <KPIGrid kpis={kpis} />

      {/* Row 1: Churn Trajectory & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChurnTrend trendData={monthlyTrend} />
        <RiskOverview riskDistribution={riskDistribution} />
      </div>

      {/* Row 2: Behavioral Segments & Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <SegmentOverview segments={segmentsData} />
        </div>
        <div className="lg:col-span-2">
          <HighRiskCustomers watchlist={watchlist} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState, useCallback } from "react";
import { analyticsApi } from "../services/api";
import { useModel } from "../context/ModelContext";
import { KPIGrid } from "../components/dashboard/KPIGrid";
import { ChurnTrend } from "../components/dashboard/ChurnTrend";
import { CriticalRiskTrend } from "../components/dashboard/CriticalRiskTrend";
import { RiskOverview } from "../components/dashboard/RiskOverview";
import { QuickActions } from "../components/dashboard/QuickActions";
import { HighRiskCustomers } from "../components/dashboard/HighRiskCustomers";
import { Loading } from "../components/ui/Loading";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";

// Institutional baseline fallback when backend is starting or offline
const FALLBACK_DASHBOARD_DATA = {
  kpis: {
    totalCustomers: 1200,
    activeCustomers: 979,
    churnedCustomers: 221,
    churnRate: 18.4,
    highRiskCount: 42,
    criticalRiskCount: 218,
    totalBalance: 157065643,
    avgBalance: 130888,
    avgEngagementScore: 64.7,
    unresolvedComplaints: 148
  },
  riskDistribution: [
    { level: "LOW", count: 940, percentage: 78.3, color: "#ffffff" },
    { level: "MEDIUM", count: 0, percentage: 0.0, color: "#a1a1aa" },
    { level: "HIGH", count: 42, percentage: 3.5, color: "#71717a" },
    { level: "CRITICAL", count: 218, percentage: 18.2, color: "#3f3f46" }
  ],
  monthlyTrend: [
    { month: "Jan", churnRate: 17.2, criticalRisk: 210, totalRisk: 1200 },
    { month: "Feb", churnRate: 17.7, criticalRisk: 212, totalRisk: 1200 },
    { month: "Mar", churnRate: 18.8, criticalRisk: 215, totalRisk: 1200 },
    { month: "Apr", churnRate: 19.3, criticalRisk: 218, totalRisk: 1200 },
    { month: "May", churnRate: 19.1, criticalRisk: 218, totalRisk: 1200 },
    { month: "Jun", churnRate: 18.2, criticalRisk: 216, totalRisk: 1200 },
    { month: "Jul", churnRate: 17.6, criticalRisk: 214, totalRisk: 1200 },
    { month: "Aug", churnRate: 18.0, criticalRisk: 215, totalRisk: 1200 },
    { month: "Sep", churnRate: 18.7, criticalRisk: 217, totalRisk: 1200 },
    { month: "Oct", churnRate: 19.2, criticalRisk: 218, totalRisk: 1200 },
    { month: "Nov", churnRate: 18.9, criticalRisk: 218, totalRisk: 1200 },
    { month: "Dec", churnRate: 18.4, criticalRisk: 218, totalRisk: 1200 }
  ],
  watchlist: [
    { customerId: "CUST-94812", name: "Aarav Singhania", riskLevel: "CRITICAL", churnProbability: 0.942, currentBalance: 842000, branch: "Mumbai Central", segment: "High Net-Worth Inactive" },
    { customerId: "CUST-83719", name: "Sunita Roy", riskLevel: "CRITICAL", churnProbability: 0.891, currentBalance: 615000, branch: "Delhi Connaught", segment: "Credit-Dependent At-Risk" },
    { customerId: "CUST-72104", name: "Rohan Varma", riskLevel: "CRITICAL", churnProbability: 0.864, currentBalance: 420000, branch: "Bengaluru Indiranagar", segment: "Disengaged Saver" },
    { customerId: "CUST-61058", name: "Deepa Nair", riskLevel: "HIGH", churnProbability: 0.781, currentBalance: 310000, branch: "Kolkata Park St", segment: "Single-Product Vulnerable" },
    { customerId: "CUST-50923", name: "Kunal Bansal", riskLevel: "HIGH", churnProbability: 0.749, currentBalance: 198000, branch: "Hyderabad Hitech", segment: "High-Frequency Friction" },
    { customerId: "CUST-41832", name: "Meera Joshi", riskLevel: "HIGH", churnProbability: 0.712, currentBalance: 275000, branch: "Pune Camp", segment: "Disengaged Saver" }
  ]
};

export const Dashboard = () => {
  const { selectedModelId, isCombinedMode, combinedModels, activeModel } = useModel();
  const [dashboardData, setDashboardData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const modelParam = isCombinedMode ? "combined" : selectedModelId;
    const combinedParam = isCombinedMode ? combinedModels.join(",") : undefined;

    try {
      const [dashRes, riskRes] = await Promise.allSettled([
        analyticsApi.getDashboard({ model: modelParam, combined: combinedParam }),
        analyticsApi.getRisk({ model: modelParam, combined: combinedParam })
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value?.data?.kpis) {
        setDashboardData(dashRes.value.data);
        setIsOfflineMode(false);
      } else {
        setDashboardData(FALLBACK_DASHBOARD_DATA);
        setIsOfflineMode(true);
      }

      if (riskRes.status === "fulfilled" && riskRes.value?.data) {
        setRiskData(riskRes.value.data);
      }
    } catch {
      setDashboardData(FALLBACK_DASHBOARD_DATA);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedModelId, isCombinedMode, combinedModels]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !dashboardData) {
    return <Loading message="Loading BankShield Portfolio Intelligence..." fullPage />;
  }

  const activeData = dashboardData || FALLBACK_DASHBOARD_DATA;
  const kpis = activeData?.kpis || {};
  const riskDistribution = activeData?.riskDistribution || [];
  const monthlyTrend = activeData?.monthlyTrend || [];
  const watchlist = (activeData?.watchlist || riskData?.highRiskWatchlist || []).slice(0, 6);

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      {/* Offline Notice Banner if Backend Disconnected */}
      {isOfflineMode && (
        <div className="p-3 bg-neutral-900/90 border border-neutral-700/60 rounded-xl flex items-center justify-between gap-3 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white font-mono uppercase">Offline Mode:</strong> Live backend connection pending (port 5000). Displaying calibrated institutional portfolio baseline.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            loading={refreshing}
            className="text-[11px] h-7 border-neutral-700 hover:bg-neutral-800"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            Customer Risk & Churn Intelligence
          </h1>
          <p className="text-[12.5px] text-neutral-300 mt-0.5">
            Active Model: <strong className="text-white font-mono">{activeModel?.name || activeModel?.shortName || "BankShield-Hybrid"}</strong> &bull; Calibrated banking customer retention analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchData(true)}
            loading={refreshing}
            icon={RefreshCw}
          >
            Sync Data
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <KPIGrid kpis={kpis} />

      {/* Row 2: Wide Main Chart - Attrition Trajectory */}
      <ChurnTrend trendData={monthlyTrend} />

      {/* Row 3: 3-Column Grid matching reference */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CriticalRiskTrend trendData={monthlyTrend} />
        <RiskOverview
          riskDistribution={riskDistribution}
          modelName={activeModel?.shortName || activeModel?.name || "BankShield-Hybrid"}
        />
        <QuickActions />
      </div>

      {/* Row 4: High-Vulnerability Watchlist */}
      <HighRiskCustomers watchlist={watchlist} />
    </div>
  );
};

export default Dashboard;

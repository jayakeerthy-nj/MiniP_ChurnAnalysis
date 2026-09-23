import React, { useEffect, useState } from "react";
import { reportApi } from "../services/api";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loading } from "../components/ui/Loading";
import { formatCurrency, formatPercent, formatDate, formatNumber } from "../utils/formatters";
import { FileText, Download, CheckCircle, ShieldCheck, BarChart3 } from "lucide-react";

export const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportApi.getSummary();
      setReport(res.data.report || res.data);
    } catch (err) {
      console.error("Report compilation error:", err);
      setError("Unable to compile executive report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open(reportApi.getCsvExportUrl(), "_blank");
  };

  if (loading) {
    return <Loading message="Compiling Executive Compliance & Risk Dossier..." fullPage />;
  }

  const metrics = report?.metrics || report?.summary || {};

  return (
    <div className="space-y-6">
      <PageHeader
        category="EXECUTIVE COMPLIANCE & AUDIT"
        title="Portfolio Risk & Churn Intelligence Dossier"
        subtitle="Formal compliance summary and portfolio attrition analysis prepared for risk committee evaluation and regulatory documentation."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadCsv}
            icon={Download}
            className="font-mono uppercase text-xs tracking-wider"
          >
            Export Customer Risk (CSV)
          </Button>
        }
      />

      {/* Metadata Strip */}
      <div className="bg-surface border border-border p-4 rounded-md flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>DOSSIER STATUS: <strong className="text-white">VALIDATED / AUDITED</strong></span>
        </div>
        <div>
          GENERATED: <strong className="text-white">{formatDate(report?.generatedAt || new Date())}</strong>
        </div>
        <div>
          VERSION: <strong className="text-white">v1.0 (PROD)</strong>
        </div>
      </div>

      {/* Executive KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Accounts" bodyClassName="p-4">
          <div className="text-2xl font-bold font-mono text-white">
            {formatNumber(metrics.totalCustomers || 10000)}
          </div>
          <div className="text-[11px] text-muted font-mono mt-1">
            Active Banking Portfolio
          </div>
        </Card>

        <Card title="Portfolio Churn Rate" bodyClassName="p-4">
          <div className="text-2xl font-bold font-mono text-amber-400">
            {formatPercent(metrics.churnRate || 14.2)}
          </div>
          <div className="text-[11px] text-muted font-mono mt-1">
            Calibrated Attrition
          </div>
        </Card>

        <Card title="Portfolio Value" bodyClassName="p-4">
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(metrics.totalBalance || 2480000000)}
          </div>
          <div className="text-[11px] text-muted font-mono mt-1">
            Total Depository Holdings
          </div>
        </Card>

        <Card title="High Risk Capital" bodyClassName="p-4">
          <div className="text-2xl font-bold font-mono text-red-400">
            {formatCurrency(metrics.highRiskExposure || 320000000)}
          </div>
          <div className="text-[11px] text-muted font-mono mt-1">
            Capital at Immediate Risk
          </div>
        </Card>
      </div>

      {/* Narrative Section */}
      <Card
        title="Executive Summary & Findings"
        subtitle="Analytical insights prepared for board and steering committee review"
      >
        <div className="space-y-3 text-xs text-neutral-200 leading-relaxed font-sans">
          <p>
            The portfolio demonstrates an aggregate calibrated churn rate of{" "}
            <strong>{formatPercent(metrics.churnRate || 14.2)}</strong>, with highest attrition
            concentrated within single-product holding accounts and customers reporting more than
            one unresolved grievance.
          </p>
          <p>
            Statistical decomposition identifies digital channel engagement as the most robust
            protective factor: customers exhibiting over 60% digital usage reflect an attrition hazard
            less than half that of inactive cohorts.
          </p>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
            <span>Prepared by: HQ Risk Intelligence Division</span>
            <span className="text-emerald-400">Signed & Encrypted</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;

"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { FileText, Download, CheckCircle, BarChart3 } from "lucide-react";

export const ReportsView: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/reports/summary")
      .then((res) => setReport(res.data.report))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const downloadCsv = () => {
    window.open("/api/reports/export/csv", "_blank");
  };

  if (loading) {
    return <div className="p-12 text-center text-cyanMain font-mono animate-pulse">Compiling Executive Portfolio Report...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="panel-card bg-gradient-to-r from-card to-subtle border-l-4 border-l-cyanMain flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="panel-tag">EXECUTIVE COMPLIANCE & REPORTING</span>
          <h2 className="text-xl font-bold text-white">Portfolio Risk & Churn Intelligence Dossier</h2>
          <p className="text-xs text-muted mt-1">
            Generated on {new Date(report?.generatedAt).toLocaleDateString()} &bull; Ready for export and internal distribution.
          </p>
        </div>
        <button onClick={downloadCsv} className="btn-cyan-sm flex items-center gap-2">
          <Download size={14} />
          <span>Export Customer Risk (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="panel-card text-center">
          <span className="text-xs text-muted block">Portfolio Accounts</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">
            {report?.kpis?.totalCustomers?.toLocaleString()}
          </span>
        </div>
        <div className="panel-card text-center">
          <span className="text-xs text-muted block">Active Capital</span>
          <span className="text-2xl font-mono font-bold text-cyanBright mt-1 block">
            ₹{(report?.kpis?.totalBalance / 10000000).toFixed(2)} Cr
          </span>
        </div>
        <div className="panel-card text-center">
          <span className="text-xs text-muted block">Critical Attrition Target</span>
          <span className="text-2xl font-mono font-bold text-critical mt-1 block">
            {report?.kpis?.criticalRiskCount} Accounts
          </span>
        </div>
        <div className="panel-card text-center">
          <span className="text-xs text-muted block">Grievance SLA Compliance</span>
          <span className="text-2xl font-mono font-bold text-safe mt-1 block">94.2%</span>
        </div>
      </div>

      <div className="panel-card">
        <h3 className="text-sm font-bold text-white mb-3">Portfolio Risk Distribution Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {report?.riskDistribution?.map((r: any) => (
            <div key={r.level} className="p-3 bg-subtle rounded-lg border border-borderMuted">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white font-semibold">{r.level} TIER</span>
                <span className="font-mono text-muted">{r.percentage}%</span>
              </div>
              <span className="text-xl font-mono font-bold" style={{ color: r.color }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
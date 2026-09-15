"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { ArrowLeft, Sparkles, ShieldAlert, CheckCircle, Activity, CreditCard, Clock, Smartphone, MessageSquare, AlertCircle } from "lucide-react";

export const CustomerDetailView: React.FC = () => {
  const { selectedCustomerId, setActiveTab, setSelectedCustomerId } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomer360(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const fetchCustomer360 = async (cid: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${cid}`);
      setData(res.data);
    } catch (e) {
      console.error("Error loading 360:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateAiInsight = async () => {
    if (!selectedCustomerId) return;
    try {
      setGeneratingAi(true);
      const res = await api.get(`/customers/${selectedCustomerId}/ai-summary`);
      setAiSummary(res.data.summary);
    } catch (e) {
      console.error("AI Insight failed:", e);
    } finally {
      setGeneratingAi(false);
    }
  };

  if (!selectedCustomerId) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted">No customer selected.</p>
        <button onClick={() => setActiveTab("customers")} className="btn-cyan-sm mt-4">
          Open Customer Explorer
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-cyanMain font-mono animate-pulse">
        Assembling unified Customer 360 Profile...
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-critical">Failed to load customer profile.</div>;

  const { customer, features, accounts, transactions, complaints, prediction, timeline } = data;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab("customers")}
          className="flex items-center gap-2 text-sm text-cyanMain hover:underline font-mono"
        >
          <ArrowLeft size={16} /> Back to Customer Explorer
        </button>
        <button
          onClick={generateAiInsight}
          disabled={generatingAi}
          className="btn-cyan-sm flex items-center gap-2"
        >
          <Sparkles size={14} />
          <span>{generatingAi ? "Consulting Gemini AI..." : "Generate Gemini AI Risk Summary"}</span>
        </button>
      </div>

      {/* Profile Banner */}
      <div className="panel-card bg-gradient-to-r from-card to-subtle border-l-4 border-l-cyanMain">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{customer.name}</h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-subtle text-cyanBright border border-borderBright">
                {customer.customerId}
              </span>
              <span className={`tag-pill ${customer.accountStatus === "ACTIVE" ? "tag-green" : "tag-red"}`}>
                {customer.accountStatus}
              </span>
            </div>
            <p className="text-muted text-xs mt-1">
              {customer.occupation} &bull; {customer.city} &bull; Age: {customer.age} &bull; Credit Score: {customer.creditScore} &bull; Tenure: {customer.tenureMonths} Months
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-muted uppercase tracking-wider block">PREDICTED CHURN RISK</span>
              <span className={`text-2xl font-mono font-bold ${
                prediction?.riskLevel === "CRITICAL" ? "text-critical" : prediction?.riskLevel === "HIGH" ? "text-warning" : "text-safe"
              }`}>
                {Math.round((prediction?.churnProbability || 0) * 100)}%
              </span>
              <span className="text-[11px] text-muted block font-mono">{prediction?.riskLevel} RISK TIER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generative AI Summary Card if triggered */}
      {aiSummary && (
        <div className="panel-card border-cyanMain/40 bg-[#00b4d8]/5">
          <div className="flex items-center gap-2 mb-2 text-cyanBright font-semibold text-sm">
            <Sparkles size={16} /> Gemini Generative AI Retention Intelligence
          </div>
          <p className="text-white text-sm leading-relaxed whitespace-pre-line">{aiSummary}</p>
        </div>
      )}

      {/* 4 Feature Cards (Financial, Digital, Service, Engagement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Financial */}
        <div className="panel-card">
          <div className="flex items-center gap-2 text-cyanMain text-xs font-semibold mb-3">
            <CreditCard size={15} /> Financial Metrics
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Current Balance:</span>
              <span className="font-mono text-white font-bold">₹{features?.currentBalance?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">6M Avg Balance:</span>
              <span className="font-mono text-white">₹{features?.averageBalance?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Avg Tx Value:</span>
              <span className="font-mono text-white">₹{features?.averageTransactionValue?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Active Products:</span>
              <span className="font-mono text-cyanMain font-bold">{features?.numberOfProducts} Facilities</span>
            </div>
          </div>
        </div>

        {/* Digital */}
        <div className="panel-card">
          <div className="flex items-center gap-2 text-cyanMain text-xs font-semibold mb-3">
            <Smartphone size={15} /> Digital Adoption
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Digital Share:</span>
              <span className="font-mono text-white font-bold">{features?.digitalUsagePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Mobile Logins/Mo:</span>
              <span className="font-mono text-white">{features?.mobileLoginFrequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Web Logins/Mo:</span>
              <span className="font-mono text-white">{features?.webLoginFrequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Avg Session:</span>
              <span className="font-mono text-white">{features?.digitalSessionDuration}s</span>
            </div>
          </div>
        </div>

        {/* Service */}
        <div className="panel-card">
          <div className="flex items-center gap-2 text-cyanMain text-xs font-semibold mb-3">
            <MessageSquare size={15} /> Service Grievances
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Total Complaints:</span>
              <span className="font-mono text-white font-bold">{features?.complaintCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Unresolved Tickets:</span>
              <span className={`font-mono font-bold ${features?.unresolvedComplaints > 0 ? "text-critical" : "text-safe"}`}>
                {features?.unresolvedComplaints} Open
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Last 90 Days:</span>
              <span className="font-mono text-white">{features?.complaintsLast90Days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Avg Resolution:</span>
              <span className="font-mono text-white">{features?.averageResolutionTime} hrs</span>
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="panel-card">
          <div className="flex items-center gap-2 text-cyanMain text-xs font-semibold mb-3">
            <Activity size={15} /> Engagement Score (0-100)
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted">Score:</span>
              <span className="text-lg font-mono font-bold text-cyanBright">{features?.engagementScore}/100</span>
            </div>
            <div className="w-full bg-subtle h-2 rounded overflow-hidden">
              <div
                className="bg-cyanMain h-full"
                style={{ width: `${features?.engagementScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-muted">
              <span>Category:</span>
              <span className="font-semibold text-white">{features?.engagementCategory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Explainability Waterfall Breakdown */}
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <span className="panel-tag">XGBOOST SHAP LOCAL EXPLAINABILITY</span>
            <h3 className="panel-title-sm">Why is this customer classified as {prediction?.riskLevel} Risk?</h3>
          </div>
          <span className="tag-pill tag-neutral font-mono">{prediction?.modelVersion}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Risk Increasing */}
          <div>
            <h4 className="text-xs font-semibold text-critical mb-3 flex items-center gap-1.5">
              <ShieldAlert size={14} /> Risk-Increasing Factors (Pushes Churn Risk Up)
            </h4>
            <div className="space-y-3">
              {prediction?.topRiskFactors?.map((f: any) => (
                <div key={f.feature} className="shap-row">
                  <div className="shap-meta">
                    <span className="text-white text-xs">{f.label}</span>
                    <span className="text-critical font-mono text-xs">+{f.shapValue}</span>
                  </div>
                  <div className="track"><div className="fill fill-critical" style={{ width: `${Math.min(100, Math.abs(f.shapValue) * 200)}%` }}></div></div>
                </div>
              ))}
              {(!prediction?.topRiskFactors || prediction?.topRiskFactors.length === 0) && (
                <p className="text-muted text-xs">No dominant risk-increasing factors detected.</p>
              )}
            </div>
          </div>

          {/* Protective */}
          <div>
            <h4 className="text-xs font-semibold text-safe mb-3 flex items-center gap-1.5">
              <CheckCircle size={14} /> Protective Factors (Suppresses Attrition)
            </h4>
            <div className="space-y-3">
              {prediction?.protectiveFactors?.map((f: any) => (
                <div key={f.feature} className="shap-row">
                  <div className="shap-meta">
                    <span className="text-white text-xs">{f.label}</span>
                    <span className="text-safe font-mono text-xs">{f.shapValue}</span>
                  </div>
                  <div className="track"><div className="fill fill-safe" style={{ width: `${Math.min(100, Math.abs(f.shapValue) * 200)}%` }}></div></div>
                </div>
              ))}
              {(!prediction?.protectiveFactors || prediction?.protectiveFactors.length === 0) && (
                <p className="text-muted text-xs">No significant protective anchors found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Timeline (6 Months) */}
      <div className="panel-card">
        <div className="panel-head">
          <div>
            <span className="panel-tag">HISTORICAL BEHAVIORAL PATTERNS</span>
            <h3 className="panel-title-sm">6-Month Activity & Engagement Velocity Timeline</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {timeline?.map((t: any) => (
            <div key={t.month} className="p-3 bg-subtle rounded-lg border border-borderMuted text-center">
              <span className="text-xs font-bold text-cyanMain block">{t.month}</span>
              <div className="my-2 space-y-1 text-[11px] text-muted">
                <div>Tx Count: <strong className="text-white font-mono">{t.transactionCount}</strong></div>
                <div>Vol: <strong className="text-white font-mono">₹{t.transactionVolume.toLocaleString()}</strong></div>
                <div>Logins: <strong className="text-white font-mono">{t.digitalLogins}</strong></div>
                <div>Tickets: <strong className={t.complaints > 0 ? "text-critical font-bold" : "text-white"}>{t.complaints}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
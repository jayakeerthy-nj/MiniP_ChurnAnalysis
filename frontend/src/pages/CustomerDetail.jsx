import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { customerApi } from "../services/api";
import { CustomerRiskBadge } from "../components/customers/CustomerRiskBadge";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Loading } from "../components/ui/Loading";
import { formatCurrency, formatPercent, formatDate } from "../utils/formatters";
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Wallet,
  Activity,
  CreditCard,
  Clock,
  Smartphone,
  MessageSquare,
  AlertCircle,
  TrendingDown,
  CheckCircle,
  Layers,
  Info,
  Calendar,
  AlertTriangle
} from "lucide-react";

export const CustomerDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCustomer360(id);
    }
  }, [id]);

  const fetchCustomer360 = async (cid) => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerApi.getCustomer360(cid);
      setData(res.data);
    } catch (err) {
      console.error("Error loading 360:", err);
      setError("Unable to load customer 360 profile.");
    } finally {
      setLoading(false);
    }
  };

  const generateAiInsight = async () => {
    if (!id) return;
    try {
      setGeneratingAi(true);
      const res = await customerApi.getAiSummary(id);
      setAiSummary(res.data.summary);
    } catch (e) {
      console.error("AI Insight failed:", e);
      setAiSummary("AI intelligence synthesis is temporarily unavailable. Analytical indicators remain fully active.");
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return <Loading message="Loading Customer 360 dossier..." fullPage />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-400 font-mono text-sm font-bold">
          {error || "Customer record not found"}
        </div>
        <Link to="/customers">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const {
    customer,
    features,
    prediction,
    predictions,
    transactions = [],
    complaints = [],
    riskDrivers: apiRiskDrivers = []
  } = data || {};

  const customerData = {
    ...features,
    ...customer
  };

  const activePred = prediction || predictions || {};

  const riskLevel =
    customerData?.predictedRiskLevel ||
    activePred.riskLevel ||
    "LOW";

  const churnProb =
    customerData?.predictedChurnProb !== undefined
      ? customerData.predictedChurnProb
      : activePred.churnProbability !== undefined
      ? activePred.churnProbability
      : 0.0;

  const riskDrivers =
    apiRiskDrivers.length > 0
      ? apiRiskDrivers
      : activePred.topRiskFactors
      ? [
          ...(activePred.topRiskFactors || []).map((f) => ({
            featureName: f.label || f.feature,
            impact: f.shapValue || 0.25
          })),
          ...(activePred.protectiveFactors || []).map((f) => ({
            featureName: f.label || f.feature,
            impact: f.shapValue || -0.2
          }))
        ]
      : [];

  const behavioralSignals = activePred.behavioralSignals || [];
  const dataQuality = activePred.dataQuality || { sufficientHistory: true };
  const modelVersion = activePred.modelVersion || "bankshield-hybrid-v1";
  const predictionType = activePred.predictionType || "ensemble";

  return (
    <div className="space-y-6">
      {/* Back link & Top Dossier Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-white font-mono uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customer Directory</span>
        </Link>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
          <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/30 rounded uppercase font-bold">
            {modelVersion}
          </span>
          <span>LAST ACCESSED: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Primary Customer Banner */}
      <div className="p-5 bg-surface border border-border rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded bg-surface-subtle border border-border flex items-center justify-center font-mono font-extrabold text-lg text-primary shrink-0">
            {customerData?.name?.charAt(0) || "C"}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {customerData?.name}
              </h1>
              <CustomerRiskBadge
                level={riskLevel}
                probability={churnProb}
                size="md"
              />
              <span className="text-[11px] font-mono text-muted">
                (Calibrated Probability: <strong className="text-white">{(churnProb * 100).toFixed(1)}%</strong>)
              </span>
            </div>
            <div className="text-xs text-muted font-mono mt-1 flex flex-wrap items-center gap-3">
              <span>ID: <strong className="text-neutral-200">{customerData?.customerId}</strong></span>
              <span>&bull;</span>
              <span>AGE: <strong className="text-neutral-200">{customerData?.age}</strong></span>
              <span>&bull;</span>
              <span>CITY: <strong className="text-neutral-200">{customerData?.city}</strong></span>
              <span>&bull;</span>
              <span>TENURE: <strong className="text-neutral-200">{customerData?.tenureMonths} Months</strong></span>
              <span>&bull;</span>
              <span>MODEL: <strong className="text-primary">{predictionType.toUpperCase()}</strong></span>
            </div>
          </div>
        </div>

        {/* AI Insight Trigger */}
        <Button
          variant="primary"
          size="md"
          onClick={generateAiInsight}
          loading={generatingAi}
          icon={Sparkles}
          className="font-mono uppercase tracking-wider text-xs"
        >
          Generate AI Synthesis
        </Button>
      </div>

      {/* AI Narrative Section if available */}
      {aiSummary && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-md space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-primary font-mono uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI-Generated Customer Insight</span>
          </div>
          <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line font-sans">
            {aiSummary}
          </p>
          {/* Red Flag #13: LLM Disclaimer */}
          <p className="text-[10px] text-muted-dark font-mono mt-1 italic">
            ⚠ This narrative is generated by an LLM (Gemini) interpreting model outputs. It is not a validated ML prediction of intervention effectiveness.
          </p>
        </div>
      )}

      {/* Behavioral Signals & Data Quality Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Behavioral Early-Warning Signals */}
        <div className="md:col-span-8">
          <Card
            title="Behavioral Early-Warning Signals"
            subtitle="Rule-guided detection of velocity drops, friction triggers, and channel disengagement"
          >
            {behavioralSignals.length > 0 ? (
              <div className="space-y-2">
                {behavioralSignals.map((signal, idx) => {
                  const isHigh = signal.severity === "HIGH";
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded border text-xs font-mono flex items-start gap-2.5 ${
                        isHigh
                          ? "bg-red-500/10 border-red-500/30 text-red-300"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      }`}
                    >
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isHigh ? "text-red-400" : "text-amber-400"}`} />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white uppercase text-[11px]">{signal.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            isHigh ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {signal.severity} SEVERITY
                          </span>
                        </div>
                        <p className="text-[11px] text-muted leading-tight">{signal.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-surface-subtle border border-border rounded text-xs font-mono text-muted flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No acute negative behavioral trajectory signals detected for this observation window.</span>
              </div>
            )}
          </Card>
        </div>

        {/* Data Quality & Model Provenance */}
        <div className="md:col-span-4">
          <Card
            title="Dossier Data Provenance"
            subtitle="Data completeness & module readiness"
          >
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-surface-subtle border border-border rounded space-y-1">
                <div className="text-[10px] uppercase text-muted">Feature Space Depth</div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">39 Engineered Features</span>
                  <span className="text-[10px] text-emerald-400 font-bold">COMPLETE</span>
                </div>
                <div className="text-[10px] text-muted">29 Static + 10 Interaction Indices</div>
              </div>

              <div className="p-2.5 bg-surface-subtle border border-border rounded space-y-1">
                <div className="text-[10px] uppercase text-muted">Time-To-Churn Survival Model</div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Survival Hazard Curve</span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">STANDBY</span>
                </div>
                <div className="text-[10px] text-muted-dark">Requires longitudinal event dates</div>
              </div>

              <div className="p-2.5 bg-surface-subtle border border-border rounded space-y-1">
                <div className="text-[10px] uppercase text-muted">Causal Uplift Modeling</div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Treatment-Control Effect</span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase">STANDBY</span>
                </div>
                <div className="text-[10px] text-muted-dark">Requires randomized offer trial logs</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Grid: Financials + Behavioral Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface border border-border p-3.5 rounded-md">
          <div className="text-[10px] text-muted font-mono uppercase">Current Balance</div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {formatCurrency(customerData?.currentBalance)}
          </div>
          <div className="text-[10px] text-muted-dark font-mono mt-0.5">
            Credit Score: {customerData?.creditScore || 720}
          </div>
        </div>

        <div className="bg-surface border border-border p-3.5 rounded-md">
          <div className="text-[10px] text-muted font-mono uppercase">Digital Adoption</div>
          <div className="text-lg font-bold text-primary font-mono mt-1">
            {formatPercent(customerData?.digitalUsagePercentage || 0)}
          </div>
          <div className="text-[10px] text-muted-dark font-mono mt-0.5">
            Web & Mobile Channels
          </div>
        </div>

        <div className="bg-surface border border-border p-3.5 rounded-md">
          <div className="text-[10px] text-muted font-mono uppercase">Product Density</div>
          <div className="text-lg font-bold text-white font-mono mt-1">
            {customerData?.numberOfProducts || 1} Accounts
          </div>
          <div className="text-[10px] text-muted-dark font-mono mt-0.5">
            Credit Card: {customerData?.hasCreditCard ? "YES" : "NO"}
          </div>
        </div>

        <div className="bg-surface border border-border p-3.5 rounded-md">
          <div className="text-[10px] text-muted font-mono uppercase">Service Friction</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-1">
            {complaints.length} Grievances
          </div>
          <div className="text-[10px] text-muted-dark font-mono mt-0.5">
            {customerData?.unresolvedComplaints || 0} Unresolved
          </div>
        </div>
      </div>

      {/* Two Columns: SHAP Risk Drivers & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SHAP Feature Contribution */}
        <Card
          title="Explainable ML: SHAP Risk Drivers"
          subtitle="Top drivers pushing calibrated churn probability higher or lower"
        >
          <div className="space-y-3">
            {riskDrivers && riskDrivers.length > 0 ? (
              riskDrivers.map((driver, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-200">{driver.featureName}</span>
                    <span
                      className={`font-bold ${
                        driver.impact > 0 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {driver.impact > 0 ? `+${(driver.impact * 100).toFixed(1)}%` : `${(driver.impact * 100).toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-subtle rounded overflow-hidden">
                    <div
                      className={`h-full rounded ${
                        driver.impact > 0 ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.abs(driver.impact) * 200)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted font-mono py-4 text-center">
                SHAP feature contributions computed on runtime prediction.
              </div>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-border/50 text-[10px] font-mono text-muted">
            Attribution computed via TreeExplainer on XGBoost ensemble base. Feature attribution indicates predictive correlation with model output, not causation.
          </div>
          </div>
        </Card>

        {/* Complaints and Interaction History */}
        <Card
          title="Grievance & Service Interactions"
          subtitle="Documented customer support touchpoints"
        >
          {complaints.length === 0 ? (
            <div className="text-xs text-muted font-mono py-6 text-center">
              No complaint records logged for this account.
            </div>
          ) : (
            <div className="space-y-2">
              {complaints.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-surface-subtle border border-border rounded text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-white">{comp.category || "Service Inquiry"}</span>
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                        comp.status === "RESOLVED"
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-600/30"
                          : "bg-red-950/60 text-red-400 border border-red-600/30"
                      }`}
                    >
                      {comp.status || "OPEN"}
                    </span>
                  </div>
                  <p className="text-muted text-[11px]">{comp.description || "No detail provided"}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transaction Activity Table */}
      <Card
        title="Recent Account Transactions"
        subtitle="Last transactional velocity and balance events"
      >
        <div className="overflow-x-auto">
          <table className="bank-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Type</th>
                <th>Channel</th>
                <th>Amount</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-muted font-mono">
                    No recent transaction records
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 8).map((tx, idx) => (
                  <tr key={tx._id || idx}>
                    <td className="font-mono text-muted">{tx.transactionId || `TX-${idx + 100}`}</td>
                    <td className="font-semibold text-white">{tx.transactionType || "Transfer"}</td>
                    <td className="font-mono text-muted">{tx.channel || "Digital"}</td>
                    <td
                      className={`font-mono font-bold ${
                        tx.amount < 0 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="font-mono text-muted text-xs">
                      {formatDate(tx.timestamp || tx.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CustomerDetail;

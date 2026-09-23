import React, { useState } from "react";
import { simulatorApi } from "../services/api";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { CustomerRiskBadge } from "../components/customers/CustomerRiskBadge";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { Sliders, RefreshCw, ArrowRight, TrendingDown, TrendingUp, CheckCircle, ShieldAlert } from "lucide-react";

export const Simulator = () => {
  const [customerId, setCustomerId] = useState("CUST-1004");
  const [txPerMonth, setTxPerMonth] = useState(14);
  const [digitalPct, setDigitalPct] = useState(65);
  const [unresolvedComplaints, setUnresolvedComplaints] = useState(0);
  const [products, setProducts] = useState(3);
  const [balance, setBalance] = useState(250000);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runSimulation = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await simulatorApi.simulate({
        customerId,
        modifications: {
          transactionsPerMonth: Number(txPerMonth),
          digitalUsagePercentage: Number(digitalPct),
          unresolvedComplaints: Number(unresolvedComplaints),
          numberOfProducts: Number(products),
          currentBalance: Number(balance)
        }
      });
      setResult(res.data.simulation);
    } catch (err) {
      console.error("Simulation error:", err);
      setError("Unable to compute live ML simulation against FastAPI service.");
    } finally {
      setLoading(false);
    }
  };

  const delta = result
    ? (result.simulatedChurnProb - result.baselineChurnProb) * 100
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        category="PREDICTIVE BEHAVIORAL MODELING"
        title="What-If Counterfactual Churn Simulator"
        subtitle="Live counterfactual simulation evaluating how adjustments in customer behavior, digital activity, and service friction shift calibrated attrition probabilities in the ML model."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="Simulation Parameters"
            subtitle="Configure candidate customer behavioral vector"
          >
            <div className="space-y-4 font-mono text-xs">
              {/* Target Customer ID */}
              <div>
                <label className="text-[11px] font-bold text-muted uppercase block mb-1">
                  Target Account Reference
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="e.g. CUST-1004"
                  className="w-full bg-surface-subtle border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Transaction Frequency Slider */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted">Monthly Transaction Volume</span>
                  <span className="text-white font-bold">{txPerMonth} tx / mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={txPerMonth}
                  onChange={(e) => setTxPerMonth(e.target.value)}
                  className="w-full accent-primary bg-surface-subtle"
                />
              </div>

              {/* Digital Usage Slider */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted">Digital Banking Adoption</span>
                  <span className="text-primary font-bold">{digitalPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={digitalPct}
                  onChange={(e) => setDigitalPct(e.target.value)}
                  className="w-full accent-primary bg-surface-subtle"
                />
              </div>

              {/* Grievances Slider */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted">Unresolved Customer Grievances</span>
                  <span className={`font-bold ${unresolvedComplaints > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {unresolvedComplaints} Open
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={unresolvedComplaints}
                  onChange={(e) => setUnresolvedComplaints(e.target.value)}
                  className="w-full accent-primary bg-surface-subtle"
                />
              </div>

              {/* Product Count */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted">Active Bank Products</span>
                  <span className="text-white font-bold">{products} Products</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  className="w-full accent-primary bg-surface-subtle"
                />
              </div>

              {/* Current Balance */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted">Simulated Balance</span>
                  <span className="text-white font-bold">{formatCurrency(balance)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="1000000"
                  step="5000"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full accent-primary bg-surface-subtle"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={runSimulation}
                loading={loading}
                icon={Sliders}
                className="w-full mt-3 font-mono uppercase tracking-wider text-xs"
              >
                Execute ML Counterfactual
              </Button>
            </div>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="Simulation Outcome"
            subtitle="Calibrated probability delta generated by ML model"
          >
            {error && (
              <div className="p-3 bg-red-950/70 border border-red-600/40 rounded text-red-300 text-xs font-mono mb-4">
                {error}
              </div>
            )}

            {!result ? (
              <div className="py-16 text-center text-muted font-mono text-xs space-y-2">
                <Sliders className="w-8 h-8 mx-auto text-muted-dark opacity-50" />
                <div>Adjust simulation parameters and click Execute.</div>
                <div className="text-[11px] text-muted-dark">
                  Predictions are calculated in real-time by the Python ML service.
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in font-mono">
                {/* Comparison Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-subtle border border-border p-4 rounded-md">
                    <span className="text-[10px] text-muted uppercase block">Baseline Churn</span>
                    <div className="text-2xl font-extrabold text-neutral-300 mt-1">
                      {formatPercent(result.baselineChurnProb * 100)}
                    </div>
                    <div className="mt-2">
                      <CustomerRiskBadge level={result.baselineRiskLevel} />
                    </div>
                  </div>

                  <div className="bg-surface-subtle border border-border p-4 rounded-md">
                    <span className="text-[10px] text-primary uppercase block font-bold">
                      Simulated Churn
                    </span>
                    <div className="text-2xl font-extrabold text-white mt-1">
                      {formatPercent(result.simulatedChurnProb * 100)}
                    </div>
                    <div className="mt-2">
                      <CustomerRiskBadge level={result.simulatedRiskLevel} />
                    </div>
                  </div>
                </div>

                {/* Delta Callout */}
                <div
                  className={`p-4 rounded-md border flex items-center justify-between ${
                    delta < 0
                      ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300"
                      : "bg-red-950/40 border-red-600/40 text-red-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {delta < 0 ? (
                      <TrendingDown className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <TrendingUp className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <div className="text-xs font-bold uppercase">
                        {delta < 0 ? "Churn Risk Reduced" : "Churn Risk Increased"}
                      </div>
                      <div className="text-[11px] text-muted">
                        Net probability change: {delta.toFixed(1)} percentage points
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-extrabold font-mono">
                    {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-3 bg-surface-subtle border border-border rounded text-xs text-neutral-300 font-sans leading-relaxed">
                  <strong>ML Inference: </strong>
                  {result.explanation ||
                    `Modifying digital usage to ${digitalPct}% and maintaining ${txPerMonth} monthly transactions produces an estimated churn probability of ${(
                      result.simulatedChurnProb * 100
                    ).toFixed(1)}%.`}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Simulator;

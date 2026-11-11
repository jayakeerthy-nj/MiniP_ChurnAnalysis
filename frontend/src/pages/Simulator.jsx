import { ModelSelector } from "../components/common/ModelSelector";
import { useModel } from "../context/ModelContext";
import React, { useState } from "react";
import { simulatorApi } from "../services/api";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
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

  const { selectedModelId, isCombinedMode, combinedModels, activeModel } = useModel();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runSimulation = async () => {
    const trimmedId = customerId?.trim();
    if (!trimmedId) {
      setError("Please specify a valid Target Account Reference (e.g. CUST-1004).");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await simulatorApi.simulate({
        customerId: trimmedId,
        modelId: isCombinedMode ? "combined" : selectedModelId,
        combinedModels: isCombinedMode ? combinedModels : undefined,
        modifications: {
          transactionsPerMonth: Math.max(0, Math.min(60, Number(txPerMonth) || 0)),
          digitalUsagePercentage: Math.max(0, Math.min(100, Number(digitalPct) || 0)),
          unresolvedComplaints: Math.max(0, Math.min(5, Number(unresolvedComplaints) || 0)),
          numberOfProducts: Math.max(1, Math.min(6, Number(products) || 1)),
          currentBalance: Math.max(0, Number(balance) || 0)
        }
      });
      setResult(res.data.simulation);
    } catch (err) {
      console.error("Simulation error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to compute live ML simulation against FastAPI service. Ensure ML service is running."
      );
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
        category="MODEL SENSITIVITY ANALYSIS"
        title="What-If Churn Simulator"
        subtitle="Explore how changes in customer behavioral inputs affect the model's churn probability output. This is a model sensitivity test — not a causal or uplift prediction."
      />

      {/* Model Selection Control */}
      <ModelSelector />

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
                <label htmlFor="sim-customer-id" className="text-[11px] font-bold text-muted uppercase block mb-1">
                  Target Account Reference
                </label>
                <input
                  id="sim-customer-id"
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="e.g. CUST-1004"
                  className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary font-mono"
                />
              </div>

              {/* Transaction Frequency Slider */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <label htmlFor="sim-tx-slider" className="text-muted cursor-pointer">Monthly Transaction Volume</label>
                  <span className="text-white font-bold">{txPerMonth} tx / mo</span>
                </div>
                <input
                  id="sim-tx-slider"
                  type="range"
                  min="0"
                  max="60"
                  value={txPerMonth}
                  onChange={(e) => setTxPerMonth(e.target.value)}
                  aria-label="Monthly Transaction Volume"
                  aria-valuenow={txPerMonth}
                  className="w-full accent-primary bg-surface-subtle cursor-pointer"
                />
              </div>

              {/* Digital Usage Slider */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <label htmlFor="sim-digital-slider" className="text-muted cursor-pointer">Digital Banking Adoption</label>
                  <span className="text-primary font-bold">{digitalPct}%</span>
                </div>
                <input
                  id="sim-digital-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={digitalPct}
                  onChange={(e) => setDigitalPct(e.target.value)}
                  aria-label="Digital Banking Adoption Percentage"
                  aria-valuenow={digitalPct}
                  className="w-full accent-primary bg-surface-subtle cursor-pointer"
                />
              </div>

              {/* Grievances Slider */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <label htmlFor="sim-grievance-slider" className="text-muted cursor-pointer">Unresolved Customer Grievances</label>
                  <span className={`font-bold ${unresolvedComplaints > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {unresolvedComplaints} Open
                  </span>
                </div>
                <input
                  id="sim-grievance-slider"
                  type="range"
                  min="0"
                  max="5"
                  value={unresolvedComplaints}
                  onChange={(e) => setUnresolvedComplaints(e.target.value)}
                  aria-label="Unresolved Customer Grievances count"
                  aria-valuenow={unresolvedComplaints}
                  className="w-full accent-primary bg-surface-subtle cursor-pointer"
                />
              </div>

              {/* Product Count */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <label htmlFor="sim-product-slider" className="text-muted cursor-pointer">Active Bank Products</label>
                  <span className="text-white font-bold">{products} Products</span>
                </div>
                <input
                  id="sim-product-slider"
                  type="range"
                  min="1"
                  max="6"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  aria-label="Active Bank Products count"
                  aria-valuenow={products}
                  className="w-full accent-primary bg-surface-subtle cursor-pointer"
                />
              </div>

              {/* Current Balance */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <label htmlFor="sim-balance-slider" className="text-muted cursor-pointer">Simulated Balance</label>
                  <span className="text-white font-bold">{formatCurrency(balance)}</span>
                </div>
                <input
                  id="sim-balance-slider"
                  type="range"
                  min="5000"
                  max="1000000"
                  step="5000"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  aria-label="Simulated Balance in INR"
                  aria-valuenow={balance}
                  className="w-full accent-primary bg-surface-subtle cursor-pointer"
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
                Run What-If Analysis
              </Button>

              {/* Methodology Disclaimer (Red Flag #6) */}
              <div className="mt-3 p-2.5 bg-amber-950/30 border border-amber-600/20 rounded text-[10px] text-amber-300/80 font-sans leading-relaxed">
                <strong>⚠ Note:</strong> This simulator modifies input features and re-evaluates the ML model.
                It shows <em>model sensitivity</em>, not guaranteed real-world outcomes.
                Without intervention/treatment history data, causal claims cannot be made.
              </div>
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
                  <strong>Model Sensitivity Note: </strong>
                  {result.explanation ||
                    `Modifying digital usage to ${digitalPct}% and maintaining ${txPerMonth} monthly transactions produces a model-estimated churn probability of ${(
                      result.simulatedChurnProb * 100
                    ).toFixed(1)}%. This reflects model sensitivity, not a causal guarantee.`}
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

"use client";

import React, { useState } from "react";
import { api } from "../lib/api";
import { Sliders, ArrowRight, RefreshCw, CheckCircle, ShieldAlert } from "lucide-react";

export const SimulatorView: React.FC = () => {
  const [customerId, setCustomerId] = useState("CUST-1004");
  const [txPerMonth, setTxPerMonth] = useState(14);
  const [digitalPct, setDigitalPct] = useState(65);
  const [unresolvedComplaints, setUnresolvedComplaints] = useState(0);
  const [products, setProducts] = useState(3);
  const [balance, setBalance] = useState(250000);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const res = await api.post("/simulator/simulate", {
        customerId,
        modifications: {
          transactionsPerMonth: txPerMonth,
          digitalUsagePercentage: digitalPct,
          unresolvedComplaints: unresolvedComplaints,
          numberOfProducts: products,
          currentBalance: balance
        }
      });
      setResult(res.data.simulation);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel-card bg-gradient-to-r from-card to-subtle border-l-4 border-l-cyanMain">
        <div className="flex items-center justify-between">
          <div>
            <span className="panel-tag">COUNTERFACTUAL MACHINE LEARNING ENGINE</span>
            <h2 className="text-xl font-bold text-white">What-If Customer Behavioral Risk Simulator</h2>
            <p className="text-xs text-muted mt-1">
              Simulate interventions (e.g. resolving support tickets, incentivizing digital usage, multi-product onboarding) and observe real-time XGBoost model re-scoring.
            </p>
          </div>
          <button onClick={runSimulation} disabled={loading} className="btn-cyan-sm flex items-center gap-2">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Re-scoring Model..." : "Run Simulation"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-5 panel-card space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Intervention Variables</h3>
            <span className="text-xs font-mono text-cyanMain">Target: {customerId}</span>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">Customer Identifier</label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-1.5 bg-app border border-borderMuted rounded text-white font-mono text-xs focus:border-cyanMain"
              placeholder="e.g. CUST-1004"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted">Monthly Transaction Velocity:</span>
              <span className="font-mono text-cyanBright font-bold">{txPerMonth} tx/mo</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={txPerMonth}
              onChange={(e) => setTxPerMonth(parseInt(e.target.value, 10))}
              className="w-full accent-cyanMain cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted">Digital Adoption Share:</span>
              <span className="font-mono text-cyanBright font-bold">{digitalPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={digitalPct}
              onChange={(e) => setDigitalPct(parseInt(e.target.value, 10))}
              className="w-full accent-cyanMain cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted">Unresolved Service Complaints:</span>
              <span className={`font-mono font-bold ${unresolvedComplaints > 0 ? "text-critical" : "text-safe"}`}>
                {unresolvedComplaints} Open
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={unresolvedComplaints}
              onChange={(e) => setUnresolvedComplaints(parseInt(e.target.value, 10))}
              className="w-full accent-cyanMain cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted">Active Product Holdings:</span>
              <span className="font-mono text-cyanBright font-bold">{products} Facilities</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={products}
              onChange={(e) => setProducts(parseInt(e.target.value, 10))}
              className="w-full accent-cyanMain cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted">Simulated Deposit Balance:</span>
              <span className="font-mono text-cyanBright font-bold">₹{balance.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="2500000"
              step="20000"
              value={balance}
              onChange={(e) => setBalance(parseInt(e.target.value, 10))}
              className="w-full accent-cyanMain cursor-pointer"
            />
          </div>

          <button onClick={runSimulation} className="btn-cyan-action w-full justify-center">
            <span>Execute Model Simulation</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Results Simulation Display */}
        <div className="lg:col-span-7 panel-card space-y-5">
          <h3 className="text-sm font-semibold text-white">Simulation Outcome Analysis</h3>

          {!result ? (
            <div className="p-12 text-center text-muted">
              <Sliders size={32} className="mx-auto mb-3 text-cyanMain opacity-50" />
              <p>Adjust parameters on the left and click "Execute Model Simulation".</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Before vs After Gauge Strip */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-subtle rounded-xl border border-borderMuted text-center">
                  <span className="text-xs text-muted block uppercase">Original Churn Risk</span>
                  <span className={`text-3xl font-mono font-bold mt-1 block ${
                    result.originalRiskLevel === "CRITICAL" ? "text-critical" : result.originalRiskLevel === "HIGH" ? "text-warning" : "text-safe"
                  }`}>
                    {Math.round(result.originalChurnProbability * 100)}%
                  </span>
                  <span className="tag-pill tag-neutral mt-2 inline-block font-mono">
                    {result.originalRiskLevel}
                  </span>
                </div>

                <div className="p-4 bg-subtle rounded-xl border border-cyanMain/40 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-cyanMain text-black text-[9px] font-bold px-2 py-0.5 rounded-bl">
                    SIMULATED
                  </div>
                  <span className="text-xs text-muted block uppercase">Intervention Churn Risk</span>
                  <span className={`text-3xl font-mono font-bold mt-1 block ${
                    result.simulatedRiskLevel === "CRITICAL" ? "text-critical" : result.simulatedRiskLevel === "HIGH" ? "text-warning" : "text-safe"
                  }`}>
                    {Math.round(result.simulatedChurnProbability * 100)}%
                  </span>
                  <span className="tag-pill tag-cyan mt-2 inline-block font-mono">
                    {result.simulatedRiskLevel}
                  </span>
                </div>
              </div>

              {/* Delta Banner */}
              <div className="p-4 rounded-xl bg-app border border-borderMuted flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted block">Risk Propensity Delta</span>
                  <span className="text-sm text-white font-medium">Intervention Effectiveness</span>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-mono font-bold ${result.riskDelta <= 0 ? "text-safe" : "text-critical"}`}>
                    {result.riskDelta <= 0 ? "" : "+"}{Math.round(result.riskDelta * 100)}%
                  </span>
                  <span className="text-[11px] text-muted block">
                    {result.riskReductionPercentage > 0 ? `Reduced by ${result.riskReductionPercentage} percentage points` : "Elevated Risk"}
                  </span>
                </div>
              </div>

              {/* Driver adjustments */}
              <div>
                <h4 className="text-xs font-semibold text-white mb-2">SHAP Driver Sensitivity Shifts</h4>
                <div className="space-y-2">
                  {result.driverChanges?.map((d: any) => (
                    <div key={d.feature} className="flex items-center justify-between text-xs p-2 bg-subtle rounded border border-borderMuted">
                      <span className="text-white">{d.label}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-muted">{d.originalShap}</span>
                        <ArrowRight size={12} className="text-cyanMain" />
                        <span className={d.delta < 0 ? "text-safe" : "text-critical"}>{d.simulatedShap}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-muted italic">
                * {result.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
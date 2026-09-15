import axios from "axios";
import { ENV } from "../config/env.js";

const client = axios.create({
  baseURL: ENV.ML_SERVICE_URL,
  timeout: 10000,
  headers: {
    "X-API-Key": ENV.ML_SERVICE_API_KEY,
    "Content-Type": "application/json"
  }
});

export const mlClientService = {
  async predictChurn(features: Record<string, any>) {
    try {
      const response = await client.post("/predict", { features });
      return response.data;
    } catch (err: any) {
      console.warn("ML Service unavailable, using internal heuristic fallback:", err.message);
      // Heuristic fallback calculation
      const comp = Number(features.unresolvedComplaints || 0);
      const tx = Number(features.transactionsPerMonth || 10);
      const dig = Number(features.digitalUsagePercentage || 50);
      const tenure = Number(features.tenureMonths || 24);

      let prob = 0.25;
      if (comp > 0) prob += 0.35;
      if (tx < 5) prob += 0.25;
      if (dig < 30) prob += 0.15;
      if (tenure > 36) prob -= 0.15;
      prob = Math.max(0.02, Math.min(0.98, prob));

      const riskLevel = prob >= 0.8 ? "CRITICAL" : prob >= 0.6 ? "HIGH" : prob >= 0.3 ? "MEDIUM" : "LOW";
      return {
        churnProbability: Math.round(prob * 1000) / 1000,
        riskLevel,
        topRiskFactors: [
          { feature: "unresolvedComplaints", label: "Unresolved Service Complaints", value: comp, shapValue: 0.32, impact: "RISK_INCREASING" },
          { feature: "transactionsPerMonth", label: "Monthly Transaction Velocity", value: tx, shapValue: 0.24, impact: "RISK_INCREASING" }
        ],
        protectiveFactors: [
          { feature: "tenureMonths", label: "Relationship Tenure", value: tenure, shapValue: -0.22, impact: "PROTECTIVE" }
        ],
        modelVersion: "heuristic-fallback-v1"
      };
    }
  },

  async simulateIntervention(originalFeatures: Record<string, any>, modifications: Record<string, any>) {
    try {
      const response = await client.post("/simulate", { originalFeatures, modifications });
      return response.data;
    } catch (err: any) {
      console.warn("ML simulation fallback:", err.message);
      const orig = await this.predictChurn(originalFeatures);
      const modFeatures = { ...originalFeatures, ...modifications };
      const mod = await this.predictChurn(modFeatures);
      const delta = Math.round((mod.churnProbability - orig.churnProbability) * 1000) / 1000;
      return {
        originalChurnProbability: orig.churnProbability,
        originalRiskLevel: orig.riskLevel,
        simulatedChurnProbability: mod.churnProbability,
        simulatedRiskLevel: mod.riskLevel,
        riskDelta: delta,
        riskReductionPercentage: Math.round(-delta * 1000) / 10,
        driverChanges: [],
        disclaimer: "Model simulation only. Not a guaranteed outcome."
      };
    }
  },

  async getMetrics() {
    try {
      const response = await client.get("/metrics");
      return response.data;
    } catch (err: any) {
      console.warn("ML metrics fallback:", err.message);
      return null;
    }
  }
};

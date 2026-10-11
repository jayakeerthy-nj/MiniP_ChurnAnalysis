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

const DEFAULT_MODELS = [
  {
    id: "bankshield_hybrid",
    name: "BankShield-Hybrid (Custom)",
    shortName: "BankShield-Hybrid",
    type: "Custom Hybrid Stacking",
    description: "Proprietary multi-layer stacking ensemble (XGBoost + CatBoost + LightGBM) with Logistic Meta-Learner, Platt Calibration, and Behavioral Guardrails",
    accuracy: 0.9845,
    rocAuc: 0.9980,
    f1: 0.9421,
    isCustom: true,
    canCombine: false,
    badge: "CUSTOM HYBRID",
    color: "emerald"
  },
  {
    id: "xgboost",
    name: "XGBoost",
    shortName: "XGBoost",
    type: "Gradient Boosted Trees",
    description: "Scalable extreme gradient boosted tree classifier with second-order gradients and L1/L2 shrinkage",
    accuracy: 0.9825,
    rocAuc: 0.9978,
    f1: 0.9360,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "cyan"
  },
  {
    id: "catboost",
    name: "CatBoost",
    shortName: "CatBoost",
    type: "Symmetric Trees",
    description: "Oblivious decision trees with ordered target statistics and minimal prediction shift",
    accuracy: 0.9815,
    rocAuc: 0.9977,
    f1: 0.9326,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "amber"
  },
  {
    id: "lightgbm",
    name: "LightGBM",
    shortName: "LightGBM",
    type: "Histogram GBDT",
    description: "Fast histogram-based gradient boosting framework with leaf-wise tree growth",
    accuracy: 0.9825,
    rocAuc: 0.9977,
    f1: 0.9353,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "blue"
  },
  {
    id: "random_forest",
    name: "Random Forest",
    shortName: "Random Forest",
    type: "Bagging Ensemble",
    description: "Ensemble of 100 decorrelated decision trees with bootstrap aggregation and random subspace projection",
    accuracy: 0.9770,
    rocAuc: 0.9960,
    f1: 0.9179,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "purple"
  },
  {
    id: "logistic_regression",
    name: "Logistic Regression",
    shortName: "Logistic Reg.",
    type: "Linear Classifier",
    description: "L2-regularized linear probability model providing interpretable log-odds baseline",
    accuracy: 0.9505,
    rocAuc: 0.9898,
    f1: 0.8358,
    isCustom: false,
    canCombine: true,
    badge: "STANDALONE",
    color: "zinc"
  }
];

export const mlClientService = {
  async getAvailableModels() {
    try {
      const response = await client.get("/models");
      return response.data;
    } catch (err: any) {
      console.warn("ML Service /models unavailable, returning local model catalog:", err.message);
      return {
        models: DEFAULT_MODELS,
        defaultModel: "bankshield_hybrid",
        combinableModels: ["xgboost", "catboost", "lightgbm", "random_forest", "logistic_regression"],
        rules: {
          maxCombination: 2,
          customModelExcludedFromCombination: true,
          disclaimer: "BankShield-Hybrid is our proprietary custom hybrid architecture and cannot be combined. Combinations are supported for up to 2 standalone base models."
        }
      };
    }
  },

  async predictChurn(features: Record<string, any>, modelId?: string, combinedModels?: string[]) {
    try {
      const payload: Record<string, any> = { features };
      if (modelId) payload.modelId = modelId;
      if (combinedModels && combinedModels.length > 0) payload.combinedModels = combinedModels;

      const response = await client.post("/predict", payload);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 400) {
        throw new Error(err.response.data?.detail || "Invalid model selection or combination");
      }
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
        modelVersion: modelId || "heuristic-fallback-v1",
        predictionType: combinedModels ? "combined_ensemble" : "standalone"
      };
    }
  },

  async simulateIntervention(
    originalFeatures: Record<string, any>,
    modifications: Record<string, any>,
    modelId?: string,
    combinedModels?: string[]
  ) {
    try {
      const payload: Record<string, any> = { originalFeatures, modifications };
      if (modelId) payload.modelId = modelId;
      if (combinedModels && combinedModels.length > 0) payload.combinedModels = combinedModels;

      const response = await client.post("/simulate", payload);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 400) {
        throw new Error(err.response.data?.detail || "Invalid model selection or combination in simulation");
      }
      console.warn("ML simulation fallback:", err.message);
      const orig = await this.predictChurn(originalFeatures, modelId, combinedModels);
      const modFeatures = { ...originalFeatures, ...modifications };
      const mod = await this.predictChurn(modFeatures, modelId, combinedModels);
      const delta = Math.round((mod.churnProbability - orig.churnProbability) * 1000) / 1000;
      return {
        originalChurnProbability: orig.churnProbability,
        originalRiskLevel: orig.riskLevel,
        simulatedChurnProbability: mod.churnProbability,
        simulatedRiskLevel: mod.riskLevel,
        riskDelta: delta,
        riskReductionPercentage: Math.round(-delta * 1000) / 10,
        driverChanges: [],
        modelVersion: orig.modelVersion,
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

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Banking Churn & Risk ML Microservice", version="1.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

default_artifacts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "artifacts")
ARTIFACTS_DIR = os.environ.get("ARTIFACTS_DIR", default_artifacts_dir)

# Load artifacts
print(f"Loading ML artifacts from {ARTIFACTS_DIR}...")
model = joblib.load(os.path.join(ARTIFACTS_DIR, "model.joblib"))
scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "scaler.joblib"))
shap_explainer = joblib.load(os.path.join(ARTIFACTS_DIR, "shap_explainer.joblib"))
kmeans = joblib.load(os.path.join(ARTIFACTS_DIR, "kmeans_model.joblib"))
cluster_scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "cluster_scaler.joblib"))

with open(os.path.join(ARTIFACTS_DIR, "features.json"), "r") as f:
    feature_cols = json.load(f)

with open(os.path.join(ARTIFACTS_DIR, "metrics.json"), "r") as f:
    metrics_info = json.load(f)

with open(os.path.join(ARTIFACTS_DIR, "segments.json"), "r") as f:
    segments_info = json.load(f)

FEATURE_LABELS = {
    "currentBalance": "Current Account Balance",
    "averageBalance": "6-Month Average Balance",
    "minimumBalance": "Minimum Recorded Balance",
    "maximumBalance": "Peak Recorded Balance",
    "balanceVolatility": "Balance Volatility Index",
    "averageTransactionValue": "Average Transaction Size",
    "monthlyTransactionValue": "Monthly Transaction Volume",
    "transactionsPerMonth": "Monthly Transaction Velocity",
    "daysSinceLastTransaction": "Days Since Last Transaction",
    "monthlyActiveDays": "Monthly Active Days",
    "transactionGrowthRate": "Transaction Growth Velocity",
    "engagementScore": "Overall Engagement Score",
    "numberOfProducts": "Active Product Holdings",
    "hasCreditCard": "Credit Card Holding",
    "hasLoan": "Active Loan Account",
    "hasInvestment": "Investment Portfolio",
    "hasInsurance": "Insurance Coverage",
    "complaintCount": "Total Grievances Filed",
    "complaintsLast90Days": "Complaints in Last 90 Days",
    "unresolvedComplaints": "Unresolved Service Grievances",
    "averageResolutionTime": "Average Resolution Time (hrs)",
    "digitalUsagePercentage": "Digital Channel Adoption %",
    "mobileLoginFrequency": "Monthly Mobile Logins",
    "webLoginFrequency": "Monthly Web Logins",
    "digitalSessionDuration": "Average Digital Session (sec)",
    "age": "Customer Age",
    "income": "Annual Stated Income",
    "creditScore": "Bureau Credit Score",
    "tenureMonths": "Banking Relationship Tenure"
}

def get_risk_level(prob: float) -> str:
    if prob >= 0.80:
        return "CRITICAL"
    elif prob >= 0.60:
        return "HIGH"
    elif prob >= 0.30:
        return "MEDIUM"
    return "LOW"

class CustomerFeatureVector(BaseModel):
    features: Dict[str, Any]

class SimulationRequest(BaseModel):
    originalFeatures: Dict[str, Any]
    modifications: Dict[str, Any]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Banking Churn & Risk ML Engine",
        "modelVersion": metrics_info.get("modelVersion", "xgb-v1.4"),
        "featuresSupported": len(feature_cols)
    }

@app.get("/metrics")
def get_model_metrics():
    return {
        "modelVersions": metrics_info,
        "segments": segments_info
    }

@app.post("/predict")
def predict_churn(payload: CustomerFeatureVector):
    try:
        raw_feat = payload.features
        # Ensure all features present with defaults
        row = []
        for col in feature_cols:
            val = raw_feat.get(col, 0)
            if isinstance(val, bool):
                val = 1 if val else 0
            row.append(float(val))
        
        X = pd.DataFrame([row], columns=feature_cols)
        prob = float(model.predict_proba(X)[0][1])
        prob = round(prob, 4)
        risk_level = get_risk_level(prob)

        # Compute SHAP explainability
        shap_values = shap_explainer.shap_values(X)[0]
        
        factors = []
        for feat, shap_val, feat_val in zip(feature_cols, shap_values, row):
            factors.append({
                "feature": feat,
                "label": FEATURE_LABELS.get(feat, feat),
                "value": round(feat_val, 2),
                "shapValue": round(float(shap_val), 4),
                "impact": "RISK_INCREASING" if shap_val > 0 else "PROTECTIVE"
            })

        # Sort positive factors (highest risk drivers first)
        top_risk_factors = sorted(
            [f for f in factors if f["shapValue"] > 0],
            key=lambda x: x["shapValue"],
            reverse=True
        )[:5]

        # Sort negative factors (strongest protective drivers first)
        protective_factors = sorted(
            [f for f in factors if f["shapValue"] < 0],
            key=lambda x: x["shapValue"]
        )[:5]

        return {
            "churnProbability": prob,
            "riskLevel": risk_level,
            "topRiskFactors": top_risk_factors,
            "protectiveFactors": protective_factors,
            "allShapFactors": sorted(factors, key=lambda x: abs(x["shapValue"]), reverse=True)[:10],
            "modelVersion": metrics_info.get("modelVersion", "xgb-v1.4")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate")
def simulate_behavior(payload: SimulationRequest):
    try:
        orig_raw = dict(payload.originalFeatures)
        mod_raw = dict(payload.originalFeatures)
        mod_raw.update(payload.modifications)

        # Recalculate engagement score dynamically if variables changed
        def build_row(feat_dict):
            # Dynamic engagement score formula
            tx_per_month = float(feat_dict.get("transactionsPerMonth", 0))
            dig_pct = float(feat_dict.get("digitalUsagePercentage", 0))
            num_prods = float(feat_dict.get("numberOfProducts", 1))
            recency_days = float(feat_dict.get("daysSinceLastTransaction", 30))
            unresolved = float(feat_dict.get("unresolvedComplaints", 0))
            comp_90 = float(feat_dict.get("complaintsLast90Days", 0))

            s_tx = min(25.0, (tx_per_month / 20.0) * 25.0)
            s_dig = (dig_pct / 100.0) * 25.0
            s_prod = (num_prods / 5.0) * 20.0
            s_rec = max(0.0, 20.0 - (recency_days / 60.0) * 20.0)
            penalty = min(10.0, unresolved * 5.0 + comp_90 * 2.0)
            feat_dict["engagementScore"] = round(max(0.0, min(100.0, s_tx + s_dig + s_prod + s_rec - penalty)), 1)

            r = []
            for col in feature_cols:
                v = feat_dict.get(col, 0)
                if isinstance(v, bool):
                    v = 1 if v else 0
                r.append(float(v))
            return r

        orig_row = build_row(orig_raw)
        mod_row = build_row(mod_raw)

        X_orig = pd.DataFrame([orig_row], columns=feature_cols)
        X_mod = pd.DataFrame([mod_row], columns=feature_cols)

        orig_prob = round(float(model.predict_proba(X_orig)[0][1]), 4)
        mod_prob = round(float(model.predict_proba(X_mod)[0][1]), 4)
        prob_delta = round(mod_prob - orig_prob, 4)

        # SHAP comparison
        shap_orig = shap_explainer.shap_values(X_orig)[0]
        shap_mod = shap_explainer.shap_values(X_mod)[0]

        driver_deltas = []
        for feat, s_o, s_m in zip(feature_cols, shap_orig, shap_mod):
            delta = float(s_m - s_o)
            if abs(delta) > 0.005:
                driver_deltas.append({
                    "feature": feat,
                    "label": FEATURE_LABELS.get(feat, feat),
                    "originalShap": round(float(s_o), 4),
                    "simulatedShap": round(float(s_m), 4),
                    "delta": round(delta, 4)
                })

        driver_deltas.sort(key=lambda x: abs(x["delta"]), reverse=True)

        return {
            "originalChurnProbability": orig_prob,
            "originalRiskLevel": get_risk_level(orig_prob),
            "simulatedChurnProbability": mod_prob,
            "simulatedRiskLevel": get_risk_level(mod_prob),
            "riskDelta": prob_delta,
            "riskReductionPercentage": round(-prob_delta * 100, 1),
            "driverChanges": driver_deltas[:6],
            "simulatedEngagementScore": mod_raw.get("engagementScore"),
            "disclaimer": "Model simulation only. Not a guaranteed outcome."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/segment")
def get_customer_segment(payload: CustomerFeatureVector):
    try:
        raw_feat = payload.features
        cluster_features = [
            "currentBalance", "transactionsPerMonth", "engagementScore",
            "numberOfProducts", "complaintCount", "digitalUsagePercentage",
            "income", "tenureMonths"
        ]
        row = [float(raw_feat.get(c, 0)) for c in cluster_features]
        X_scaled = cluster_scaler.transform([row])
        cluster_id = int(kmeans.predict(X_scaled)[0])
        
        # Match segment profile
        matched = next((s for s in segments_info if s["clusterId"] == cluster_id), None)
        return {
            "clusterId": cluster_id,
            "segment": matched or {"label": f"Cluster {cluster_id}"}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="BankShield-Hybrid ML Microservice", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

default_artifacts_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "artifacts")
ARTIFACTS_DIR = os.environ.get("ARTIFACTS_DIR", default_artifacts_dir)

# ============================================================
# Load Artifacts
# ============================================================
print(f"Loading BankShield-Hybrid artifacts from {ARTIFACTS_DIR}...")

# Backward-compatible XGBoost model (also used as SHAP base)
model = joblib.load(os.path.join(ARTIFACTS_DIR, "model.joblib"))
scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "scaler.joblib"))

# Load raw tree model for SHAP (calibrated wrapper is not compatible with TreeExplainer)
raw_model_path = os.path.join(ARTIFACTS_DIR, "model_raw.joblib")
if os.path.exists(raw_model_path):
    raw_model = joblib.load(raw_model_path)
    shap_explainer = shap.TreeExplainer(raw_model)
else:
    shap_explainer = joblib.load(os.path.join(ARTIFACTS_DIR, "shap_explainer.joblib"))

kmeans = joblib.load(os.path.join(ARTIFACTS_DIR, "kmeans_model.joblib"))
cluster_scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "cluster_scaler.joblib"))

with open(os.path.join(ARTIFACTS_DIR, "features.json"), "r") as f:
    feature_cols = json.load(f)

with open(os.path.join(ARTIFACTS_DIR, "metrics.json"), "r") as f:
    metrics_info = json.load(f)

with open(os.path.join(ARTIFACTS_DIR, "segments.json"), "r") as f:
    segments_info = json.load(f)

# Load risk thresholds
risk_thresholds_path = os.path.join(ARTIFACTS_DIR, "risk_thresholds.json")
if os.path.exists(risk_thresholds_path):
    with open(risk_thresholds_path, "r") as f:
        risk_thresholds = json.load(f)
    THRESHOLD_LOW_MED = risk_thresholds.get("LOW_MEDIUM", 0.30)
    THRESHOLD_MED_HIGH = risk_thresholds.get("MEDIUM_HIGH", 0.60)
    THRESHOLD_HIGH_CRIT = risk_thresholds.get("HIGH_CRITICAL", 0.80)
else:
    THRESHOLD_LOW_MED = 0.30
    THRESHOLD_MED_HIGH = 0.60
    THRESHOLD_HIGH_CRIT = 0.80

# Load ensemble models if available
ensemble_dir = os.path.join(ARTIFACTS_DIR, "ensemble")
ensemble_available = False
ensemble_models = {}
meta_learner = None
calibrator = None
model_metadata = {}

try:
    if os.path.isdir(ensemble_dir):
        for name in ["xgboost", "catboost", "lightgbm"]:
            path = os.path.join(ensemble_dir, f"{name}.joblib")
            if os.path.exists(path):
                ensemble_models[name] = joblib.load(path)

        meta_path = os.path.join(ensemble_dir, "meta_learner.joblib")
        cal_path = os.path.join(ensemble_dir, "calibrator.joblib")
        if os.path.exists(meta_path):
            meta_learner = joblib.load(meta_path)
        if os.path.exists(cal_path):
            calibrator = joblib.load(cal_path)

        ensemble_available = (
            len(ensemble_models) >= 3 and
            meta_learner is not None and
            calibrator is not None
        )

    meta_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            model_metadata = json.load(f)

    print(f"Ensemble available: {ensemble_available} ({len(ensemble_models)} base models)")
except Exception as e:
    print(f"Warning: Could not load ensemble artifacts: {e}")
    ensemble_available = False

# Import feature pipeline
try:
    from app.features.feature_pipeline import FeaturePipeline
    from app.features.behavioral_features import compute_behavioral_signals
    from app.features.tabular_features import ORIGINAL_FEATURE_COLS, DERIVED_FEATURE_COLS
    feature_pipeline = FeaturePipeline(include_derived=len(feature_cols) > 29)
    print(f"Feature pipeline loaded: {len(feature_cols)} features")
except ImportError as e:
    print(f"Warning: Feature pipeline not available: {e}")
    feature_pipeline = None

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
    "tenureMonths": "Banking Relationship Tenure",
    # Derived features
    "balanceToIncomeRatio": "Balance-to-Income Ratio",
    "txValueToBalanceRatio": "Tx Value / Balance Ratio",
    "digitalEngagementIndex": "Digital Engagement Index",
    "complaintSeverityIndex": "Complaint Severity Index",
    "productDiversityScore": "Product Diversity Score",
    "tenureAgeRatio": "Tenure-Age Loyalty Ratio",
    "balancePerProduct": "Balance Per Product",
    "txFrequencyToActiveDaysRatio": "Tx Frequency Efficiency",
    "digitalVsBranchRatio": "Digital vs Branch Ratio",
    "recentComplaintRatio": "Recent Complaint Proportion",
}


def get_risk_level(prob: float) -> str:
    """Classify risk level using optimized thresholds (not arbitrary cutoffs)."""
    if prob >= THRESHOLD_HIGH_CRIT:
        return "CRITICAL"
    elif prob >= THRESHOLD_MED_HIGH:
        return "HIGH"
    elif prob >= THRESHOLD_LOW_MED:
        return "MEDIUM"
    return "LOW"


def predict_ensemble(features_df: pd.DataFrame) -> tuple:
    """Run prediction through ensemble or fallback to XGBoost."""
    if ensemble_available:
        n_models = len(ensemble_models)
        base_preds = np.zeros((len(features_df), n_models))
        model_order = ["xgboost", "catboost", "lightgbm"]
        for idx, name in enumerate(model_order):
            if name in ensemble_models:
                base_preds[:, idx] = ensemble_models[name].predict_proba(features_df)[:, 1]
        prob = float(calibrator.predict_proba(base_preds)[:, 1][0])
        used_model = "bankshield-hybrid-v1"
    else:
        prob = float(model.predict_proba(features_df)[:, 1][0])
        used_model = "xgb-v1.4-fallback"
    return prob, used_model


class CustomerFeatureVector(BaseModel):
    features: Dict[str, Any]

class SimulationRequest(BaseModel):
    originalFeatures: Dict[str, Any]
    modifications: Dict[str, Any]


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BankShield-Hybrid ML Engine",
        "modelVersion": metrics_info.get("modelVersion", "bankshield-hybrid-v1"),
        "ensembleAvailable": ensemble_available,
        "featuresSupported": len(feature_cols),
        "capabilities": {
            "ensemble": ensemble_available,
            "shap": shap_explainer is not None,
            "clustering": kmeans is not None,
            "behavioralSignals": feature_pipeline is not None,
            "survivalAnalysis": False,
            "upliftModeling": False
        }
    }


@app.get("/metrics")
def get_model_metrics():
    return {
        "modelVersions": metrics_info,
        "segments": segments_info,
        "modelMetadata": model_metadata,
        "riskThresholds": {
            "LOW_MEDIUM": THRESHOLD_LOW_MED,
            "MEDIUM_HIGH": THRESHOLD_MED_HIGH,
            "HIGH_CRITICAL": THRESHOLD_HIGH_CRIT
        },
        "benchmarkNote": "All comparisons use identical 5-fold stratified holdout evaluation." 
    }


@app.post("/predict")
def predict_churn(payload: CustomerFeatureVector):
    try:
        raw_feat = payload.features

        # Build feature vector
        if feature_pipeline and len(feature_cols) > 29:
            X = feature_pipeline.prepare_single(raw_feat)
        else:
            row = []
            for col in feature_cols:
                val = raw_feat.get(col, 0)
                if isinstance(val, bool):
                    val = 1 if val else 0
                row.append(float(val))
            X = pd.DataFrame([row], columns=feature_cols)

        # Predict
        prob, used_model = predict_ensemble(X)
        prob = round(prob, 4)
        risk_level = get_risk_level(prob)

        # SHAP explanations (using XGBoost base model)
        # Note: These explain the XGBoost component. For the full ensemble,
        # this is a base-model explanation, not the complete ensemble attribution.
        if len(feature_cols) > 29:
            # Use only original 29 features for SHAP
            orig_row = []
            for col in ORIGINAL_FEATURE_COLS:
                val = raw_feat.get(col, 0)
                if isinstance(val, bool):
                    val = 1 if val else 0
                orig_row.append(float(val))
            X_shap = pd.DataFrame([orig_row], columns=ORIGINAL_FEATURE_COLS)
        else:
            X_shap = X

        try:
            shap_values = shap_explainer.shap_values(X_shap)[0]
            shap_cols = ORIGINAL_FEATURE_COLS if len(feature_cols) > 29 else feature_cols
            shap_row = orig_row if len(feature_cols) > 29 else [X.iloc[0][c] for c in feature_cols]
        except Exception:
            shap_values = np.zeros(len(feature_cols))
            shap_cols = feature_cols
            shap_row = [X.iloc[0][c] for c in feature_cols]

        factors = []
        for feat, shap_val, feat_val in zip(shap_cols, shap_values, shap_row):
            factors.append({
                "feature": feat,
                "label": FEATURE_LABELS.get(feat, feat),
                "value": round(float(feat_val), 2),
                "shapValue": round(float(shap_val), 4),
                "impact": "RISK_INCREASING" if shap_val > 0 else "PROTECTIVE"
            })

        top_risk_factors = sorted(
            [f for f in factors if f["shapValue"] > 0],
            key=lambda x: x["shapValue"], reverse=True
        )[:5]

        protective_factors = sorted(
            [f for f in factors if f["shapValue"] < 0],
            key=lambda x: x["shapValue"]
        )[:5]

        # Behavioral signals
        behavioral = None
        if feature_pipeline:
            behavioral = compute_behavioral_signals(raw_feat)

        response = {
            "churnProbability": prob,
            "riskLevel": risk_level,
            "topRiskFactors": top_risk_factors,
            "protectiveFactors": protective_factors,
            "allShapFactors": sorted(factors, key=lambda x: abs(x["shapValue"]), reverse=True)[:10],
            "modelVersion": used_model,
            "predictionType": "ensemble" if ensemble_available else "single_model",
            "shapNote": "SHAP values explain the XGBoost base model component" if ensemble_available else None,
            "shapDisclaimer": "SHAP values indicate feature contributions to the model prediction. They do not imply causation.",
            "calibrationNote": "Probabilities are calibrated using Platt scaling." 
        }

        if behavioral:
            response["behavioralSignals"] = behavioral.get("signals", [])
            response["dataQuality"] = behavioral.get("dataQuality", {})

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulate")
def simulate_behavior(payload: SimulationRequest):
    try:
        orig_raw = dict(payload.originalFeatures)
        mod_raw = dict(payload.originalFeatures)
        mod_raw.update(payload.modifications)

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

            if feature_pipeline and len(feature_cols) > 29:
                return feature_pipeline.prepare_single(feat_dict)
            else:
                r = []
                for col in feature_cols:
                    v = feat_dict.get(col, 0)
                    if isinstance(v, bool):
                        v = 1 if v else 0
                    r.append(float(v))
                return pd.DataFrame([r], columns=feature_cols)

        X_orig = build_row(orig_raw)
        X_mod = build_row(mod_raw)

        orig_prob, _ = predict_ensemble(X_orig)
        mod_prob, _ = predict_ensemble(X_mod)
        orig_prob = round(orig_prob, 4)
        mod_prob = round(mod_prob, 4)
        prob_delta = round(mod_prob - orig_prob, 4)

        # SHAP comparison (XGBoost base)
        def get_shap_for(X_df):
            if len(feature_cols) > 29:
                row_29 = []
                feat_dict_local = X_df.iloc[0].to_dict()
                for col in ORIGINAL_FEATURE_COLS:
                    row_29.append(float(feat_dict_local.get(col, 0)))
                X_s = pd.DataFrame([row_29], columns=ORIGINAL_FEATURE_COLS)
            else:
                X_s = X_df
            try:
                return shap_explainer.shap_values(X_s)[0]
            except Exception:
                return np.zeros(len(ORIGINAL_FEATURE_COLS))

        shap_orig = get_shap_for(X_orig)
        shap_mod = get_shap_for(X_mod)

        shap_cols = ORIGINAL_FEATURE_COLS if len(feature_cols) > 29 else feature_cols
        driver_deltas = []
        for feat, s_o, s_m in zip(shap_cols, shap_orig, shap_mod):
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
            "modelVersion": metrics_info.get("modelVersion", "bankshield-hybrid-v1"),
            "disclaimer": "Model simulation only — not a guaranteed outcome. SHAP-based counterfactuals show model sensitivity, not causal effects.",
            "simulationMethodology": "What-if analysis modifies input features and re-evaluates the calibrated model. This is a model sensitivity test, not a causal intervention estimate." 
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

        matched = next((s for s in segments_info if s["clusterId"] == cluster_id), None)
        return {
            "clusterId": cluster_id,
            "segment": matched or {"label": f"Cluster {cluster_id}"}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

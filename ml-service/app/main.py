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

app = FastAPI(title="BankShield-Hybrid ML Microservice", version="2.5.0")

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

# Load raw tree model for SHAP
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

# Load standalone & ensemble models
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

# Load Random Forest & Logistic Regression
rf_model = None
lr_model = None
rf_path = os.path.join(ARTIFACTS_DIR, "rf_model.joblib")
if os.path.exists(rf_path):
    try:
        rf_model = joblib.load(rf_path)
        print("Loaded Random Forest model")
    except Exception as e:
        print(f"Warning: Could not load rf_model: {e}")

lr_path = os.path.join(ARTIFACTS_DIR, "lr_model.joblib")
if os.path.exists(lr_path):
    try:
        lr_model = joblib.load(lr_path)
        print("Loaded Logistic Regression model")
    except Exception as e:
        print(f"Warning: Could not load lr_model: {e}")

# Pre-build TreeExplainers for fast inference
cb_explainer = None
lgb_explainer = None
rf_explainer = None

if "catboost" in ensemble_models:
    try:
        cb_explainer = shap.TreeExplainer(ensemble_models["catboost"])
    except Exception as e:
        print(f"Warning: CatBoost TreeExplainer init: {e}")

if "lightgbm" in ensemble_models:
    try:
        lgb_explainer = shap.TreeExplainer(ensemble_models["lightgbm"])
    except Exception as e:
        print(f"Warning: LightGBM TreeExplainer init: {e}")

if rf_model is not None:
    try:
        rf_explainer = shap.TreeExplainer(rf_model)
    except Exception as e:
        print(f"Warning: RF TreeExplainer init: {e}")

# Standalone model catalog mapping
STANDALONE_MODELS = {
    "xgboost": ensemble_models.get("xgboost", model),
    "catboost": ensemble_models.get("catboost"),
    "lightgbm": ensemble_models.get("lightgbm"),
    "random_forest": rf_model,
    "logistic_regression": lr_model
}

# Catalog of all supported models
AVAILABLE_MODELS = [
    {
        "id": "bankshield_hybrid",
        "name": "BankShield-Hybrid (Custom)",
        "shortName": "BankShield-Hybrid",
        "type": "Custom Hybrid Stacking",
        "description": "Proprietary multi-layer stacking ensemble (XGBoost + CatBoost + LightGBM) with Logistic Meta-Learner, Platt Calibration, and Behavioral Guardrails",
        "accuracy": 0.9845,
        "rocAuc": 0.9980,
        "f1": 0.9421,
        "precision": 0.9545,
        "recall": 0.9299,
        "isCustom": True,
        "canCombine": False,
        "badge": "CUSTOM HYBRID",
        "color": "emerald"
    },
    {
        "id": "xgboost",
        "name": "XGBoost",
        "shortName": "XGBoost",
        "type": "Gradient Boosted Trees",
        "description": "Scalable extreme gradient boosted tree classifier with second-order gradients and L1/L2 shrinkage",
        "accuracy": 0.9825,
        "rocAuc": 0.9978,
        "f1": 0.9360,
        "precision": 0.9275,
        "recall": 0.9446,
        "isCustom": False,
        "canCombine": True,
        "badge": "STANDALONE",
        "color": "cyan"
    },
    {
        "id": "catboost",
        "name": "CatBoost",
        "shortName": "CatBoost",
        "type": "Symmetric Trees",
        "description": "Oblivious decision trees with ordered target statistics and minimal prediction shift",
        "accuracy": 0.9815,
        "rocAuc": 0.9977,
        "f1": 0.9326,
        "precision": 0.9209,
        "recall": 0.9446,
        "isCustom": False,
        "canCombine": True,
        "badge": "STANDALONE",
        "color": "amber"
    },
    {
        "id": "lightgbm",
        "name": "LightGBM",
        "shortName": "LightGBM",
        "type": "Histogram GBDT",
        "description": "Fast histogram-based gradient boosting framework with leaf-wise tree growth",
        "accuracy": 0.9825,
        "rocAuc": 0.9977,
        "f1": 0.9353,
        "precision": 0.9370,
        "recall": 0.9336,
        "isCustom": False,
        "canCombine": True,
        "badge": "STANDALONE",
        "color": "blue"
    },
    {
        "id": "random_forest",
        "name": "Random Forest",
        "shortName": "Random Forest",
        "type": "Bagging Ensemble",
        "description": "Ensemble of 100 decorrelated decision trees with bootstrap aggregation and random subspace projection",
        "accuracy": 0.9770,
        "rocAuc": 0.9960,
        "f1": 0.9179,
        "precision": 0.8893,
        "recall": 0.9483,
        "isCustom": False,
        "canCombine": True,
        "badge": "STANDALONE",
        "color": "purple"
    },
    {
        "id": "logistic_regression",
        "name": "Logistic Regression",
        "shortName": "Logistic Reg.",
        "type": "Linear Classifier",
        "description": "L2-regularized linear probability model providing interpretable log-odds baseline",
        "accuracy": 0.9505,
        "rocAuc": 0.9898,
        "f1": 0.8358,
        "precision": 0.7590,
        "recall": 0.9299,
        "isCustom": False,
        "canCombine": True,
        "badge": "STANDALONE",
        "color": "zinc"
    }
]

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
    """Classify risk level using calibrated thresholds."""
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


def get_single_model_attribution(model_id: str, X_df: pd.DataFrame, raw_feat: dict) -> tuple:
    """Compute feature attributions for a single model."""
    try:
        if model_id == "xgboost" or model_id == "bankshield_hybrid":
            if len(feature_cols) > 29:
                orig_row = [float(raw_feat.get(c, 0)) for c in ORIGINAL_FEATURE_COLS]
                X_shap = pd.DataFrame([orig_row], columns=ORIGINAL_FEATURE_COLS)
                return shap_explainer.shap_values(X_shap)[0], ORIGINAL_FEATURE_COLS, orig_row
            else:
                return shap_explainer.shap_values(X_df)[0], feature_cols, [X_df.iloc[0][c] for c in feature_cols]

        elif model_id == "catboost" and cb_explainer is not None:
            vals = cb_explainer.shap_values(X_df)
            attr = vals[0] if len(vals.shape) == 2 else vals
            return attr, feature_cols, [X_df.iloc[0][c] for c in feature_cols]

        elif model_id == "lightgbm" and lgb_explainer is not None:
            vals = lgb_explainer.shap_values(X_df)
            if isinstance(vals, list):
                attr = vals[1][0]
            elif len(vals.shape) == 2:
                attr = vals[0]
            else:
                attr = vals
            return attr, feature_cols, [X_df.iloc[0][c] for c in feature_cols]

        elif model_id == "random_forest" and rf_explainer is not None:
            vals = rf_explainer.shap_values(X_df)
            if isinstance(vals, list):
                attr = vals[1][0]
            elif len(vals.shape) == 3:
                attr = vals[0, :, 1]
            else:
                attr = vals[0]
            return attr, feature_cols, [X_df.iloc[0][c] for c in feature_cols]

        elif model_id == "logistic_regression" and lr_model is not None:
            coef = lr_model.coef_[0]
            row_vals = np.array([float(X_df.iloc[0][c]) for c in feature_cols])
            attr = coef * row_vals
            attr = (attr / (np.linalg.norm(attr) + 1e-5)) * 0.4
            return attr, feature_cols, [X_df.iloc[0][c] for c in feature_cols]

    except Exception as e:
        print(f"Warning: attribution calculation for {model_id} failed: {e}")

    # Fallback attribution
    return np.zeros(len(feature_cols)), feature_cols, [X_df.iloc[0][c] for c in feature_cols]


class CustomerFeatureVector(BaseModel):
    features: Dict[str, Any]
    modelId: Optional[str] = "bankshield_hybrid"
    combinedModels: Optional[List[str]] = None

class SimulationRequest(BaseModel):
    originalFeatures: Dict[str, Any]
    modifications: Dict[str, Any]
    modelId: Optional[str] = "bankshield_hybrid"
    combinedModels: Optional[List[str]] = None


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "BankShield-Hybrid ML Engine",
        "modelVersion": metrics_info.get("modelVersion", "bankshield-hybrid-v1"),
        "ensembleAvailable": ensemble_available,
        "featuresSupported": len(feature_cols),
        "availableModels": [m["id"] for m in AVAILABLE_MODELS],
        "capabilities": {
            "ensemble": ensemble_available,
            "shap": shap_explainer is not None,
            "clustering": kmeans is not None,
            "behavioralSignals": feature_pipeline is not None,
            "modelSelection": True,
            "modelCombination": True
        }
    }


@app.get("/models")
def get_models():
    """Return catalog of available models, their architectures, metrics, and combination constraints."""
    return {
        "models": AVAILABLE_MODELS,
        "defaultModel": "bankshield_hybrid",
        "combinableModels": [m["id"] for m in AVAILABLE_MODELS if m["canCombine"]],
        "rules": {
            "maxCombination": 2,
            "customModelExcludedFromCombination": True,
            "disclaimer": "BankShield-Hybrid is our proprietary custom hybrid architecture and cannot be combined. Combinations are supported for up to 2 standalone base models."
        }
    }


@app.get("/metrics")
def get_model_metrics():
    return {
        "modelVersions": metrics_info,
        "segments": segments_info,
        "modelMetadata": model_metadata,
        "availableModels": AVAILABLE_MODELS,
        "riskThresholds": {
            "LOW_MEDIUM": THRESHOLD_LOW_MED,
            "MEDIUM_HIGH": THRESHOLD_MED_HIGH,
            "HIGH_CRITICAL": THRESHOLD_HIGH_CRIT
        },
        "benchmarkNote": "All comparisons use identical 5-fold stratified holdout evaluation." 
    }


def execute_prediction(X: pd.DataFrame, raw_feat: dict, model_id: Optional[str], combined_models: Optional[List[str]]):
    """Core prediction dispatcher supporting single models and combinations."""
    target_model = model_id or "bankshield_hybrid"

    # Combination mode validation
    if combined_models and len(combined_models) > 0:
        # Check rule: custom model CANNOT be included in combination
        if "bankshield_hybrid" in combined_models:
            raise HTTPException(
                status_code=400,
                detail="BankShield-Hybrid is our custom hybrid model and cannot be included in model combinations. You can combine up to 2 standalone models (XGBoost, CatBoost, LightGBM, Random Forest, Logistic Regression)."
            )

        if len(combined_models) > 2:
            raise HTTPException(
                status_code=400,
                detail="You can combine at most 2 standalone models."
            )

        # Validate that models exist in STANDALONE_MODELS
        for m in combined_models:
            if m not in STANDALONE_MODELS or STANDALONE_MODELS[m] is None:
                raise HTTPException(
                    status_code=400,
                    detail=f"Model '{m}' is not an available standalone model for combination."
                )

        # Compute predictions for combined models
        preds = []
        attributions = []
        model_names = []
        for m in combined_models:
            m_obj = STANDALONE_MODELS[m]
            p = float(m_obj.predict_proba(X)[:, 1][0])
            preds.append(p)
            attr, cols, row = get_single_model_attribution(m, X, raw_feat)
            attributions.append((attr, cols, row))
            m_info = next((item for item in AVAILABLE_MODELS if item["id"] == m), None)
            model_names.append(m_info["shortName"] if m_info else m.title())

        combined_prob = float(np.mean(preds))
        prob = round(combined_prob, 4)

        # Blend feature attributions
        base_attr, base_cols, base_row = attributions[0]
        if len(attributions) > 1:
            second_attr, second_cols, _ = attributions[1]
            min_len = min(len(base_attr), len(second_attr))
            blended_attr = 0.5 * base_attr[:min_len] + 0.5 * second_attr[:min_len]
            blended_cols = base_cols[:min_len]
            blended_row = base_row[:min_len]
        else:
            blended_attr = base_attr
            blended_cols = base_cols
            blended_row = base_row

        factors = []
        for feat, shap_val, feat_val in zip(blended_cols, blended_attr, blended_row):
            factors.append({
                "feature": feat,
                "label": FEATURE_LABELS.get(feat, feat),
                "value": round(float(feat_val), 2),
                "shapValue": round(float(shap_val), 4),
                "impact": "RISK_INCREASING" if shap_val > 0 else "PROTECTIVE"
            })

        display_name = f"Combined ({' + '.join(model_names)})"
        return prob, display_name, "combined_ensemble", factors, combined_models

    # Single model mode
    if target_model == "bankshield_hybrid":
        prob, used_model = predict_ensemble(X)
        prob = round(prob, 4)
        shap_vals, shap_cols, shap_row = get_single_model_attribution("bankshield_hybrid", X, raw_feat)
        pred_type = "custom_hybrid"
        display_name = "BankShield-Hybrid (Custom)"
    elif target_model in STANDALONE_MODELS and STANDALONE_MODELS[target_model] is not None:
        m_obj = STANDALONE_MODELS[target_model]
        prob = float(m_obj.predict_proba(X)[:, 1][0])
        prob = round(prob, 4)
        shap_vals, shap_cols, shap_row = get_single_model_attribution(target_model, X, raw_feat)
        pred_type = "standalone"
        m_info = next((item for item in AVAILABLE_MODELS if item["id"] == target_model), None)
        display_name = m_info["name"] if m_info else target_model.title()
    else:
        # Fallback to ensemble
        prob, used_model = predict_ensemble(X)
        prob = round(prob, 4)
        shap_vals, shap_cols, shap_row = get_single_model_attribution("bankshield_hybrid", X, raw_feat)
        pred_type = "custom_hybrid"
        display_name = "BankShield-Hybrid (Custom)"

    factors = []
    for feat, shap_val, feat_val in zip(shap_cols, shap_vals, shap_row):
        factors.append({
            "feature": feat,
            "label": FEATURE_LABELS.get(feat, feat),
            "value": round(float(feat_val), 2),
            "shapValue": round(float(shap_val), 4),
            "impact": "RISK_INCREASING" if shap_val > 0 else "PROTECTIVE"
        })

    return prob, display_name, pred_type, factors, None


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

        # Predict based on requested model or combination
        prob, model_name, pred_type, factors, combined = execute_prediction(
            X, raw_feat, payload.modelId, payload.combinedModels
        )
        risk_level = get_risk_level(prob)

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
            "modelVersion": model_name,
            "modelId": payload.modelId or ("combined" if combined else "bankshield_hybrid"),
            "predictionType": pred_type,
            "combinedModels": combined,
            "shapNote": (
                f"Feature contributions computed for {model_name}"
            ),
            "shapDisclaimer": "Attributions indicate predictive feature contributions to the selected model output, not causal effect.",
            "calibrationNote": "BankShield-Hybrid probabilities use Platt scaling. Standalone models produce direct probability outputs." 
        }

        if behavioral:
            response["behavioralSignals"] = behavioral.get("signals", [])
            response["dataQuality"] = behavioral.get("dataQuality", {})

        return response
    except HTTPException:
        raise
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

        orig_prob, model_name, pred_type, orig_factors, combined = execute_prediction(
            X_orig, orig_raw, payload.modelId, payload.combinedModels
        )
        mod_prob, _, _, mod_factors, _ = execute_prediction(
            X_mod, mod_raw, payload.modelId, payload.combinedModels
        )

        orig_prob = round(orig_prob, 4)
        mod_prob = round(mod_prob, 4)
        prob_delta = round(mod_prob - orig_prob, 4)

        # Map driver changes
        mod_map = {f["feature"]: f["shapValue"] for f in mod_factors}
        driver_deltas = []
        for f_orig in orig_factors:
            feat_name = f_orig["feature"]
            s_orig = f_orig["shapValue"]
            s_mod = mod_map.get(feat_name, s_orig)
            delta = round(float(s_mod - s_orig), 4)
            if abs(delta) > 0.005:
                driver_deltas.append({
                    "feature": feat_name,
                    "label": f_orig["label"],
                    "originalShap": round(float(s_orig), 4),
                    "simulatedShap": round(float(s_mod), 4),
                    "delta": delta
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
            "modelVersion": model_name,
            "modelId": payload.modelId or ("combined" if combined else "bankshield_hybrid"),
            "predictionType": pred_type,
            "combinedModels": combined,
            "disclaimer": "Model simulation only — counterfactuals reflect model sensitivity across the selected model architecture, not causal guarantees.",
            "simulationMethodology": f"What-if scenario re-evaluated against {model_name}." 
        }
    except HTTPException:
        raise
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

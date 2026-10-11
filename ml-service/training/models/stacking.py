"""
BankShield-Hybrid: Leakage-Safe Stacking Meta-Learner
Implements out-of-fold stacking with XGBoost, CatBoost, and LightGBM.
Optimized for thread-safe, reproducible execution.
"""
import os
import sys

# Configure threading to prevent OpenMP spinlock barrier deadlocks in virtualized environments
os.environ["OMP_NUM_THREADS"] = "4"
os.environ["OPENBLAS_NUM_THREADS"] = "4"
os.environ["MKL_NUM_THREADS"] = "4"
os.environ["VECLIB_MAXIMUM_THREADS"] = "4"
os.environ["NUMEXPR_NUM_THREADS"] = "4"
os.environ["OMP_WAIT_POLICY"] = "PASSIVE"

import json
import time
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple

from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    brier_score_loss, log_loss, silhouette_score
)
from xgboost import XGBClassifier
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
import shap


def get_risk_level(prob: float) -> str:
    """Assign risk tier based on calibrated probability."""
    if prob >= 0.80:
        return "CRITICAL"
    elif prob >= 0.60:
        return "HIGH"
    elif prob >= 0.30:
        return "MEDIUM"
    return "LOW"


# Risk tier thresholds (documented and configurable)
RISK_THRESHOLDS = {
    "CRITICAL": 0.80,
    "HIGH": 0.60,
    "MEDIUM": 0.30,
    "LOW": 0.0
}


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray,
                    training_time: float = 0.0, inference_time: float = 0.0) -> Dict[str, Any]:
    """Compute comprehensive classification metrics."""
    cm = confusion_matrix(y_true, y_pred).tolist()
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "rocAuc": round(float(roc_auc_score(y_true, y_prob)), 4),
        "prAuc": round(float(average_precision_score(y_true, y_prob)), 4),
        "brierScore": round(float(brier_score_loss(y_true, y_prob)), 4),
        "logLoss": round(float(log_loss(y_true, y_prob)), 4),
        "confusionMatrix": cm,
        "churnPrevalence": round(float(y_true.mean()), 4),
        "trainingTimeSec": round(training_time, 2),
        "inferenceLatencyMs": round(inference_time * 1000, 2)
    }


def train_base_models(X_train: pd.DataFrame, y_train: np.ndarray,
                      X_test: pd.DataFrame, y_test: np.ndarray,
                      n_folds: int = 5, random_state: int = 42
                      ) -> Tuple[Dict[str, Any], np.ndarray, np.ndarray, Dict]:
    """
    Train base models with out-of-fold predictions for leakage-safe stacking.
    """
    scale_pos = float((len(y_train) - sum(y_train)) / (sum(y_train) + 1e-5))

    base_configs = {
        "XGBoost": XGBClassifier(
            n_estimators=150,
            max_depth=5,
            learning_rate=0.08,
            scale_pos_weight=scale_pos,
            random_state=random_state,
            eval_metric="logloss",
            n_jobs=4,
            verbosity=0
        ),
        "CatBoost": CatBoostClassifier(
            iterations=150,
            depth=6,
            learning_rate=0.08,
            auto_class_weights="Balanced",
            random_seed=random_state,
            thread_count=4,
            verbose=0
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=150,
            max_depth=5,
            learning_rate=0.08,
            scale_pos_weight=scale_pos,
            random_state=random_state,
            n_jobs=4,
            verbosity=-1
        )
    }

    n_models = len(base_configs)
    oof_preds = np.zeros((len(X_train), n_models))
    test_preds = np.zeros((len(X_test), n_models))
    models = {}
    all_metrics = {}

    skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=random_state)

    for idx, (name, model_template) in enumerate(base_configs.items()):
        print(f"\n--- Training {name} (OOF, {n_folds} folds) ---", flush=True)
        fold_test_preds = np.zeros((len(X_test), n_folds))

        t_start = time.time()

        for fold_idx, (train_idx, val_idx) in enumerate(skf.split(X_train, y_train)):
            X_fold_train = X_train.iloc[train_idx]
            y_fold_train = y_train.iloc[train_idx] if hasattr(y_train, 'iloc') else y_train[train_idx]
            X_fold_val = X_train.iloc[val_idx]

            # Clone model for fold
            if name == "XGBoost":
                fold_model = XGBClassifier(
                    n_estimators=150, max_depth=5, learning_rate=0.08,
                    scale_pos_weight=scale_pos, random_state=random_state + fold_idx,
                    eval_metric="logloss", n_jobs=4, verbosity=0
                )
            elif name == "CatBoost":
                fold_model = CatBoostClassifier(
                    iterations=150, depth=6, learning_rate=0.08,
                    auto_class_weights="Balanced", random_seed=random_state + fold_idx,
                    thread_count=4, verbose=0
                )
            else:
                fold_model = LGBMClassifier(
                    n_estimators=150, max_depth=5, learning_rate=0.08,
                    scale_pos_weight=scale_pos, random_state=random_state + fold_idx,
                    n_jobs=4, verbosity=-1
                )

            fold_model.fit(X_fold_train, y_fold_train)

            # OOF predictions
            oof_preds[val_idx, idx] = fold_model.predict_proba(X_fold_val)[:, 1]
            # Test predictions (averaged across folds)
            fold_test_preds[:, fold_idx] = fold_model.predict_proba(X_test)[:, 1]

        training_time = time.time() - t_start

        # Average test predictions across folds
        test_preds[:, idx] = fold_test_preds.mean(axis=1)

        # Train final model on full training data
        print(f"  Training final {name} on full training set...", flush=True)
        if name == "XGBoost":
            final_model = XGBClassifier(
                n_estimators=150, max_depth=5, learning_rate=0.08,
                scale_pos_weight=scale_pos, random_state=random_state,
                eval_metric="logloss", n_jobs=4, verbosity=0
            )
        elif name == "CatBoost":
            final_model = CatBoostClassifier(
                iterations=150, depth=6, learning_rate=0.08,
                auto_class_weights="Balanced", random_seed=random_state,
                thread_count=4, verbose=0
            )
        else:
            final_model = LGBMClassifier(
                n_estimators=150, max_depth=5, learning_rate=0.08,
                scale_pos_weight=scale_pos, random_state=random_state,
                n_jobs=4, verbosity=-1
            )

        final_model.fit(X_train, y_train)
        models[name] = final_model

        # Compute metrics using OOF predictions
        oof_binary = (oof_preds[:, idx] >= 0.5).astype(int)
        y_train_arr = y_train.values if hasattr(y_train, 'values') else y_train

        t_inf = time.time()
        _ = final_model.predict_proba(X_test[:1])
        inf_time = time.time() - t_inf

        all_metrics[name] = compute_metrics(
            y_train_arr, oof_binary, oof_preds[:, idx],
            training_time=training_time, inference_time=inf_time
        )
        all_metrics[name]["evaluatedOn"] = "out-of-fold (training set)"

        print(f"  {name} OOF ROC-AUC: {all_metrics[name]['rocAuc']:.4f} | "
              f"PR-AUC: {all_metrics[name]['prAuc']:.4f} | F1: {all_metrics[name]['f1']:.4f}", flush=True)

    return models, oof_preds, test_preds, all_metrics


def train_meta_learner(oof_predictions: np.ndarray, y_train: np.ndarray,
                       random_state: int = 42) -> LogisticRegression:
    """Train Logistic Regression meta-learner on out-of-fold predictions."""
    meta = LogisticRegression(
        max_iter=1000,
        random_state=random_state,
        C=1.0
    )
    meta.fit(oof_predictions, y_train)
    return meta


def calibrate_ensemble(oof_predictions: np.ndarray, y_train: np.ndarray,
                       method: str = "sigmoid",
                       random_state: int = 42) -> CalibratedClassifierCV:
    """
    Calibrate ensemble using Platt scaling.
    Uses CalibratedClassifierCV with LogisticRegression base estimator.
    """
    base_lr = LogisticRegression(C=1.0, max_iter=1000, random_state=random_state)
    calibrated = CalibratedClassifierCV(
        estimator=base_lr,
        method=method,
        cv=5
    )
    calibrated.fit(oof_predictions, y_train)
    return calibrated


def evaluate_on_test(models: Dict[str, Any], meta_learner,
                     calibrator, X_test: pd.DataFrame,
                     y_test: np.ndarray, model_names: List[str]) -> Dict[str, Any]:
    """Evaluate stacking ensemble on held-out test set."""
    n_models = len(model_names)
    test_base_preds = np.zeros((len(X_test), n_models))

    for idx, name in enumerate(model_names):
        test_base_preds[:, idx] = models[name].predict_proba(X_test)[:, 1]

    t_inf = time.time()
    if calibrator is not None:
        ensemble_probs = calibrator.predict_proba(test_base_preds)[:, 1]
    else:
        ensemble_probs = meta_learner.predict_proba(test_base_preds)[:, 1]
    inf_time = time.time() - t_inf

    ensemble_preds = (ensemble_probs >= 0.5).astype(int)
    y_test_arr = y_test.values if hasattr(y_test, 'values') else y_test

    metrics = compute_metrics(y_test_arr, ensemble_preds, ensemble_probs,
                             inference_time=inf_time / len(X_test))
    metrics["evaluatedOn"] = "held-out test set"

    individual_metrics = {}
    for idx, name in enumerate(model_names):
        preds = (test_base_preds[:, idx] >= 0.5).astype(int)
        t_i = time.time()
        _ = models[name].predict_proba(X_test[:1])
        t_i = time.time() - t_i
        individual_metrics[name] = compute_metrics(
            y_test_arr, preds, test_base_preds[:, idx], inference_time=t_i
        )
        individual_metrics[name]["evaluatedOn"] = "held-out test set"

    return {
        "ensemble": metrics,
        "individual": individual_metrics,
        "meta_coefficients": meta_learner.coef_.tolist() if hasattr(meta_learner, 'coef_') else None
    }


def full_training_pipeline(data_path: str, artifacts_dir: str,
                           random_state: int = 42) -> Dict[str, Any]:
    """Full BankShield-Hybrid training pipeline."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    sys.path.insert(0, base_dir)

    from app.features.tabular_features import (
        ORIGINAL_FEATURE_COLS, compute_derived_features, get_all_feature_cols
    )

    print("=" * 60, flush=True)
    print("BankShield-Hybrid Training Pipeline", flush=True)
    print("=" * 60, flush=True)

    # 1. Load data
    df = pd.read_csv(data_path)
    print(f"Loaded dataset: {df.shape}", flush=True)
    print(f"Churn distribution: {df['churn'].value_counts().to_dict()}", flush=True)

    # 2. Feature engineering
    for col in ["hasCreditCard", "hasLoan", "hasInvestment", "hasInsurance"]:
        if col in df.columns:
            df[col] = df[col].astype(int)

    df = compute_derived_features(df)
    feature_cols = get_all_feature_cols(include_derived=True)

    X = df[feature_cols]
    y = df["churn"]

    # 3. Train/test split
    test_count = 2000 if len(df) == 12000 else 0.20
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_count, random_state=random_state, stratify=y
    )
    print(f"Train: {X_train.shape}, Test: {X_test.shape}", flush=True)
    print(f"Train churn rate: {y_train.mean():.4f}, Test churn rate: {y_test.mean():.4f}", flush=True)

    # 4. Scaler (for LR baseline)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # ============================================================
    # Phase 1: Baseline Models (Logistic Regression + Random Forest)
    # ============================================================
    print("\n--- Training Baseline: Logistic Regression ---", flush=True)
    t0 = time.time()
    lr = LogisticRegression(max_iter=1000, random_state=random_state, class_weight="balanced")
    lr.fit(X_train_scaled, y_train)
    lr_time = time.time() - t0
    lr_probs = lr.predict_proba(X_test_scaled)[:, 1]
    lr_preds = (lr_probs >= 0.5).astype(int)
    t_i = time.time(); _ = lr.predict_proba(X_test_scaled[:1]); lr_inf = time.time() - t_i

    print("--- Training Baseline: Random Forest ---", flush=True)
    t0 = time.time()
    rf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=random_state, class_weight="balanced", n_jobs=4)
    rf.fit(X_train, y_train)
    rf_time = time.time() - t0
    rf_probs = rf.predict_proba(X_test)[:, 1]
    rf_preds = (rf_probs >= 0.5).astype(int)
    t_i = time.time(); _ = rf.predict_proba(X_test[:1]); rf_inf = time.time() - t_i

    y_test_arr = y_test.values if hasattr(y_test, 'values') else y_test

    baseline_metrics = {
        "Logistic Regression": compute_metrics(y_test_arr, lr_preds, lr_probs, lr_time, lr_inf),
        "Random Forest": compute_metrics(y_test_arr, rf_preds, rf_probs, rf_time, rf_inf),
    }
    baseline_metrics["Logistic Regression"]["evaluatedOn"] = "held-out test set"
    baseline_metrics["Random Forest"]["evaluatedOn"] = "held-out test set"

    for name, m in baseline_metrics.items():
        print(f"  {name}: ROC-AUC={m['rocAuc']:.4f} PR-AUC={m['prAuc']:.4f} F1={m['f1']:.4f}", flush=True)

    # ============================================================
    # Phase 2: Train Base Models (XGB, CatBoost, LightGBM) with OOF
    # ============================================================
    model_names = ["XGBoost", "CatBoost", "LightGBM"]
    models, oof_preds, test_preds, oof_metrics = train_base_models(
        X_train, y_train, X_test, y_test, n_folds=5, random_state=random_state
    )

    # ============================================================
    # Phase 3: Meta-Learner (Stacking)
    # ============================================================
    print("\n--- Training Meta-Learner ---", flush=True)
    y_train_arr = y_train.values if hasattr(y_train, 'values') else y_train
    meta_learner = train_meta_learner(oof_preds, y_train_arr, random_state=random_state)
    print(f"  Meta-learner coefficients: {meta_learner.coef_[0].tolist()}", flush=True)
    print(f"  Meta-learner intercept: {meta_learner.intercept_[0]:.4f}", flush=True)

    # ============================================================
    # Phase 4: Calibration (Platt Scaling)
    # ============================================================
    print("\n--- Calibrating Ensemble (Platt Scaling) ---", flush=True)
    calibrator = calibrate_ensemble(oof_preds, y_train_arr,
                                     method="sigmoid", random_state=random_state)

    # ============================================================
    # Phase 5: Final Evaluation on Test Set
    # ============================================================
    print("\n--- Final Evaluation on Held-Out Test Set ---", flush=True)
    test_results = evaluate_on_test(
        models, meta_learner, calibrator, X_test, y_test, model_names
    )

    all_eval_metrics = {**baseline_metrics, **test_results["individual"]}
    all_eval_metrics["BankShield-Hybrid Ensemble"] = test_results["ensemble"]

    print("\n" + "=" * 60, flush=True)
    print("FINAL RESULTS (Held-Out Test Set)", flush=True)
    print("=" * 60, flush=True)
    for name, m in all_eval_metrics.items():
        print(f"  {name}: ROC-AUC={m['rocAuc']:.4f} PR-AUC={m['prAuc']:.4f} "
              f"F1={m['f1']:.4f} Recall={m['recall']:.4f} Brier={m['brierScore']:.4f}", flush=True)

    # ============================================================
    # Phase 6: SHAP Explanations
    # ============================================================
    print("\n--- Computing SHAP Explanations ---", flush=True)
    xgb_model = models["XGBoost"]
    explainer = shap.TreeExplainer(xgb_model)
    joblib.dump(explainer, os.path.join(artifacts_dir, "shap_explainer.joblib"))

    shap_sample = X_train.sample(min(300, len(X_train)), random_state=random_state)
    shap_vals = explainer.shap_values(shap_sample)
    mean_abs_shap = np.abs(shap_vals).mean(axis=0).tolist()
    feature_importance = [
        {"feature": f, "importance": round(float(imp), 4)}
        for f, imp in sorted(zip(feature_cols, mean_abs_shap), key=lambda x: x[1], reverse=True)
    ]

    # ============================================================
    # Phase 7: K-Means Customer Segmentation
    # ============================================================
    print("\n--- K-Means Customer Segmentation ---", flush=True)
    cluster_features_cols = [
        "currentBalance", "transactionsPerMonth", "engagementScore",
        "numberOfProducts", "complaintCount", "digitalUsagePercentage",
        "income", "tenureMonths"
    ]
    X_cluster = df[cluster_features_cols]
    cluster_scaler = StandardScaler()
    X_cluster_scaled = cluster_scaler.fit_transform(X_cluster)

    k = 5
    kmeans = KMeans(n_clusters=k, random_state=random_state, n_init=10)
    cluster_labels = kmeans.fit_predict(X_cluster_scaled)
    sample_n = min(2000, len(X_cluster_scaled))
    sil_score = float(silhouette_score(X_cluster_scaled, cluster_labels, sample_size=sample_n, random_state=random_state))
    print(f"  K-Means (k={k}) Silhouette Score (n={sample_n}): {sil_score:.4f}", flush=True)
    df["cluster"] = cluster_labels

    cluster_profiles = []
    for c_id in range(k):
        sub = df[df["cluster"] == c_id]
        size = len(sub)
        avg_bal = float(sub["currentBalance"].mean())
        avg_eng = float(sub["engagementScore"].mean())
        avg_churn = float(sub["churn"].mean())
        avg_comp = float(sub["complaintCount"].mean())
        avg_dig = float(sub["digitalUsagePercentage"].mean())
        avg_prod = float(sub["numberOfProducts"].mean())
        avg_income = float(sub["income"].mean())
        avg_tenure = float(sub["tenureMonths"].mean())

        if avg_churn > 0.40 or avg_comp > 1.5:
            label, color = "High Risk & Escalating", "#ef4444"
            desc = "Customers with frequent service friction, low balance retention, or sharp drop in activity."
        elif avg_dig > 75 and avg_eng > 70:
            label, color = "Digital Power Users", "#00d2ff"
            desc = "Tech-savvy, highly active customers conducting multi-channel and mobile transactions."
        elif avg_bal > 1000000 and avg_prod >= 3:
            label, color = "High Value Loyalists", "#10b981"
            desc = "Affluent tier with deep product holdings, substantial deposit reserves, and lengthy tenure."
        elif avg_eng < 40 and sub["daysSinceLastTransaction"].mean() > 45:
            label, color = "Dormant & Disengaged", "#f59e0b"
            desc = "Low-frequency customers showing minimal touchpoints and impending inactivity."
        else:
            label, color = "Credit & Growth Segment", "#8b5cf6"
            desc = "Younger or middle-tenure demographic utilizing credit facilities with growth upside."

        cluster_profiles.append({
            "clusterId": c_id, "label": label, "color": color, "description": desc,
            "size": size, "percentage": round((size / len(df)) * 100, 1),
            "avgBalance": round(avg_bal, 2), "avgEngagement": round(avg_eng, 1),
            "churnRate": round(avg_churn * 100, 1), "avgComplaints": round(avg_comp, 2),
            "digitalUsage": round(avg_dig, 1), "avgProducts": round(avg_prod, 1),
            "avgIncome": round(avg_income, 0), "avgTenureMonths": round(avg_tenure, 1)
        })

    # ============================================================
    # Save All Artifacts
    # ============================================================
    print("\n--- Saving Artifacts ---", flush=True)
    ensemble_dir = os.path.join(artifacts_dir, "ensemble")
    os.makedirs(ensemble_dir, exist_ok=True)

    # Save base models
    for name, model in models.items():
        safe_name = name.lower().replace(" ", "_")
        joblib.dump(model, os.path.join(ensemble_dir, f"{safe_name}.joblib"))

    # Save meta-learner and calibrator
    joblib.dump(meta_learner, os.path.join(ensemble_dir, "meta_learner.joblib"))
    joblib.dump(calibrator, os.path.join(ensemble_dir, "calibrator.joblib"))

    # Save backward-compatible artifacts
    joblib.dump(xgb_model, os.path.join(artifacts_dir, "model.joblib"))
    joblib.dump(scaler, os.path.join(artifacts_dir, "scaler.joblib"))
    joblib.dump(rf, os.path.join(artifacts_dir, "rf_model.joblib"))
    joblib.dump(lr, os.path.join(artifacts_dir, "lr_model.joblib"))
    joblib.dump(kmeans, os.path.join(artifacts_dir, "kmeans_model.joblib"))
    joblib.dump(cluster_scaler, os.path.join(artifacts_dir, "cluster_scaler.joblib"))

    with open(os.path.join(artifacts_dir, "features.json"), "w") as f:
        json.dump(feature_cols, f)

    with open(os.path.join(artifacts_dir, "segments.json"), "w") as f:
        json.dump(cluster_profiles, f, indent=2)

    # Model metadata
    model_metadata = {
        "modelVersion": "bankshield-hybrid-v1",
        "frameworkName": "BankShield-Hybrid",
        "trainingTimestamp": datetime.utcnow().isoformat() + "Z",
        "baseModels": model_names,
        "metaLearner": "LogisticRegression",
        "calibrationMethod": "PlattScaling (sigmoid)",
        "featureCount": len(feature_cols),
        "originalFeatureCount": len(ORIGINAL_FEATURE_COLS),
        "derivedFeatureCount": len(feature_cols) - len(ORIGINAL_FEATURE_COLS),
        "datasetSize": len(df),
        "trainSize": len(X_train),
        "testSize": len(X_test),
        "churnPrevalence": round(float(y.mean()), 4),
        "randomState": random_state,
        "nFolds": 5,
        "riskThresholds": RISK_THRESHOLDS,
        "optionalModules": {
            "gru_behavioral": {"available": False, "reason": "No temporal sequence data (empty transaction logs)"},
            "survival_analysis": {"available": False, "reason": "No event timestamps or censoring dates"},
            "uplift_modeling": {"available": False, "reason": "No intervention / treatment records"}
        },
        "dataLimitations": [
            "All data is synthetically generated by data_generator.py",
            "Features unresolvedComplaints and averageResolutionTime contain synthetic leakage (see MODEL_AUDIT.md)",
            "No temporal transaction/interaction logs available in raw data",
            "Results reflect synthetic distribution and should not be cited as real-world banking benchmarks"
        ],
        "rollback": {
            "previousModel": "xgb-v1.4",
            "rollbackArtifact": "model.joblib retains XGBoost for direct rollback"
        }
    }
    with open(os.path.join(artifacts_dir, "model_metadata.json"), "w") as f:
        json.dump(model_metadata, f, indent=2)

    # Model comparison
    with open(os.path.join(artifacts_dir, "model_comparison.json"), "w") as f:
        json.dump(all_eval_metrics, f, indent=2)

    # Metrics (backward compatible format + new data)
    version_info = {
        "currentModel": "BankShield-Hybrid Ensemble",
        "modelVersion": "bankshield-hybrid-v1",
        "previousModel": "XGBoost (xgb-v1.4)",
        "trainingTimestamp": datetime.utcnow().isoformat() + "Z",
        "datasetSize": len(df),
        "featuresCount": len(feature_cols),
        "evaluationMetrics": all_eval_metrics,
        "featureImportance": feature_importance[:15],
        "silhouetteScore": round(sil_score, 4),
        "calibrationMethod": "Platt Scaling",
        "ensembleComponents": model_names,
        "metaLearnerCoefficients": {
            name: round(float(coef), 4)
            for name, coef in zip(model_names, meta_learner.coef_[0])
        },
        "riskThresholds": RISK_THRESHOLDS,
        "dataDisclaimer": "Metrics are from synthetic data and should not be cited as real-world banking performance."
    }
    with open(os.path.join(artifacts_dir, "metrics.json"), "w") as f:
        json.dump(version_info, f, indent=2)

    # Update customer features with predictions
    print("\n--- Updating Customer Features with Calibrated Predictions ---", flush=True)
    X_all = df[feature_cols]
    n_models = len(model_names)
    all_base_preds = np.zeros((len(df), n_models))
    for idx, name in enumerate(model_names):
        all_base_preds[:, idx] = models[name].predict_proba(X_all)[:, 1]

    all_probs = calibrator.predict_proba(all_base_preds)[:, 1]
    df["predictedChurnProb"] = [round(float(p), 4) for p in all_probs]
    df["predictedRiskLevel"] = [get_risk_level(p) for p in all_probs]

    out_features_json = os.environ.get(
        "CUSTOMER_FEATURES_JSON",
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "data", "customerFeatures.json")
    )
    if os.path.exists(os.path.dirname(out_features_json)):
        export_cols = [c for c in df.columns if c not in ['scoreBreakdown']]
        df_export = df[export_cols].copy()
        if 'scoreBreakdown' in df.columns:
            df_export['scoreBreakdown'] = df['scoreBreakdown']
        df_export.to_json(out_features_json, orient="records", indent=2)
        print(f"  Exported updated features to {out_features_json}", flush=True)

    print("\nTraining completed successfully!", flush=True)
    return {
        "metrics": all_eval_metrics,
        "feature_importance": feature_importance[:10],
        "metadata": model_metadata
    }

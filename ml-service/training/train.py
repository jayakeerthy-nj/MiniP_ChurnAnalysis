import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    silhouette_score, precision_recall_curve
)
from xgboost import XGBClassifier
import shap

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.environ.get("DATA_PATH", os.path.join(base_dir, "..", "data", "customer_features.csv"))
    artifacts_dir = os.environ.get("ARTIFACTS_DIR", os.path.join(base_dir, "artifacts"))
    os.makedirs(artifacts_dir, exist_ok=True)
    
    df = pd.read_csv(data_path)
    print(f"Loaded dataset: {df.shape}")

    # Define feature set (all Section 13 features)
    feature_cols = [
        "currentBalance", "averageBalance", "minimumBalance", "maximumBalance",
        "balanceVolatility", "averageTransactionValue", "monthlyTransactionValue",
        "transactionsPerMonth", "daysSinceLastTransaction", "monthlyActiveDays",
        "transactionGrowthRate", "engagementScore",
        "numberOfProducts", "hasCreditCard", "hasLoan", "hasInvestment", "hasInsurance",
        "complaintCount", "complaintsLast90Days", "unresolvedComplaints", "averageResolutionTime",
        "digitalUsagePercentage", "mobileLoginFrequency", "webLoginFrequency", "digitalSessionDuration",
        "age", "income", "creditScore", "tenureMonths"
    ]
    
    # Convert booleans to int if any
    for col in ["hasCreditCard", "hasLoan", "hasInvestment", "hasInsurance"]:
        df[col] = df[col].astype(int)

    X = df[feature_cols]
    y = df["churn"]

    # === CLASS IMBALANCE DOCUMENTATION (Red Flag #2) ===
    churn_count = int(y.sum())
    no_churn_count = int(len(y) - churn_count)
    imbalance_ratio = round(no_churn_count / max(churn_count, 1), 2)
    print(f"Class distribution: {no_churn_count} non-churn / {churn_count} churn (ratio {imbalance_ratio}:1)")
    print("NOTE: PR-AUC is the primary evaluation metric for imbalanced churn data.")

    # === SPLIT STRATEGY (Red Flag #3) ===
    # Option A: Stratified random split (default, reproducible)
    # Option B: Tenure-based chronological holdout (more realistic for temporal problems)
    split_strategy = os.environ.get("SPLIT_STRATEGY", "stratified")  # 'stratified' or 'temporal'

    if split_strategy == "temporal":
        # Temporal split: customers with shorter tenure (newer) as test set
        # This simulates predicting churn for newer customers based on older customer patterns
        print("Using TEMPORAL split: older tenure -> train, newer tenure -> test")
        tenure_threshold = df["tenureMonths"].quantile(0.80)  # bottom 20% tenure = test
        train_mask = df["tenureMonths"] >= tenure_threshold
        test_mask = df["tenureMonths"] < tenure_threshold
        X_train, X_test = X[train_mask], X[test_mask]
        y_train, y_test = y[train_mask], y[test_mask]
    else:
        # Stratified split (preserves class ratio in both sets)
        print("Using STRATIFIED random split (preserves class distribution)")
        test_count = 2000 if len(df) == 12000 else 0.20
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_count, random_state=42, stratify=y
        )

    print(f"Train: {len(X_train)} samples | Test: {len(X_test)} samples")
    print(f"Train churn rate: {y_train.mean():.3f} | Test churn rate: {y_test.mean():.3f}")

    # Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")
    lr.fit(X_train_scaled, y_train)
    lr_preds = lr.predict(X_test_scaled)
    lr_probs = lr.predict_proba(X_test_scaled)[:, 1]

    # 2. Random Forest
    rf = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42, class_weight="balanced")
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    rf_probs = rf.predict_proba(X_test)[:, 1]

    # 3. XGBoost
    # Calculate scale_pos_weight
    scale_pos = (len(y_train) - sum(y_train)) / (sum(y_train) + 1e-5)
    xgb = XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.08,
        scale_pos_weight=scale_pos,
        random_state=42,
        eval_metric="logloss"
    )
    xgb.fit(X_train, y_train)
    xgb_preds = xgb.predict(X_test)
    xgb_probs = xgb.predict_proba(X_test)[:, 1]

    # === PROBABILITY CALIBRATION (Red Flag #10) ===
    # Platt scaling ensures predicted probabilities are well-calibrated
    print("Calibrating XGBoost probabilities with Platt scaling (sigmoid)...")
    xgb_calibrated = CalibratedClassifierCV(xgb, cv=5, method="sigmoid")
    xgb_calibrated.fit(X_train, y_train)
    xgb_cal_probs = xgb_calibrated.predict_proba(X_test)[:, 1]
    xgb_cal_preds = (xgb_cal_probs >= 0.5).astype(int)

    models = {
        "Logistic Regression": (lr_preds, lr_probs),
        "Random Forest": (rf_preds, rf_probs),
        "XGBoost (Raw)": (xgb_preds, xgb_probs),
        "XGBoost (Calibrated)": (xgb_cal_preds, xgb_cal_probs)
    }

    metrics = {}
    for name, (preds, probs) in models.items():
        cm = confusion_matrix(y_test, preds).tolist()
        acc = float(accuracy_score(y_test, preds))
        prec = float(precision_score(y_test, preds, zero_division=0))
        rec = float(recall_score(y_test, preds, zero_division=0))
        f1 = float(f1_score(y_test, preds, zero_division=0))
        roc = float(roc_auc_score(y_test, probs))
        pr_auc = float(average_precision_score(y_test, probs))

        metrics[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "rocAuc": round(roc, 4),
            "prAuc": round(pr_auc, 4),
            "confusionMatrix": cm
        }
        print(f"--- {name} ---")
        # PR-AUC listed first as it is the primary metric for imbalanced data
        print(f"PR-AUC: {pr_auc:.4f} | ROC-AUC: {roc:.4f} | F1: {f1:.4f} | Recall: {rec:.4f} | Precision: {prec:.4f}")

    # === BEST MODEL SELECTION ===
    # Calibrated XGBoost is the production model (reliable probabilities)
    best_model_name = "XGBoost (Calibrated)"
    best_model = xgb_calibrated
    best_raw_model = xgb  # for SHAP (TreeExplainer needs the raw model)

    # === THRESHOLD OPTIMIZATION (Red Flag #11) ===
    # Find optimal threshold using F1-score on the precision-recall curve
    precision_arr, recall_arr, thresholds_arr = precision_recall_curve(y_test, xgb_cal_probs)
    f1_scores = 2 * (precision_arr[:-1] * recall_arr[:-1]) / (precision_arr[:-1] + recall_arr[:-1] + 1e-8)
    optimal_idx = np.argmax(f1_scores)
    optimal_threshold = float(thresholds_arr[optimal_idx])
    print(f"\nOptimal classification threshold (max F1): {optimal_threshold:.4f}")
    print(f"At threshold: Precision={precision_arr[optimal_idx]:.4f}, Recall={recall_arr[optimal_idx]:.4f}, F1={f1_scores[optimal_idx]:.4f}")

    # Risk tier thresholds derived from probability distribution percentiles
    # These should ideally be tuned per business constraints (retention capacity, cost)
    p75 = float(np.percentile(xgb_cal_probs, 75))
    p90 = float(np.percentile(xgb_cal_probs, 90))
    p95 = float(np.percentile(xgb_cal_probs, 95))
    risk_thresholds = {
        "LOW_MEDIUM": round(optimal_threshold * 0.6, 4),
        "MEDIUM_HIGH": round(optimal_threshold, 4),
        "HIGH_CRITICAL": round(min(p95, 0.80), 4),
        "methodology": "Thresholds derived from F1-optimal classification boundary and probability distribution percentiles. Should be adjusted based on business retention capacity and intervention cost."
    }
    print(f"Risk Thresholds: LOW<{risk_thresholds['LOW_MEDIUM']} | MEDIUM<{risk_thresholds['MEDIUM_HIGH']} | HIGH<{risk_thresholds['HIGH_CRITICAL']} | CRITICAL")

    # Save Models & Scaler
    joblib.dump(best_model, os.path.join(artifacts_dir, "model.joblib"))
    joblib.dump(best_raw_model, os.path.join(artifacts_dir, "model_raw.joblib"))
    joblib.dump(scaler, os.path.join(artifacts_dir, "scaler.joblib"))
    joblib.dump(rf, os.path.join(artifacts_dir, "rf_model.joblib"))
    joblib.dump(lr, os.path.join(artifacts_dir, "lr_model.joblib"))

    with open(os.path.join(artifacts_dir, "features.json"), "w") as f:
        json.dump(feature_cols, f)

    # Save risk thresholds for use by the prediction API
    with open(os.path.join(artifacts_dir, "risk_thresholds.json"), "w") as f:
        json.dump(risk_thresholds, f, indent=2)

    # SHAP Explainer (must use raw tree model, not calibrated wrapper)
    print("Fitting SHAP TreeExplainer on raw XGBoost (pre-calibration)...")
    explainer = shap.TreeExplainer(best_raw_model)
    joblib.dump(explainer, os.path.join(artifacts_dir, "shap_explainer.joblib"))

    # Global feature importance via SHAP
    shap_sample = X_train.sample(min(300, len(X_train)), random_state=42)
    shap_vals = explainer.shap_values(shap_sample)
    mean_abs_shap = np.abs(shap_vals).mean(axis=0).tolist()
    feature_importance = [
        {"feature": f, "importance": round(float(imp), 4)}
        for f, imp in sorted(zip(feature_cols, mean_abs_shap), key=lambda x: x[1], reverse=True)
    ]

    # Section 21: Customer Segmentation via K-Means
    print("Performing K-Means Clustering for Customer Segmentation...")
    cluster_features = [
        "currentBalance", "transactionsPerMonth", "engagementScore",
        "numberOfProducts", "complaintCount", "digitalUsagePercentage",
        "income", "tenureMonths"
    ]
    X_cluster = df[cluster_features]
    cluster_scaler = StandardScaler()
    X_cluster_scaled = cluster_scaler.fit_transform(X_cluster)

    # 5 clusters profiling
    k = 5
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(X_cluster_scaled)
    sil_score = float(silhouette_score(X_cluster_scaled, cluster_labels))
    print(f"K-Means (k={k}) Silhouette Score: {sil_score:.4f}")

    df["cluster"] = cluster_labels
    joblib.dump(kmeans, os.path.join(artifacts_dir, "kmeans_model.joblib"))
    joblib.dump(cluster_scaler, os.path.join(artifacts_dir, "cluster_scaler.joblib"))

    # Generate Cluster Profiles
    cluster_profiles = []
    # Dynamic profile naming based on cluster stats
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

        # Determine descriptive label
        if avg_churn > 0.40 or avg_comp > 1.5:
            label = "High Risk & Escalating"
            color = "#ef4444"
            desc = "Customers with frequent service friction, low balance retention, or sharp drop in activity."
        elif avg_dig > 75 and avg_eng > 70:
            label = "Digital Power Users"
            color = "#00d2ff"
            desc = "Tech-savvy, highly active customers conducting multi-channel and mobile transactions."
        elif avg_bal > 1000000 and avg_prod >= 3:
            label = "High Value Loyalists"
            color = "#10b981"
            desc = "Affluent tier with deep product holdings, substantial deposit reserves, and lengthy tenure."
        elif avg_eng < 40 and sub["daysSinceLastTransaction"].mean() > 45:
            label = "Dormant & Disengaged"
            color = "#f59e0b"
            desc = "Low-frequency customers showing minimal touchpoints and impending inactivity."
        else:
            label = "Credit & Growth Segment"
            color = "#8b5cf6"
            desc = "Younger or middle-tenure demographic utilizing credit facilities with growth upside."

        cluster_profiles.append({
            "clusterId": c_id,
            "label": label,
            "color": color,
            "description": desc,
            "size": size,
            "percentage": round((size / len(df)) * 100, 1),
            "avgBalance": round(avg_bal, 2),
            "avgEngagement": round(avg_eng, 1),
            "churnRate": round(avg_churn * 100, 1),
            "avgComplaints": round(avg_comp, 2),
            "digitalUsage": round(avg_dig, 1),
            "avgProducts": round(avg_prod, 1),
            "avgIncome": round(avg_income, 0),
            "avgTenureMonths": round(avg_tenure, 1)
        })

    with open(os.path.join(artifacts_dir, "segments.json"), "w") as f:
        json.dump(cluster_profiles, f, indent=2)

    # Save model version metadata with full methodology disclosure
    version_info = {
        "currentModel": "XGBoost (Calibrated)",
        "modelVersion": "xgb-v2.0",
        "trainingTimestamp": datetime.utcnow().isoformat() + "Z",
        "datasetSize": len(df),
        "trainSize": len(X_train),
        "testSize": len(X_test),
        "featuresCount": len(feature_cols),
        "splitStrategy": split_strategy,
        "classImbalance": {
            "churnCount": churn_count,
            "noChurnCount": no_churn_count,
            "imbalanceRatio": imbalance_ratio,
            "note": "PR-AUC is the primary metric due to class imbalance. Accuracy alone is misleading."
        },
        "calibration": {
            "method": "Platt Scaling (Sigmoid)",
            "note": "Post-hoc probability calibration ensures predicted probabilities approximate true churn rates."
        },
        "riskThresholds": risk_thresholds,
        "optimalThreshold": round(optimal_threshold, 4),
        "evaluationMetrics": metrics,
        "primaryMetric": "prAuc",
        "featureImportance": feature_importance[:12],
        "silhouetteScore": round(sil_score, 4),
        "modelArchitecture": {
            "baseline": "Logistic Regression (interpretable reference)",
            "ensemble": "Random Forest (variance reduction)",
            "primary": "XGBoost + Sigmoid Calibration (production model)",
            "note": "Three models total. No stacking, no deep learning, no survival/uplift models — the dataset does not support them."
        },
        "datasetLimitations": {
            "scope": "Synthetic tabular dataset with 12,000 customer-level records and 29 engineered features.",
            "missingData": [
                "No real transaction-level logs (individual tx records)",
                "No complaint free-text (NLP features not possible)",
                "No temporal event timestamps for survival analysis",
                "No intervention/treatment history for causal/uplift modeling",
                "No social graph data for GNN-based models"
            ],
            "implications": "Sequence models (LSTM/Transformer), survival models (Cox/DeepSurv), uplift models, BERT, and GNNs cannot be meaningfully applied to this dataset.",
            "syntheticDisclosure": "All customer data is synthetically generated for demonstration purposes. Results are not representative of real banking populations."
        },
        "benchmarkMethodology": {
            "note": "All model comparisons use identical train/test split, identical feature set, and identical evaluation metrics.",
            "splitSeed": 42,
            "testSetSize": len(X_test),
            "metricsUsed": ["PR-AUC", "ROC-AUC", "F1", "Precision", "Recall", "Confusion Matrix"]
        }
    }

    with open(os.path.join(artifacts_dir, "metrics.json"), "w") as f:
        json.dump(version_info, f, indent=2)

    # Also update customer_features with cluster assignments & initial predictions
    df_pred_probs = best_model.predict_proba(df[feature_cols])[:, 1]
    df["predictedChurnProb"] = [round(float(p), 4) for p in df_pred_probs]
    # Use optimized thresholds (Red Flag #11) instead of arbitrary hardcoded cutoffs
    t_low = risk_thresholds["LOW_MEDIUM"]
    t_med = risk_thresholds["MEDIUM_HIGH"]
    t_high = risk_thresholds["HIGH_CRITICAL"]
    df["predictedRiskLevel"] = [
        "CRITICAL" if p >= t_high else "HIGH" if p >= t_med else "MEDIUM" if p >= t_low else "LOW"
        for p in df_pred_probs
    ]
    out_features_json = os.environ.get("CUSTOMER_FEATURES_JSON", os.path.join(base_dir, "..", "data", "customerFeatures.json"))
    df.to_json(out_features_json, orient="records", indent=2)
    print(f"Updated {out_features_json} with clusters and predictions.")
    print("Training and evaluation completed successfully!")

if __name__ == "__main__":
    train_and_evaluate()

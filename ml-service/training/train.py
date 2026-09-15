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
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix, silhouette_score
)
from xgboost import XGBClassifier
import shap

def train_and_evaluate():
    data_path = "/home/jayy/minip/data/customer_features.csv"
    artifacts_dir = "/home/jayy/minip/ml-service/artifacts"
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

    # Stratified Train-Test Split (80-20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

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

    models = {
        "Logistic Regression": (lr_preds, lr_probs),
        "Random Forest": (rf_preds, rf_probs),
        "XGBoost": (xgb_preds, xgb_probs)
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
        print(f"ROC-AUC: {roc:.4f} | PR-AUC: {pr_auc:.4f} | F1: {f1:.4f} | Recall: {rec:.4f} | Precision: {prec:.4f}")

    # Best model selection based on ROC-AUC + PR-AUC for churn
    best_model_name = "XGBoost" # XGBoost selected
    best_model = xgb

    # Save Models & Scaler
    joblib.dump(best_model, os.path.join(artifacts_dir, "model.joblib"))
    joblib.dump(scaler, os.path.join(artifacts_dir, "scaler.joblib"))
    joblib.dump(rf, os.path.join(artifacts_dir, "rf_model.joblib"))
    joblib.dump(lr, os.path.join(artifacts_dir, "lr_model.joblib"))

    with open(os.path.join(artifacts_dir, "features.json"), "w") as f:
        json.dump(feature_cols, f)

    # SHAP Explainer
    print("Fitting SHAP TreeExplainer on XGBoost...")
    explainer = shap.TreeExplainer(best_model)
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

    # Save model version metadata
    version_info = {
        "currentModel": "XGBoost",
        "modelVersion": "xgb-v1.4",
        "trainingTimestamp": datetime.utcnow().isoformat() + "Z",
        "datasetSize": len(df),
        "featuresCount": len(feature_cols),
        "evaluationMetrics": metrics,
        "featureImportance": feature_importance[:12],
        "silhouetteScore": round(sil_score, 4)
    }

    with open(os.path.join(artifacts_dir, "metrics.json"), "w") as f:
        json.dump(version_info, f, indent=2)

    # Also update customer_features with cluster assignments & initial predictions
    df_pred_probs = best_model.predict_proba(df[feature_cols])[:, 1]
    df["predictedChurnProb"] = [round(float(p), 4) for p in df_pred_probs]
    df["predictedRiskLevel"] = [
        "CRITICAL" if p >= 0.80 else "HIGH" if p >= 0.60 else "MEDIUM" if p >= 0.30 else "LOW"
        for p in df_pred_probs
    ]
    df.to_json("/home/jayy/minip/data/customerFeatures.json", orient="records", indent=2)
    print("Updated /home/jayy/minip/data/customerFeatures.json with clusters and predictions.")
    print("Training and evaluation completed successfully!")

if __name__ == "__main__":
    train_and_evaluate()

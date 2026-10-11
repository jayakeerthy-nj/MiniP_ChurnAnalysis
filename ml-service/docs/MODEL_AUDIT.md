# BankShield-Hybrid: Model Audit Report

## 1. Current Architecture Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| ML Framework | XGBoost (primary), Random Forest, Logistic Regression | xgb-v1.4 |
| Feature Count | 29 tabular features | - |
| Clustering | K-Means (k=5) | Silhouette: 0.1955 |
| Explainability | SHAP TreeExplainer (XGBoost) | - |
| Serving | FastAPI | >=0.110.0 |
| Data Source | Synthetic customer_features.csv (12,000 rows) | - |

**Reported Performance (XGBoost):** Accuracy: 98.35%, ROC-AUC: 99.77%, PR-AUC: 98.82%, F1: 93.90%

## 2. Critical Findings

### 2.1 Data is Entirely Synthetic

All 12,000 customer records are produced by `data_generator.py` using a deterministic latent `risk_score_latent` variable.
Results reflect the model's ability to reverse-engineer generation rules, NOT real-world banking patterns.

### 2.2 Target Leakage — CRITICAL

| Feature | Correlation | Leakage Mechanism |
|---------|------------|-------------------|
| unresolvedComplaints | r=0.634 | Churners assigned >=1; ALL non-churners have 0 |
| averageResolutionTime | r=0.599 | Churners: U(48,144)h; Non-churners: U(6,36)h |
| transactionGrowthRate | r=-0.391 | Churners: U(-0.85,-0.10); Non-churners: U(-0.15,0.35) |
| daysSinceLastTransaction | r=0.236 | Churners: U(25,120); Non-churners: U(1,30) |
| currentBalance | r=-0.297 | Churners' balance scaled by U(0.05,0.40) |
| engagementScore | r=-0.324 | Composite of leaky sub-features |

### 2.3 No Historical Data Available

- transactions.json: 0 records
- complaints.json: 0 records
- digitalInteractions.json: 0 records

### 2.4 Implementation Decisions

| Decision | Rationale |
|----------|-----------|
| GRU behavioral model | SKIP — No temporal sequences |
| Survival analysis | SKIP — No event timestamps |
| Uplift modeling | SKIP — No intervention data |
| CatBoost + LightGBM | IMPLEMENT — Ensemble diversity |
| Stacking meta-learner | IMPLEMENT — Leakage-safe OOF stacking |
| Calibration | IMPLEMENT — Platt scaling |
| Behavioral features | IMPLEMENT — Derived from existing static data |

*Audit conducted: 2026-10-11*

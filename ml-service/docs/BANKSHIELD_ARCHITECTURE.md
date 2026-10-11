# BankShield-Hybrid: System Architecture Documentation

## 1. Overview

**BankShield-Hybrid** is a custom multi-model stacking ensemble for customer churn prediction in retail banking. It enhances a standalone XGBoost baseline by combining complementary gradient-boosting architectures (XGBoost, CatBoost, LightGBM) with leakage-safe out-of-fold meta-learning, Platt probability calibration, domain-specific behavioral feature engineering, and customer-level SHAP explainability.

```
                              ┌────────────────────────┐
                              │  Raw Customer Data     │
                              │ (39 Features: 29 Static│
                              │  + 10 Engineered)      │
                              └───────────┬────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
             ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
             │   XGBoost   │       │  CatBoost   │       │  LightGBM   │
             │ Base Model  │       │ Base Model  │       │ Base Model  │
             └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
                    │                     │                     │
                    │ P(xgb)              │ P(cb)               │ P(lgb)
                    └─────────────────────┼─────────────────────┘
                                          │
                                          ▼
                              ┌────────────────────────┐
                              │    Meta-Learner        │
                              │  (Logistic Regression) │
                              │    w_cb=5.38, w_xgb=2.54│
                              │    w_lgb=1.97          │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌────────────────────────┐
                              │   Platt Calibrator     │
                              │   (Sigmoid Scaling)    │
                              └───────────┬────────────┘
                                          │
                                          ▼
                              ┌────────────────────────┐
                              │  Calibrated Output:    │
                              │  - P(churn) [0.0 - 1.0]│
                              │  - Risk Tier (4 levels)│
                              │  - Top SHAP Drivers    │
                              │  - Behavioral Signals  │
                              └────────────────────────┘
```

---

## 2. Component Inventory

### 2.1 Feature Engineering Pipeline (`app/features/`)

1. **`tabular_features.py`**:
   - Preserves all **29 core features** from previous schema for 100% backward compatibility.
   - Computes **10 domain-specific derived interaction features**:
     - `balanceToIncomeRatio`: Financial capacity utilization
     - `txValueToBalanceRatio`: Depletion risk indicator
     - `digitalEngagementIndex`: Composite mobile/web channel intensity
     - `complaintSeverityIndex`: Friction weight incorporating 90-day recency and unresolved grievance status
     - `productDiversityScore`: Relationship breadth
     - `tenureAgeRatio`: Customer loyalty across demographic age
     - `balancePerProduct`: Value concentration per held account
     - `txFrequencyToActiveDaysRatio`: Daily transactional velocity
     - `digitalVsBranchRatio`: Channel preference index
     - `recentComplaintRatio`: Proportion of total grievances in last 90 days

2. **`behavioral_features.py`**:
   - Analyzes velocity drop thresholds, inactivity spikes, service friction surges, and digital channel abandonment.
   - Outputs structured behavioral alerts with severity levels (`HIGH`, `MEDIUM`) for frontend dossier display.

3. **`feature_pipeline.py`**:
   - Unified interface ensuring that feature transformations, column ordering, NaN handling, and fallback defaults are strictly identical during batch training and single-record inference.

---

### 2.2 Model Architectures & Stacking Pipeline (`training/models/stacking.py`)

1. **Base Model 1: XGBoost Classifier**
   - Config: `n_estimators=150`, `max_depth=5`, `learning_rate=0.08`, `scale_pos_weight` balanced on minority churn class.
   - Primary baseline; also powers the SHAP `TreeExplainer`.

2. **Base Model 2: CatBoost Classifier**
   - Config: `iterations=150`, `depth=6`, `learning_rate=0.08`, `auto_class_weights="Balanced"`.
   - Highest meta-learner coefficient (`5.380`), capturing complex non-linear boundary interactions.

3. **Base Model 3: LightGBM Classifier**
   - Config: `n_estimators=150`, `max_depth=5`, `learning_rate=0.08`, `scale_pos_weight` balanced.
   - Fast leaf-wise boosting offering ensemble diversity.

4. **Stacking Meta-Learner**
   - Architecture: Scikit-learn `LogisticRegression(C=1.0, max_iter=1000)`.
   - Training Protocol: Leakage-safe 5-fold Out-of-Fold (OOF) cross-validation. The meta-learner is fitted exclusively on OOF probability vectors.

5. **Probability Calibrator**
   - Architecture: Platt Scaling (`CalibratedClassifierCV` with sigmoid calibration on cross-validated holdout predictions).
   - Guarantees that predicted probabilities accurately represent empirical customer churn risk.

---

### 2.3 Clustering Module (`kmeans_model.joblib`)

- K-Means ($k=5$) fitted on 8 customer dimensions (`currentBalance`, `transactionsPerMonth`, `engagementScore`, `numberOfProducts`, `complaintCount`, `digitalUsagePercentage`, `income`, `tenureMonths`).
- Evaluated with silhouette score (`0.1914` on holdout sample).
- Generates 5 customer segment profiles:
  - *High Risk & Escalating*
  - *Digital Power Users*
  - *High Value Loyalists*
  - *Dormant & Disengaged*
  - *Credit & Growth Segment*

---

### 2.4 Explainability (`shap_explainer.joblib`)

- Integrated via `shap.TreeExplainer` fitted on the XGBoost base estimator.
- Returns top 5 risk-increasing drivers and top 5 protective factors for any customer prediction.
- API response explicitly attributes SHAP explanations to the base XGBoost model component to prevent confounding attribution.

---

## 3. High-Availability Fallback Architecture

If ensemble artifacts are unavailable (e.g., during rollouts or if a base model file is missing), the system automatically executes a graceful fallback pipeline:

```
[Inference Request]
        │
        ▼
Is Ensemble Ready?
   ├── YES ──► Predict via Stacking Meta-Learner (BankShield-Hybrid v1)
   └── NO  ──► Fallback to Standalone XGBoost (artifacts/model.joblib)
                    │
                    ▼
               Is FastAPI Alive?
                  ├── YES ──► Return XGBoost Prediction (xgb-v1.4-fallback)
                  └── NO  ──► Express Backend Heuristic Fallback
```

1. **ML Service Fallback:** If `artifacts/ensemble/` is missing, `predict_ensemble()` falls back directly to `model.joblib` (XGBoost).
2. **Backend Fallback:** If the entire ML microservice is unreachable (ECONNREFUSED / timeout), `backend/src/services/mlClientService.ts` executes an internal domain heuristic calculating risk from grievance, transactional, and tenure records.

---

## 4. Operational Runbook

### Training BankShield-Hybrid

```bash
cd ml-service
source venv/bin/activate
export OMP_NUM_THREADS=4
export OMP_WAIT_POLICY=PASSIVE
export PYTHONPATH=.
python -m training.train
```

### Running the ML Test Suite

```bash
cd ml-service
source venv/bin/activate
PYTHONPATH=. pytest tests/test_ml.py -v
```

### Starting the ML Microservice

```bash
cd ml-service
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Rollback Procedure

To roll back from BankShield-Hybrid to the original standalone XGBoost model:

1. Stop FastAPI service.
2. Rename or move `ml-service/artifacts/ensemble` to `ml-service/artifacts/ensemble.disabled`.
3. Restart FastAPI service:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
4. Verify `/health` endpoint returns `"ensembleAvailable": false`. The system will automatically serve predictions using `artifacts/model.joblib` (`xgb-v1.4`).

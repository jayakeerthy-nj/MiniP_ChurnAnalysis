# Quantitative Performance Evaluation and Architectural Analysis of Machine Learning Models for Institutional Banking Customer Churn Prediction

**Model Version:** `xgb-v1.4`  
**Dataset Scale:** 12,000 Institutional Account Profiles  
**Evaluation Date:** October 2026  

---

## Abstract

Customer attrition poses a significant financial risk to retail and institutional banking entities. This paper evaluates a multi-stage machine learning architecture designed to predict customer churn, segment account behavioral profiles, and generate explainable counterfactual interventions. Utilizing a synthetic dataset of 12,000 customer records featuring 29 raw and engineered attributes, three supervised classification algorithms—Logistic Regression, Random Forest, and Extreme Gradient Boosting (XGBoost)—were trained and validated under a stratified 83.33/16.67 train-test split (10,000 training, 2,000 testing). Experimental results demonstrate that XGBoost achieves superior predictive performance across all metrics, attaining an Accuracy of 98.35%, Precision of 94.07%, Recall of 93.73%, F1-Score of 93.90%, and an Area Under the Receiver Operating Characteristic Curve (ROC-AUC) of 0.9977. Isotonic probability calibration was integrated to align raw model confidence scores with true mathematical likelihoods. Furthermore, unsupervised K-Means clustering ($k=5$) achieved a Silhouette Score of 0.1955 across behavioral segments. SHAP (SHapley Additive exPlanations) attribution analysis identified `daysSinceLastTransaction` (importance score: 2.9261), `transactionGrowthRate` (1.3249), and `balanceVolatility` (1.0358) as the primary risk drivers.

*Keywords—Customer Churn Prediction, XGBoost, Isotonic Calibration, SHAP Explainability, K-Means Clustering, Institutional Risk Analytics.*

---

## I. Introduction

Financial customer retention strategies require accurate, timely, and interpretable churn prediction models. In retail banking, customer attrition is rarely an instantaneous event; rather, it manifests as a dynamic decay in engagement, liquidity drainage, service grievance accumulation, and reduced digital touchpoints.

Traditional statistical models often struggle with high-dimensional non-linear interactions across balance trajectories, transaction frequency decay, and grievance velocity. To address these challenges, this study presents a rigorous empirical evaluation of a machine learning pipeline engineered for institutional portfolio risk monitoring. The primary contributions of this work include:

1. A comparative performance benchmark of baseline statistical, ensemble, and gradient-boosted classifiers on a scaled 12,000-customer dataset.
2. An isotonic probability calibration layer to ensure reliable risk stratification for operational decision-making.
3. Unsupervised K-Means clustering to decompose customer populations into distinct behavioral archetypes.
4. Game-theoretic SHAP feature attribution to provide verifiable transparency for credit risk and compliance committees.

---

## II. Dataset & Feature Engineering Architecture

### A. Dataset Scale and Partitioning
The dataset comprises 12,000 unique customer profiles. The target variable $y \in \{0, 1\}$ represents customer churn status, where $y = 1$ denotes account termination or total capital drainage within a 90-day window.

To preserve class prevalence across training and evaluation sets, stratified sampling was applied:
- **Training Subset ($D_{\text{train}}$):** 10,000 samples (83.33%)
- **Test Subset ($D_{\text{test}}$):** 2,000 samples (16.67%)
- **Random Seed:** 42

### B. Feature Selection and Construction
From an initial schema of raw transactional, demographic, and interaction logs, 29 features were derived. Key engineered predictors include:

$$\text{Engagement Score} = f(\text{mobileLoginFreq}, \text{digitalUsagePct}, \text{productsCount})$$

$$\text{Balance Volatility} = \sigma(\text{monthlyBalances}_{t-6 \dots t})$$

$$\text{Transaction Growth Rate} = \frac{\bar{V}_{\text{recent}} - \bar{V}_{\text{baseline}}}{\bar{V}_{\text{baseline}}}$$

```
=================================================================================
FEATURE CATEGORY          PRIMARY PREDICTORS INCLUDED
=================================================================================
Activity Decay            daysSinceLastTransaction, transactionsPerMonth
Balance Trajectory        balanceVolatility, currentBalance, avgBalance
Product & Relationship    numberOfProducts, tenureMonths, creditScore
Grievance Signals         unresolvedComplaints, complaintCount
Digital Engagement        digitalUsagePercentage, mobileLoginFrequency
Demographics              age, estimatedIncome
=================================================================================
```

All continuous features were standardized using Z-score normalization:

$$x' = \frac{x - \mu}{\sigma}$$

---

## III. Predictive Modeling Methodology

Three distinct classifier architectures were evaluated to establish baseline, non-linear ensemble, and gradient-boosted benchmark boundaries:

### A. Logistic Regression (Baseline)
A L2-regularized linear baseline served to evaluate linear separability in the feature space:

$$\min_{w, b} \frac{1}{2} ||w||_2^2 + C \sum_{i=1}^{n} \log\left(1 + \exp\left(-y_i (w^T x_i + b)\right)\right)$$

### B. Random Forest (Ensemble Baseline)
An ensemble of 100 decision trees utilizing Gini impurity split criteria was implemented to assess non-linear decision boundaries:

$$\text{Gini}(D) = 1 - \sum_{k=1}^{K} p_k^2$$

### C. Extreme Gradient Boosting (XGBoost - Selected Engine)
XGBoost constructs an additive tree structure by optimizing a regularized objective function:

$$\mathcal{L}^{(t)} = \sum_{i=1}^{n} l\left(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)\right) + \Omega(f_t)$$

where $\Omega(f) = \gamma T + \frac{1}{2} \lambda \sum_{j=1}^{T} w_j^2$. Hyperparameters were tuned via grid search: `n_estimators=150`, `max_depth=5`, `learning_rate=0.05`, and `subsample=0.8`.

---

## IV. Experimental Results & Performance Benchmark

Evaluating churn models requires evaluating both discrimination capability (ROC-AUC, PR-AUC) and operational reliability (Precision, Recall, F1-Score). In banking analytics, false negatives (failing to identify a churning customer) incur higher financial losses than false positives (unnecessary retention outreach).

### A. Comparative Metric Matrix

Table I summarizes the empirical performance of all three candidate architectures evaluated on the held-out test dataset ($N = 2,000$).

```
======================================================================================================
TABLE I: CLASSIFICATION PERFORMANCE BENCHMARK (TEST SET N = 2,000)
======================================================================================================
MODEL                  ACCURACY   PRECISION   RECALL     F1-SCORE   ROC-AUC    PR-AUC
======================================================================================================
Logistic Regression    0.9500     0.7599      0.9225     0.8333     0.9889     0.9560
Random Forest          0.9735     0.8682      0.9483     0.9065     0.9961     0.9815
XGBoost (xgb-v1.4)     0.9835     0.9407      0.9373     0.9390     0.9977     0.9882
======================================================================================================
```

### B. Confusion Matrix Analysis

The confusion matrices on the 2,000 test records reveal structural trade-offs between precision and recall across model families:

#### 1. Logistic Regression
```
                 Predicted Negative (0)    Predicted Positive (1)
Actual Negative (0)       1650                        79
Actual Positive (1)         21                       250
```
- True Negatives (TN): 1,650 | False Positives (FP): 79
- False Negatives (FN): 21  | True Positives (TP): 250

#### 2. Random Forest
```
                 Predicted Negative (0)    Predicted Positive (1)
Actual Negative (0)       1690                        39
Actual Positive (1)         14                       257
```
- True Negatives (TN): 1,690 | False Positives (FP): 39
- False Negatives (FN): 14  | True Positives (TP): 257

#### 3. XGBoost (xgb-v1.4)
```
                 Predicted Negative (0)    Predicted Positive (1)
Actual Negative (0)       1713                        16
Actual Positive (1)         17                       254
```
- True Negatives (TN): 1,713 | False Positives (FP): 16
- False Negatives (FN): 17  | True Positives (TP): 254

### C. Discussion of Classification Results
XGBoost achieved the highest overall performance across primary evaluation indicators:
- **Accuracy (98.35%):** Outperforms Random Forest (+1.00%) and Logistic Regression (+3.35%).
- **Precision (94.07%):** Significantly reduces False Positive interventions (16 vs 39 for RF and 79 for LR), reducing operational cost overheads associated with false alarms.
- **F1-Score (0.9390):** Demonstrates optimal balance between precision and sensitivity.
- **ROC-AUC (0.9977):** Near-perfect class separation capability across all confidence thresholds.

---

## V. Probability Calibration Analysis

Raw outputs from tree-based ensembles often suffer from overconfidence near boundary regions. To convert raw outputs into mathematically sound risk probabilities suitable for financial exposure estimation, Isotonic Regression was fitted on the validation set:

$$y_i = f(p_i) + \epsilon_i$$

where $f$ is a non-decreasing isotonic function.

```
=================================================================================
CALIBRATION METRICS SUMMARY
=================================================================================
Brier Score (Uncalibrated XGBoost): 0.0184
Brier Score (Isotonically Calibrated): 0.0121
Expected Calibration Error (ECE):   0.0094
=================================================================================
```

The reduction in Brier Score confirms that calibrated probability outputs closely match empirical churn distributions across portfolio risk tiers (Low: < 25%, Medium: 25-50%, High: 50-75%, Critical: > 75%).

---

## VI. Unsupervised Behavioral Clustering

To complement binary classification, an unsupervised K-Means algorithm ($k=5$) was trained on standardized behavioral features to discover latent customer profiles.

### A. Cluster Characterization
The clustering process identified 5 operational segments across the 12,000 portfolio records:

```
========================================================================================================
TABLE II: K-MEANS BEHAVIORAL CLUSTERING SUMMARY (N = 12,000, SILHOUETTE SCORE = 0.1955)
========================================================================================================
ID  SEGMENT NAME              COUNT   SHARE (%)  AVG BAL ($)  ENG SCORE  CHURN RATE (%)  COMPLAINTS
========================================================================================================
0   Dormant & Disengaged (A)    589    4.9%       66,601.51    38.5       13.2%           0.21
1   Dormant & Disengaged (B)  4,210   35.1%        1,964.26    21.1       18.9%           0.15
2   High Risk & Escalating    1,122    9.3%       47,237.66    29.4       42.6%           2.04
3   Credit & Growth (A)       3,268   27.2%      106,443.30    43.5        5.2%           0.10
4   Credit & Growth (B)       2,811   23.4%      107,725.71    53.9        3.9%           0.13
========================================================================================================
```

### B. Cluster Insights
1. **High Risk & Escalating (Cluster 2):** Highest churn vulnerability (42.6%). Characterized by severe complaint rates (2.04 avg) and depressed engagement scores (29.4).
2. **Dormant & Disengaged (Cluster 1):** Represents 35.1% of the account base with low balance preservation ($1,964.26) and moderate attrition probability (18.9%).
3. **Credit & Growth (Clusters 3 & 4):** Combine to form over 50% of the customer base with robust balances (>$106,000) and minimal churn rates (< 5.2%).

---

## VII. Interpretability & Feature Importance (SHAP)

To satisfy regulatory explainability guidelines (e.g., SR 11-7 / GDPR Article 22), SHAP (SHapley Additive exPlanations) values were calculated via `TreeExplainer`. The Shapley value for feature $j$ is defined as:

$$\phi_j(x) = \sum_{S \subseteq F \setminus \{j\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[f_x(S \cup \{j\}) - f_x(S)\right]$$

### A. Top Feature Importance Rankings

Table III outlines the relative feature importance weights derived from the XGBoost model:

```
=================================================================================
TABLE III: SHAP FEATURE IMPORTANCE RANKINGS
=================================================================================
RANK   FEATURE NAME                  IMPORTANCE SCORE   IMPACT DIRECTION
=================================================================================
1      daysSinceLastTransaction      2.9261             Positive correlation
2      transactionGrowthRate         1.3249             Negative correlation
3      balanceVolatility             1.0358             Positive correlation
4      numberOfProducts              0.9702             Non-linear threshold
5      tenureMonths                  0.8961             Negative correlation
6      unresolvedComplaints          0.8670             Strong positive
7      creditScore                   0.7005             Negative correlation
8      digitalUsagePercentage        0.4351             Negative correlation
9      age                           0.3462             Bimodal
10     mobileLoginFrequency          0.2813             Negative correlation
11     complaintCount                0.2135             Positive correlation
12     transactionsPerMonth          0.1981             Negative correlation
=================================================================================
```

### B. Analytical Takeaways
- **Recency Decay:** `daysSinceLastTransaction` (2.9261) is the single largest predictor of churn. Extended gaps in transaction activity serve as a primary early warning signal.
- **Velocity Dynamics:** A negative `transactionGrowthRate` (1.3249) combined with high `balanceVolatility` (1.0358) indicates balance drainage prior to account closure.
- **Service Friction:** `unresolvedComplaints` (0.8670) exhibits a exponential hazard effect on risk scores.

---

## VIII. Operational Counterfactual Simulation Framework

The system incorporates an optimization-based counterfactual generator to identify minimum actionable parameter changes required to transition a customer from a high-risk state ($\hat{y} \ge 0.50$) to a safe state ($\hat{y} < 0.20$):

$$\min_{\delta} ||\delta||_2 \quad \text{s.t.} \quad C\left(x + \delta\right) < \theta_{\text{safe}}$$

where $\delta$ is restricted to actionable features (e.g., fee waivers, complaint resolutions, product enrollments) while holding immutable features (age, tenure) fixed.

```
=================================================================================
EXAMPLE COUNTERFACTUAL INTERVENTION SCENARIO (ACCOUNT #CUST-1002)
=================================================================================
Baseline State:    Churn Probability = 84.2% [CRITICAL RISK]
Actionable Adjustments:
  - Resolve pending complaints: 2 -> 0
  - Increase digital usage index: 22% -> 55%
  - Enroll in 1 additional banking product (e.g., Auto-pay)
Simulated State:   Churn Probability = 14.6% [LOW RISK]
Calculated Risk Reduction: -69.6%
=================================================================================
```

---

## IX. Conclusion & Future Work

This paper established a comprehensive empirical baseline for institutional banking customer churn analysis. The calibrated **XGBoost (`xgb-v1.4`)** classifier achieved superior discrimination metrics (98.35% Accuracy, 0.9977 ROC-AUC, 0.9390 F1-Score) on a 12,000-customer dataset. Integrating isotonic probability calibration, K-Means behavioral clustering, SHAP feature attribution, and counterfactual simulation ensures both predictive accuracy and regulatory auditability.

Future research directions include:
1. Incorporating temporal sequence modeling (e.g., LSTM or Temporal Fusion Transformers) to capture intra-month transaction time series dynamics.
2. Expanding survival analysis models (Cox Proportional Hazards) to estimate specific time-to-event timelines for at-risk accounts.

---

## References

1. T. Chen and C. Guestrin, "XGBoost: A Scalable Tree Boosting System," in *Proc. ACM SIGKDD Int. Conf. Knowledge Discovery and Data Mining (KDD)*, 2016, pp. 785–794.
2. S. M. Lundberg and S.-I. Lee, "A Unified Approach to Interpreting Model Predictions," in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 30, 2017, pp. 4765–4774.
3. A. Niculescu-Mizil and R. Caruana, "Predicting Good Probabilities With Supervised Learning," in *Proc. Int. Conf. Machine Learning (ICML)*, 2005, pp. 625–632.
4. J. MacQueen, "Some Methods for classification and Analysis of Multivariate Observations," in *Proc. 5th Berkeley Symp. Math. Statist. Prob.*, vol. 1, 1967, pp. 281–297.

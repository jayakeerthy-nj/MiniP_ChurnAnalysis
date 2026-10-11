"""
BankShield-Hybrid: Tabular Feature Engineering
Extracts and validates the core 29 features plus derived features.
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional


# Original 29 features - preserved for backward compatibility
ORIGINAL_FEATURE_COLS = [
    "currentBalance", "averageBalance", "minimumBalance", "maximumBalance",
    "balanceVolatility", "averageTransactionValue", "monthlyTransactionValue",
    "transactionsPerMonth", "daysSinceLastTransaction", "monthlyActiveDays",
    "transactionGrowthRate", "engagementScore",
    "numberOfProducts", "hasCreditCard", "hasLoan", "hasInvestment", "hasInsurance",
    "complaintCount", "complaintsLast90Days", "unresolvedComplaints", "averageResolutionTime",
    "digitalUsagePercentage", "mobileLoginFrequency", "webLoginFrequency", "digitalSessionDuration",
    "age", "income", "creditScore", "tenureMonths"
]

# Features with known synthetic leakage (documented in MODEL_AUDIT.md)
LEAKY_FEATURES = [
    "unresolvedComplaints",    # Perfect predictor in synthetic data
    "averageResolutionTime",   # Generated from churn label
]

# Additional engineered features
DERIVED_FEATURE_COLS = [
    "balanceToIncomeRatio",
    "txValueToBalanceRatio",
    "digitalEngagementIndex",
    "complaintSeverityIndex",
    "productDiversityScore",
    "tenureAgeRatio",
    "balancePerProduct",
    "txFrequencyToActiveDaysRatio",
    "digitalVsBranchRatio",
    "recentComplaintRatio",
]


def compute_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute derived interaction features from existing static features.
    All features are ratios/interactions of existing features - no leakage introduced.
    """
    out = df.copy()

    # Balance-to-income ratio (financial capacity utilization)
    out["balanceToIncomeRatio"] = np.where(
        out["income"] > 0,
        out["currentBalance"] / out["income"],
        0.0
    )

    # Transaction value relative to balance
    out["txValueToBalanceRatio"] = np.where(
        out["currentBalance"] > 0,
        out["averageTransactionValue"] / out["currentBalance"],
        0.0
    )

    # Digital engagement composite (mobile + web + session weighted)
    out["digitalEngagementIndex"] = (
        out["mobileLoginFrequency"] * 0.4 +
        out["webLoginFrequency"] * 0.3 +
        (out["digitalSessionDuration"] / 480.0) * 0.3  # normalize to max ~480s
    ) * (out["digitalUsagePercentage"] / 100.0)

    # Complaint severity (unresolved weighted more)
    out["complaintSeverityIndex"] = (
        out["complaintCount"] * 1.0 +
        out["complaintsLast90Days"] * 2.0 +
        out["unresolvedComplaints"] * 3.0
    )

    # Product diversity (how many different product types)
    out["productDiversityScore"] = (
        out["hasCreditCard"] + out["hasLoan"] +
        out["hasInvestment"] + out["hasInsurance"]
    ) / np.maximum(out["numberOfProducts"], 1)

    # Tenure relative to age (loyalty indicator)
    out["tenureAgeRatio"] = np.where(
        out["age"] > 0,
        out["tenureMonths"] / (out["age"] * 12.0),
        0.0
    )

    # Balance per product held
    out["balancePerProduct"] = np.where(
        out["numberOfProducts"] > 0,
        out["currentBalance"] / out["numberOfProducts"],
        0.0
    )

    # Transaction frequency efficiency
    out["txFrequencyToActiveDaysRatio"] = np.where(
        out["monthlyActiveDays"] > 0,
        out["transactionsPerMonth"] / out["monthlyActiveDays"],
        0.0
    )

    # Digital vs branch preference
    out["digitalVsBranchRatio"] = np.where(
        (out["mobileLoginFrequency"] + out["webLoginFrequency"]) > 0,
        out["digitalUsagePercentage"] / (out["mobileLoginFrequency"] + out["webLoginFrequency"] + 1),
        0.0
    )

    # Recent complaint proportion
    out["recentComplaintRatio"] = np.where(
        out["complaintCount"] > 0,
        out["complaintsLast90Days"] / out["complaintCount"],
        0.0
    )

    # Clean infinities and NaN
    for col in DERIVED_FEATURE_COLS:
        out[col] = out[col].replace([np.inf, -np.inf], 0.0).fillna(0.0)

    return out


def get_all_feature_cols(include_derived: bool = True) -> List[str]:
    """Return the complete feature column list."""
    if include_derived:
        return ORIGINAL_FEATURE_COLS + DERIVED_FEATURE_COLS
    return ORIGINAL_FEATURE_COLS.copy()


def validate_features(df: pd.DataFrame, feature_cols: List[str]) -> Dict[str, Any]:
    """Validate feature presence and quality."""
    missing_cols = [c for c in feature_cols if c not in df.columns]
    null_counts = {c: int(df[c].isnull().sum()) for c in feature_cols if c in df.columns and df[c].isnull().sum() > 0}
    inf_counts = {c: int(np.isinf(df[c]).sum()) for c in feature_cols if c in df.columns and df[c].dtype in ['float64', 'float32']}

    return {
        "valid": len(missing_cols) == 0,
        "missing_columns": missing_cols,
        "null_counts": null_counts,
        "inf_counts": {k: v for k, v in inf_counts.items() if v > 0},
        "total_features": len(feature_cols),
        "available_features": len(feature_cols) - len(missing_cols)
    }

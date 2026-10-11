"""
BankShield-Hybrid: Unified Feature Pipeline
Ensures consistent feature engineering between training and inference.
"""
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from .tabular_features import (
    ORIGINAL_FEATURE_COLS, DERIVED_FEATURE_COLS,
    compute_derived_features, get_all_feature_cols, validate_features
)
from .behavioral_features import compute_behavioral_signals


class FeaturePipeline:
    """Consistent feature pipeline for training and inference."""

    def __init__(self, include_derived: bool = True):
        self.include_derived = include_derived
        self.feature_cols = get_all_feature_cols(include_derived)
        self.original_cols = ORIGINAL_FEATURE_COLS.copy()

    def transform_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform a DataFrame by adding derived features."""
        # Ensure boolean columns are int
        for col in ["hasCreditCard", "hasLoan", "hasInvestment", "hasInsurance"]:
            if col in df.columns:
                df[col] = df[col].astype(int)

        if self.include_derived:
            df = compute_derived_features(df)

        return df

    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract feature matrix from DataFrame."""
        df = self.transform_dataframe(df)
        available = [c for c in self.feature_cols if c in df.columns]
        return df[available]

    def prepare_single(self, features: Dict[str, Any]) -> pd.DataFrame:
        """Prepare a single customer's features for prediction."""
        # Build row with original features
        row = {}
        for col in self.original_cols:
            val = features.get(col, 0)
            if isinstance(val, bool):
                val = 1 if val else 0
            row[col] = float(val)

        df = pd.DataFrame([row])

        # Add derived features
        if self.include_derived:
            df = compute_derived_features(df)

        return df[self.feature_cols]

    def get_behavioral_signals(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Get behavioral risk signals for a customer."""
        return compute_behavioral_signals(features)

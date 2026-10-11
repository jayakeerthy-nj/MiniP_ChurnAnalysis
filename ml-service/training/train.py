"""
BankShield-Hybrid: Training Entry Point
Wraps the stacking pipeline while preserving the original train_and_evaluate interface.
"""
import os
import sys

# Add project root to path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

from training.models.stacking import full_training_pipeline


def train_and_evaluate():
    """Main training entry point - backward compatible."""
    data_path = os.environ.get(
        "DATA_PATH",
        os.path.join(base_dir, "..", "data", "customer_features.csv")
    )
    artifacts_dir = os.environ.get(
        "ARTIFACTS_DIR",
        os.path.join(base_dir, "artifacts")
    )
    os.makedirs(artifacts_dir, exist_ok=True)

    results = full_training_pipeline(data_path, artifacts_dir)
    return results


if __name__ == "__main__":
    train_and_evaluate()

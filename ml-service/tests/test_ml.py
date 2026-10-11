import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ============================================================
# Health & Metrics
# ============================================================
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "modelVersion" in data
    assert "capabilities" in data

def test_health_capabilities():
    response = client.get("/health")
    data = response.json()
    caps = data.get("capabilities", {})
    assert "ensemble" in caps
    assert "shap" in caps
    assert "clustering" in caps

def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "modelVersions" in data
    assert "segments" in data
    assert len(data["segments"]) == 5

def test_metrics_has_model_metadata():
    response = client.get("/metrics")
    data = response.json()
    mv = data["modelVersions"]
    assert "modelVersion" in mv
    assert "evaluationMetrics" in mv

# ============================================================
# Prediction
# ============================================================
SAMPLE_FEATURES = {
    "currentBalance": 120000.0,
    "averageBalance": 115000.0,
    "minimumBalance": 45000.0,
    "maximumBalance": 180000.0,
    "balanceVolatility": 0.22,
    "averageTransactionValue": 3400.0,
    "monthlyTransactionValue": 45000.0,
    "transactionsPerMonth": 14.0,
    "daysSinceLastTransaction": 4,
    "monthlyActiveDays": 12,
    "transactionGrowthRate": 0.05,
    "engagementScore": 72.5,
    "numberOfProducts": 3,
    "hasCreditCard": 1,
    "hasLoan": 0,
    "hasInvestment": 1,
    "hasInsurance": 0,
    "complaintCount": 0,
    "complaintsLast90Days": 0,
    "unresolvedComplaints": 0,
    "averageResolutionTime": 0.0,
    "digitalUsagePercentage": 75.0,
    "mobileLoginFrequency": 18.0,
    "webLoginFrequency": 4.0,
    "digitalSessionDuration": 420.0,
    "age": 36,
    "income": 1200000,
    "creditScore": 760,
    "tenureMonths": 42
}

def test_predict_churn():
    response = client.post("/predict", json={"features": SAMPLE_FEATURES})
    assert response.status_code == 200
    data = response.json()
    assert "churnProbability" in data
    assert "riskLevel" in data
    assert "topRiskFactors" in data
    assert "protectiveFactors" in data
    assert "modelVersion" in data
    assert isinstance(data["churnProbability"], float)
    assert data["riskLevel"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert 0.0 <= data["churnProbability"] <= 1.0

def test_predict_has_prediction_type():
    response = client.post("/predict", json={"features": SAMPLE_FEATURES})
    data = response.json()
    assert "predictionType" in data
    assert data["predictionType"] in ["ensemble", "single_model"]

def test_predict_behavioral_signals():
    response = client.post("/predict", json={"features": SAMPLE_FEATURES})
    data = response.json()
    # Behavioral signals should be present if pipeline loaded
    if "behavioralSignals" in data:
        assert isinstance(data["behavioralSignals"], list)
    if "dataQuality" in data:
        assert "sufficientHistory" in data["dataQuality"]

def test_predict_high_risk_customer():
    high_risk = {
        **SAMPLE_FEATURES,
        "unresolvedComplaints": 3,
        "daysSinceLastTransaction": 120,
        "transactionGrowthRate": -0.7,
        "engagementScore": 10.0,
        "currentBalance": 500.0,
        "transactionsPerMonth": 0.5,
    }
    response = client.post("/predict", json={"features": high_risk})
    assert response.status_code == 200
    data = response.json()
    assert data["churnProbability"] > 0.3  # Should indicate elevated risk

def test_predict_missing_features_defaults_to_zero():
    minimal = {"currentBalance": 50000.0, "age": 35}
    response = client.post("/predict", json={"features": minimal})
    assert response.status_code == 200
    data = response.json()
    assert "churnProbability" in data

def test_predict_risk_tier_thresholds():
    """Verify risk tier assignments match documented thresholds."""
    from app.main import get_risk_level
    assert get_risk_level(0.05) == "LOW"
    assert get_risk_level(0.29) == "LOW"
    assert get_risk_level(0.30) == "MEDIUM"
    assert get_risk_level(0.59) == "MEDIUM"
    assert get_risk_level(0.60) == "HIGH"
    assert get_risk_level(0.79) == "HIGH"
    assert get_risk_level(0.80) == "CRITICAL"
    assert get_risk_level(0.99) == "CRITICAL"

# ============================================================
# Simulation
# ============================================================
def test_simulate():
    sample_features = {
        "transactionsPerMonth": 4.0,
        "digitalUsagePercentage": 20.0,
        "unresolvedComplaints": 2,
        "numberOfProducts": 1,
        "daysSinceLastTransaction": 45,
        "currentBalance": 80000.0
    }
    modifications = {
        "transactionsPerMonth": 16.0,
        "digitalUsagePercentage": 80.0,
        "unresolvedComplaints": 0,
        "numberOfProducts": 3
    }
    response = client.post("/simulate", json={
        "originalFeatures": sample_features,
        "modifications": modifications
    })
    assert response.status_code == 200
    data = response.json()
    assert "originalChurnProbability" in data
    assert "simulatedChurnProbability" in data
    assert "riskDelta" in data
    assert "disclaimer" in data
    assert "modelVersion" in data
    assert data["simulatedChurnProbability"] < data["originalChurnProbability"]

# ============================================================
# Segmentation
# ============================================================
def test_segment():
    response = client.post("/segment", json={"features": SAMPLE_FEATURES})
    assert response.status_code == 200
    data = response.json()
    assert "clusterId" in data
    assert "segment" in data
    assert isinstance(data["clusterId"], int)
    assert 0 <= data["clusterId"] < 5

# ============================================================
# Feature Pipeline Tests
# ============================================================
def test_feature_pipeline_derived():
    """Test derived feature computation."""
    try:
        from app.features.tabular_features import compute_derived_features, DERIVED_FEATURE_COLS
        import pandas as pd
        df = pd.DataFrame([SAMPLE_FEATURES])
        result = compute_derived_features(df)
        for col in DERIVED_FEATURE_COLS:
            assert col in result.columns, f"Missing derived feature: {col}"
            assert not np.isnan(result[col].iloc[0]), f"NaN in derived feature: {col}"
            assert not np.isinf(result[col].iloc[0]), f"Inf in derived feature: {col}"
    except ImportError:
        pytest.skip("Feature pipeline not available")

def test_behavioral_signals():
    """Test behavioral signal computation."""
    try:
        from app.features.behavioral_features import compute_behavioral_signals
        result = compute_behavioral_signals(SAMPLE_FEATURES)
        assert "signals" in result
        assert "signalCount" in result
        assert "dataQuality" in result
        assert isinstance(result["signals"], list)
    except ImportError:
        pytest.skip("Behavioral features not available")

def test_behavioral_signals_high_risk():
    """Test that high-risk features trigger signals."""
    try:
        from app.features.behavioral_features import compute_behavioral_signals
        high_risk = {
            "transactionsPerMonth": 0.5,
            "daysSinceLastTransaction": 120,
            "transactionGrowthRate": -0.7,
            "digitalUsagePercentage": 10.0,
            "mobileLoginFrequency": 1.0,
            "engagementScore": 8.0,
            "unresolvedComplaints": 3,
            "currentBalance": 100.0,
            "averageBalance": 50000.0,
            "tenureMonths": 36
        }
        result = compute_behavioral_signals(high_risk)
        assert result["signalCount"] > 0
        assert result["highSeverityCount"] > 0
    except ImportError:
        pytest.skip("Behavioral features not available")

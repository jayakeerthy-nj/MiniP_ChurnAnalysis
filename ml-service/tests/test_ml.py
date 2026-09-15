import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "modelVersion" in data

def test_metrics_endpoint():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "modelVersions" in data
    assert "segments" in data
    assert len(data["segments"]) == 5

def test_predict_churn():
    sample_features = {
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
    response = client.post("/predict", json={"features": sample_features})
    assert response.status_code == 200
    data = response.json()
    assert "churnProbability" in data
    assert "riskLevel" in data
    assert "topRiskFactors" in data
    assert "protectiveFactors" in data
    assert isinstance(data["churnProbability"], float)
    assert data["riskLevel"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

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
    response = client.post("/simulate", json={"originalFeatures": sample_features, "modifications": modifications})
    assert response.status_code == 200
    data = response.json()
    assert "originalChurnProbability" in data
    assert "simulatedChurnProbability" in data
    assert "riskDelta" in data
    assert data["simulatedChurnProbability"] < data["originalChurnProbability"]
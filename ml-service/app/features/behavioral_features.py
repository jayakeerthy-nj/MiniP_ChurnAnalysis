"""
BankShield-Hybrid: Behavioral Feature Engineering
Derives behavioral signals from existing static features.
Note: True temporal behavioral features require transaction-level timestamps,
which are not available in the current synthetic dataset.
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List


def compute_behavioral_signals(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute behavioral risk signals from a single customer's features.
    Used at inference time for real-time behavioral assessment.
    """
    signals = []

    tx_per_month = float(features.get("transactionsPerMonth", 0))
    days_since_tx = float(features.get("daysSinceLastTransaction", 0))
    tx_growth = float(features.get("transactionGrowthRate", 0))
    digital_pct = float(features.get("digitalUsagePercentage", 0))
    mobile_freq = float(features.get("mobileLoginFrequency", 0))
    engagement = float(features.get("engagementScore", 0))
    unresolved = float(features.get("unresolvedComplaints", 0))
    balance = float(features.get("currentBalance", 0))
    avg_balance = float(features.get("averageBalance", 0))
    tenure = float(features.get("tenureMonths", 0))

    # Transaction decline signal
    if tx_growth < -0.3:
        signals.append({
            "signal": "DECLINING_TRANSACTIONS",
            "severity": "HIGH" if tx_growth < -0.5 else "MEDIUM",
            "description": f"Transaction growth rate of {tx_growth:.1%} indicates declining activity",
            "value": round(tx_growth, 3)
        })

    # Inactivity signal
    if days_since_tx > 60:
        signals.append({
            "signal": "PROLONGED_INACTIVITY",
            "severity": "HIGH" if days_since_tx > 90 else "MEDIUM",
            "description": f"No transactions for {int(days_since_tx)} days",
            "value": int(days_since_tx)
        })

    # Low engagement signal
    if engagement < 25:
        signals.append({
            "signal": "LOW_ENGAGEMENT",
            "severity": "HIGH" if engagement < 15 else "MEDIUM",
            "description": f"Engagement score of {engagement:.1f} is below threshold",
            "value": round(engagement, 1)
        })

    # Digital disengagement
    if digital_pct < 20 and tenure > 12:
        signals.append({
            "signal": "DIGITAL_DISENGAGEMENT",
            "severity": "MEDIUM",
            "description": f"Only {digital_pct:.0f}% digital usage despite {int(tenure)} months tenure",
            "value": round(digital_pct, 1)
        })

    # Balance deterioration
    if avg_balance > 0 and balance < avg_balance * 0.3:
        signals.append({
            "signal": "BALANCE_DETERIORATION",
            "severity": "HIGH",
            "description": f"Current balance is {balance/avg_balance:.0%} of average",
            "value": round(balance, 2)
        })

    # Service friction
    if unresolved > 0:
        signals.append({
            "signal": "UNRESOLVED_SERVICE_ISSUES",
            "severity": "CRITICAL" if unresolved >= 2 else "HIGH",
            "description": f"{int(unresolved)} unresolved complaint(s) creating friction",
            "value": int(unresolved)
        })

    # New customer vulnerability
    if tenure < 12 and engagement < 40:
        signals.append({
            "signal": "NEW_CUSTOMER_AT_RISK",
            "severity": "MEDIUM",
            "description": f"Recent customer ({int(tenure)}m) with low engagement ({engagement:.0f})",
            "value": int(tenure)
        })

    return {
        "signals": signals,
        "signalCount": len(signals),
        "highSeverityCount": sum(1 for s in signals if s["severity"] in ["HIGH", "CRITICAL"]),
        "dataQuality": {
            "sufficientHistory": tenure >= 6,
            "hasTransactionData": tx_per_month > 0,
            "hasDigitalData": digital_pct > 0,
            "note": "Behavioral signals derived from static features. No temporal sequences available."
        }
    }

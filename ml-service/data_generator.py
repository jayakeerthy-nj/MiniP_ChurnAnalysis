import json
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_synthetic_bank_data(num_customers=1200, seed=42):
    random.seed(seed)
    np.random.seed(seed)
    
    cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Chandigarh"]
    occupations = ["Salaried Professional", "Software Engineer", "Business Owner", "Consultant", "Doctor", "Teacher", "Retailer", "Freelancer", "Retired"]
    genders = ["Male", "Female", "Other"]
    first_names_m = ["Arjun", "Rahul", "Aditya", "Vikram", "Rohan", "Siddharth", "Karan", "Nikhil", "Amit", "Suresh", "Gaurav", "Deepak", "Manish", "Rajesh", "Vivek"]
    first_names_f = ["Priya", "Ananya", "Sneha", "Sunita", "Pooja", "Meera", "Neha", "Divya", "Kavita", "Ritu", "Shreya", "Aditi", "Tanvi", "Swati", "Isha"]
    last_names = ["Sharma", "Verma", "Patel", "Kapoor", "Iyer", "Reddy", "Nair", "Mehta", "Singh", "Das", "Joshi", "Bose", "Choudhury", "Gupta", "Rao"]
    
    account_types = ["SAVINGS", "CURRENT", "SALARY", "FD"]
    branches = ["Metro Downtown", "North Hub", "Cyber City", "Tech Park", "Financial District", "West End", "Airport Road"]
    tx_types = ["UPI", "ATM", "POS", "NEFT", "RTGS", "IMPS", "Cash", "Card"]
    tx_channels = ["Mobile", "Web", "ATM", "Branch"]
    tx_categories = ["Shopping", "Groceries", "Utility Bills", "Direct Transfer", "Mutual Funds", "Salary Credit", "Dining", "Travel"]
    complaint_cats = ["Transaction Failure", "Unauthorized Charge", "Card Blocked", "NetBanking Issue", "Fee Dispute", "Delayed Refund"]
    severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    digital_features = ["Dashboard", "Fund Transfer", "Card Services", "Bill Pay", "Statements", "Investment Portal"]

    base_date = datetime(2026, 9, 1)

    customers = []
    accounts = []
    transactions = []
    complaints = []
    digital_interactions = []
    customer_features_list = []

    for i in range(1, num_customers + 1):
        cid = f"CUST-{1000 + i}"
        gender = random.choices(genders, weights=[0.52, 0.46, 0.02])[0]
        fname = random.choice(first_names_m if gender == "Male" else first_names_f)
        lname = random.choice(last_names)
        name = f"{fname} {lname}"
        
        age = int(np.clip(np.random.normal(39, 12), 21, 72))
        income = int(np.clip(np.random.lognormal(13.2, 0.65), 250000, 5000000))
        occupation = random.choice(occupations)
        city = random.choice(cities)
        credit_score = int(np.clip(np.random.normal(710, 75), 350, 850))
        tenure_months = int(np.clip(np.random.exponential(36), 3, 140))

        # Latent risk propensity based on behavioral reality
        risk_score_latent = 0.28
        if tenure_months < 12:
            risk_score_latent += 0.20
        elif tenure_months > 48:
            risk_score_latent -= 0.12

        if credit_score < 600:
            risk_score_latent += 0.22
        elif credit_score > 750:
            risk_score_latent -= 0.14

        # Products
        has_credit_card = random.random() > (0.40 if credit_score > 680 else 0.75)
        has_loan = random.random() > 0.65
        has_investment = random.random() > 0.55
        has_insurance = random.random() > 0.70
        num_products = 1 + int(has_credit_card) + int(has_loan) + int(has_investment) + int(has_insurance)
        if num_products >= 3:
            risk_score_latent -= 0.18
        elif num_products == 1:
            risk_score_latent += 0.15

        # Digital engagement tendency
        digital_inclination = float(np.clip(np.random.beta(4, 3 if age < 45 else 5), 0.05, 0.95))
        if digital_inclination < 0.30:
            risk_score_latent += 0.20
        elif digital_inclination > 0.70:
            risk_score_latent -= 0.15

        # Complaint tendency
        complaint_tendency = float(np.clip(np.random.beta(1.8, 5.0), 0, 1))
        if complaint_tendency > 0.40:
            risk_score_latent += 0.24

        # Transaction frequency tendency
        base_monthly_tx = max(1, int(np.random.poisson(14 * max(0.2, 1 - risk_score_latent * 0.6))))
        
        # Determine actual churn (calibrated to ~18% realistic banking churn)
        final_churn_prob = float(np.clip(risk_score_latent + np.random.normal(0, 0.10), 0.02, 0.98))
        churn_label = 1 if final_churn_prob > 0.48 else 0
        account_status = "CHURNED" if churn_label == 1 else "ACTIVE"

        created_at = base_date - timedelta(days=tenure_months * 30)

        customer = {
            "customerId": cid,
            "name": name,
            "age": age,
            "gender": gender,
            "income": income,
            "occupation": occupation,
            "city": city,
            "creditScore": credit_score,
            "tenureMonths": tenure_months,
            "accountStatus": account_status,
            "createdAt": created_at.isoformat(),
            "updatedAt": base_date.isoformat()
        }
        customers.append(customer)

        # Accounts
        primary_acc_type = "SALARY" if occupation in ["Salaried Professional", "Software Engineer"] else "SAVINGS"
        base_balance = float(np.clip(np.random.lognormal(11.5, 0.9), 5000, 3500000))
        if churn_label == 1:
            base_balance = base_balance * random.uniform(0.05, 0.30) # Pre-churn drainage
        
        acc_id = f"ACC-{20000 + i}"
        account = {
            "accountId": acc_id,
            "customerId": cid,
            "accountType": primary_acc_type,
            "balance": round(base_balance, 2),
            "openedAt": created_at.isoformat(),
            "status": "DORMANT" if (churn_label == 1 and random.random() > 0.3) else "ACTIVE",
            "branch": random.choice(branches)
        }
        accounts.append(account)

        # Generate Transactions for past 180 days
        tx_history = []
        num_days = 180
        curr_balance = base_balance
        daily_balances = []

        for day_offset in range(num_days, 0, -1):
            tx_date = base_date - timedelta(days=day_offset)
            is_recent_period = day_offset <= 60
            
            daily_tx_prob = (base_monthly_tx / 30.0)
            if churn_label == 1 and is_recent_period:
                daily_tx_prob *= 0.12 # sharp drop before churn
            
            if random.random() < daily_tx_prob:
                num_tx_today = random.choices([1, 2, 3], weights=[0.7, 0.2, 0.1])[0]
                for _ in range(num_tx_today):
                    tx_type = random.choice(tx_types)
                    channel = "Mobile" if random.random() < digital_inclination else random.choice(tx_channels)
                    cat = random.choice(tx_categories)
                    amount = round(float(np.clip(np.random.exponential(2400), 50, 85000)), 2)
                    is_credit = cat == "Salary Credit" or (random.random() < 0.15)
                    
                    if is_credit:
                        curr_balance += amount
                    else:
                        curr_balance = max(200.0, curr_balance - amount)
                    
                    tx = {
                        "transactionId": f"TX-{len(transactions) + 1:07d}",
                        "customerId": cid,
                        "date": tx_date.isoformat(),
                        "amount": amount,
                        "transactionType": tx_type,
                        "channel": channel,
                        "category": cat,
                        "merchant": f"Merchant-{random.randint(100, 999)}" if cat != "Salary Credit" else "Employer Payroll"
                    }
                    transactions.append(tx)
                    tx_history.append(tx)
            
            daily_balances.append(curr_balance)

        # Complaints
        cust_complaints = []
        num_complaints = 0
        if complaint_tendency > 0.30:
            num_complaints = np.random.choice([1, 2, 3, 4], p=[0.55, 0.25, 0.12, 0.08])
        
        for c_idx in range(num_complaints):
            days_ago = random.randint(5, 170)
            c_date = base_date - timedelta(days=days_ago)
            cat = random.choice(complaint_cats)
            severity = random.choices(severities, weights=[0.4, 0.3, 0.2, 0.1] if churn_label == 0 else [0.1, 0.15, 0.40, 0.35])[0]
            
            if churn_label == 1 and random.random() > 0.30:
                status = random.choice(["OPEN", "IN_PROGRESS"])
                resolved_at = None
                resolution_time = None
            else:
                status = "RESOLVED"
                res_hours = random.randint(6, 120)
                resolved_at = (c_date + timedelta(hours=res_hours)).isoformat()
                resolution_time = res_hours

            comp = {
                "complaintId": f"CMP-{len(complaints) + 1:05d}",
                "customerId": cid,
                "category": cat,
                "severity": severity,
                "status": status,
                "createdAt": c_date.isoformat(),
                "resolvedAt": resolved_at,
                "resolutionTime": resolution_time
            }
            complaints.append(comp)
            cust_complaints.append(comp)

        # Digital Interactions
        cust_interactions = []
        num_sessions = int(np.clip(np.random.poisson(digital_inclination * 40), 2, 120))
        for _ in range(num_sessions):
            i_days_ago = random.randint(1, 180)
            if churn_label == 1 and i_days_ago < 60 and random.random() > 0.20:
                continue
            i_date = base_date - timedelta(days=i_days_ago)
            platform = "Mobile" if random.random() > 0.3 else "Web"
            sess_duration = random.randint(45, 950)
            feature = random.choice(digital_features)
            
            interaction = {
                "interactionId": f"DGT-{len(digital_interactions) + 1:07d}",
                "customerId": cid,
                "date": i_date.isoformat(),
                "platform": platform,
                "loginCount": random.randint(1, 4),
                "sessionDuration": sess_duration,
                "featureUsed": feature
            }
            digital_interactions.append(interaction)
            cust_interactions.append(interaction)

        # Feature Engineering calculation
        curr_bal = round(curr_balance, 2)
        avg_bal = round(float(np.mean(daily_balances) if daily_balances else curr_bal), 2)
        min_bal = round(float(np.min(daily_balances) if daily_balances else curr_bal), 2)
        max_bal = round(float(np.max(daily_balances) if daily_balances else curr_bal), 2)
        bal_volatility = round(float(np.std(daily_balances) / (avg_bal + 1.0) if daily_balances else 0.1), 3)
        
        tx_amounts = [t["amount"] for t in tx_history]
        avg_tx_val = round(float(np.mean(tx_amounts) if tx_amounts else 0.0), 2)
        monthly_tx_val = round(float((sum(tx_amounts) / 6.0) if tx_amounts else 0.0), 2)

        tx_count = len(tx_history)
        tx_per_month = round(tx_count / 6.0, 2)
        
        if tx_history:
            last_tx_date = max(datetime.fromisoformat(t["date"]) for t in tx_history)
            days_since_last_tx = (base_date - last_tx_date).days
        else:
            days_since_last_tx = 180

        tx_first_90 = sum(1 for t in tx_history if (base_date - datetime.fromisoformat(t["date"])).days > 90)
        tx_last_90 = sum(1 for t in tx_history if (base_date - datetime.fromisoformat(t["date"])).days <= 90)
        tx_growth_rate = round(float((tx_last_90 - tx_first_90) / (tx_first_90 + 1.0)), 3)

        active_days_set = {t["date"][:10] for t in tx_history if (base_date - datetime.fromisoformat(t["date"])).days <= 30}
        monthly_active_days = len(active_days_set)

        comp_count = len(cust_complaints)
        comp_last_90 = sum(1 for c in cust_complaints if (base_date - datetime.fromisoformat(c["createdAt"])).days <= 90)
        unresolved_comp = sum(1 for c in cust_complaints if c["status"] in ["OPEN", "IN_PROGRESS"])
        resolved_times = [c["resolutionTime"] for c in cust_complaints if c["resolutionTime"] is not None]
        avg_res_time = round(float(np.mean(resolved_times) if resolved_times else 0.0), 1)

        total_channels = tx_count
        digital_tx_count = sum(1 for t in tx_history if t["channel"] in ["Mobile", "Web"])
        digital_usage_pct = round(float((digital_tx_count / (total_channels + 1e-5)) * 100 if total_channels > 0 else digital_inclination * 100), 1)
        mobile_logins = sum(i["loginCount"] for i in cust_interactions if i["platform"] == "Mobile")
        web_logins = sum(i["loginCount"] for i in cust_interactions if i["platform"] == "Web")
        mobile_login_freq = round(mobile_logins / 6.0, 1)
        web_login_freq = round(web_logins / 6.0, 1)
        session_durations = [i["sessionDuration"] for i in cust_interactions]
        avg_digital_session = round(float(np.mean(session_durations) if session_durations else 120.0), 1)

        # Engagement Score
        score_tx = min(25.0, (tx_per_month / 20.0) * 25.0)
        score_digital = (digital_usage_pct / 100.0) * 25.0
        score_products = (num_products / 5.0) * 20.0
        score_recency = max(0.0, 20.0 - (days_since_last_tx / 60.0) * 20.0)
        penalty_complaints = min(10.0, unresolved_comp * 5.0 + (comp_last_90 * 2.0))
        
        engagement_score = round(float(np.clip(score_tx + score_digital + score_products + score_recency - penalty_complaints, 0.0, 100.0)), 1)
        
        if engagement_score >= 80:
            engagement_cat = "Highly Engaged"
        elif engagement_score >= 60:
            engagement_cat = "Engaged"
        elif engagement_score >= 40:
            engagement_cat = "At Risk"
        else:
            engagement_cat = "Dormant"

        feature_record = {
            "customerId": cid,
            "currentBalance": curr_bal,
            "averageBalance": avg_bal,
            "minimumBalance": min_bal,
            "maximumBalance": max_bal,
            "balanceVolatility": bal_volatility,
            "averageTransactionValue": avg_tx_val,
            "monthlyTransactionValue": monthly_tx_val,
            "transactionsPerMonth": tx_per_month,
            "daysSinceLastTransaction": days_since_last_tx,
            "monthlyActiveDays": monthly_active_days,
            "transactionGrowthRate": tx_growth_rate,
            "engagementScore": engagement_score,
            "engagementCategory": engagement_cat,
            "scoreBreakdown": {
                "transactionFrequency": round(score_tx, 1),
                "digitalUsage": round(score_digital, 1),
                "productUsage": round(score_products, 1),
                "recency": round(score_recency, 1),
                "servicePenalty": round(penalty_complaints, 1)
            },
            "numberOfProducts": num_products,
            "hasCreditCard": has_credit_card,
            "hasLoan": has_loan,
            "hasInvestment": has_investment,
            "hasInsurance": has_insurance,
            "complaintCount": comp_count,
            "complaintsLast90Days": comp_last_90,
            "unresolvedComplaints": unresolved_comp,
            "averageResolutionTime": avg_res_time,
            "digitalUsagePercentage": digital_usage_pct,
            "mobileLoginFrequency": mobile_login_freq,
            "webLoginFrequency": web_login_freq,
            "digitalSessionDuration": avg_digital_session,
            "age": age,
            "income": income,
            "creditScore": credit_score,
            "tenureMonths": tenure_months,
            "churn": churn_label
        }
        customer_features_list.append(feature_record)

    return {
        "customers": customers,
        "accounts": accounts,
        "transactions": transactions,
        "complaints": complaints,
        "digitalInteractions": digital_interactions,
        "customerFeatures": customer_features_list
    }

if __name__ == "__main__":
    print("Generating synthetic banking dataset (1,200 customers)...")
    data = generate_synthetic_bank_data(num_customers=1200)
    
    import os
    data_dir = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data"))
    os.makedirs(data_dir, exist_ok=True)
    
    for key, items in data.items():
        filepath = os.path.join(data_dir, f"{key}.json")
        with open(filepath, "w") as f:
            json.dump(items, f)
        print(f"Saved {len(items)} records to {filepath}")
    
    df_features = pd.DataFrame(data["customerFeatures"])
    df_features.to_csv(os.path.join(data_dir, "customer_features.csv"), index=False)
    print(f"Saved ML feature matrix ({df_features.shape}) to {os.path.join(data_dir, 'customer_features.csv')}")
    print(f"Churn distribution: {df_features['churn'].value_counts().to_dict()}")

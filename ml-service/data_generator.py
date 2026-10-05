import json
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_synthetic_bank_data(num_customers=12000, seed=42):
    random.seed(seed)
    np.random.seed(seed)
    
    cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Chandigarh"]
    occupations = ["Salaried Professional", "Software Engineer", "Business Owner", "Consultant", "Doctor", "Teacher", "Retailer", "Freelancer", "Retired"]
    genders = ["Male", "Female", "Other"]
    first_names_m = ["Arjun", "Rahul", "Aditya", "Vikram", "Rohan", "Siddharth", "Karan", "Nikhil", "Amit", "Suresh", "Gaurav", "Deepak", "Manish", "Rajesh", "Vivek", "Mitchell", "Ramesh", "Nelson", "King", "Sanchez", "Thomas", "Campbell", "Clark", "Brown", "Baker", "Scott", "Perez", "Roberts", "Martin", "Tyler", "Bartlett"]
    first_names_f = ["Priya", "Ananya", "Sneha", "Sunita", "Pooja", "Meera", "Neha", "Divya", "Kavita", "Ritu", "Shreya", "Aditi", "Tanvi", "Swati", "Isha", "White", "Gonzalez", "Anderson", "Williams", "Lopez", "Lee", "Walker", "Thompson"]
    last_names = ["Sharma", "Verma", "Patel", "Kapoor", "Iyer", "Reddy", "Nair", "Mehta", "Singh", "Das", "Joshi", "Bose", "Choudhury", "Gupta", "Rao", "Mitchell", "Ramesh", "Nelson", "King", "White", "Carter", "Sanchez", "Thomas", "Campbell", "Gonzalez", "Anderson", "Clark", "Brown", "Baker", "Robinson", "Scott", "Williams", "Perez", "Roberts", "Lopez", "Lee", "Walker", "Thompson", "Tyler", "Bartlett", "Martin"]
    
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
        
        # Kaggle realistic distributions (Age 18-88, CreditScore 350-850, Income 25k-5M)
        age = int(np.clip(np.random.normal(38.9, 10.5), 18, 88))
        income = int(np.clip(np.random.lognormal(11.5, 0.75), 25000, 2500000))
        occupation = random.choice(occupations)
        city = random.choice(cities)
        credit_score = int(np.clip(np.random.normal(650, 96), 350, 850))
        tenure_months = int(np.clip(np.random.uniform(0, 120), 0, 120)) # 0 to 10 years

        # Latent risk propensity based on Kaggle & domain reality
        risk_score_latent = 0.20
        if tenure_months < 24:
            risk_score_latent += 0.15
        elif tenure_months > 60:
            risk_score_latent -= 0.10

        if credit_score < 500:
            risk_score_latent += 0.25
        elif credit_score > 750:
            risk_score_latent -= 0.12

        if age > 50:
            risk_score_latent += 0.10 # Kaggle trend: older customers exit slightly more

        # Products (1, 2, 3, 4 - like Kaggle dataset)
        has_credit_card = random.random() < (0.70 if credit_score > 600 else 0.45)
        has_loan = random.random() > 0.65
        has_investment = random.random() > 0.60
        has_insurance = random.random() > 0.70
        num_products = random.choices([1, 2, 3, 4], weights=[0.50, 0.43, 0.05, 0.02])[0]
        if num_products >= 3:
            risk_score_latent += 0.25 # Kaggle benchmark: 3 or 4 products have higher exit rate
        elif num_products == 2:
            risk_score_latent -= 0.15 # 2 products is lowest churn in benchmark

        # Digital engagement inclination
        digital_inclination = float(np.clip(np.random.beta(3, 3 if age < 45 else 5), 0.02, 0.98))
        if digital_inclination < 0.25:
            risk_score_latent += 0.18
        elif digital_inclination > 0.75:
            risk_score_latent -= 0.12

        # Complaint tendency
        complaint_tendency = float(np.clip(np.random.beta(1.5, 5.0), 0, 1))
        if complaint_tendency > 0.35:
            risk_score_latent += 0.22

        # Transaction frequency tendency
        base_monthly_tx = max(0, int(np.random.poisson(12 * max(0.1, 1 - risk_score_latent * 0.5))))
        
        # Final churn probability (~20% realistic benchmark exit rate)
        final_churn_prob = float(np.clip(risk_score_latent + np.random.normal(0, 0.08), 0.02, 0.98))
        churn_label = 1 if final_churn_prob > 0.45 else 0
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

        # Kaggle realistic Balance distribution: ~36% zero balance, rest 10k to 250k
        is_zero_balance = random.random() < 0.36
        if is_zero_balance:
            base_balance = 0.0
        else:
            base_balance = float(round(np.clip(np.random.normal(110000, 45000), 5000, 250000), 2))
        
        if churn_label == 1 and base_balance > 0:
            base_balance = float(round(base_balance * random.uniform(0.05, 0.40), 2))

        primary_acc_type = "SALARY" if occupation in ["Salaried Professional", "Software Engineer"] else "SAVINGS"
        acc_id = f"ACC-{20000 + i}"
        account = {
            "accountId": acc_id,
            "customerId": cid,
            "accountType": primary_acc_type,
            "balance": base_balance,
            "openedAt": created_at.isoformat(),
            "status": "DORMANT" if (churn_label == 1 and random.random() > 0.3) else "ACTIVE",
            "branch": random.choice(branches)
        }
        accounts.append(account)

        # Generate lightweight transaction summary metrics fast
        curr_bal = base_balance
        if base_balance == 0.0:
            avg_bal = 0.0
            min_bal = 0.0
            max_bal = float(round(random.uniform(0.0, 5000.0), 2)) if random.random() < 0.2 else 0.0
            bal_volatility = 0.0
            tx_per_month = float(round(random.uniform(0.0, 2.0), 1))
            days_since_last_tx = random.randint(45, 180)
            monthly_active_days = random.randint(0, 3)
            tx_growth_rate = float(round(random.uniform(-0.8, 0.0), 2))
            avg_tx_val = 0.0
            monthly_tx_val = 0.0
        else:
            avg_bal = float(round(np.clip(base_balance * random.uniform(0.85, 1.15), 0.0, 300000.0), 2))
            min_bal = float(round(np.clip(base_balance * random.uniform(0.40, 0.90), 0.0, 250000.0), 2))
            max_bal = float(round(np.clip(base_balance * random.uniform(1.05, 1.40), base_balance, 350000.0), 2))
            bal_volatility = float(round(random.uniform(0.05, 0.45), 3))
            tx_per_month = float(round(max(0.5, base_monthly_tx), 1))
            days_since_last_tx = random.randint(1, 30) if churn_label == 0 else random.randint(25, 120)
            monthly_active_days = int(np.clip(tx_per_month * random.uniform(0.8, 1.2), 0, 30))
            tx_growth_rate = float(round(random.uniform(-0.15, 0.35) if churn_label == 0 else random.uniform(-0.85, -0.10), 3))
            avg_tx_val = float(round(random.uniform(800.0, 8500.0), 2))
            monthly_tx_val = float(round(avg_tx_val * tx_per_month, 2))

        # Complaints
        comp_count = 0
        comp_last_90 = 0
        unresolved_comp = 0
        avg_res_time = 0.0
        if complaint_tendency > 0.35:
            comp_count = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]
            comp_last_90 = random.randint(0, comp_count)
            if churn_label == 1:
                unresolved_comp = random.randint(1, comp_count)
                avg_res_time = float(round(random.uniform(48.0, 144.0), 1))
            else:
                unresolved_comp = 0
                avg_res_time = float(round(random.uniform(6.0, 36.0), 1))

        # Digital usage
        digital_usage_pct = float(round(digital_inclination * 100.0, 1))
        mobile_login_freq = float(round(digital_inclination * 15.0, 1))
        web_login_freq = float(round(digital_inclination * 8.0, 1))
        avg_digital_session = float(round(random.uniform(90.0, 480.0), 1))

        # Score calculations
        score_tx = min(25.0, (tx_per_month / 20.0) * 25.0)
        score_digital = (digital_usage_pct / 100.0) * 25.0
        score_products = (num_products / 4.0) * 20.0
        score_recency = max(0.0, 20.0 - (days_since_last_tx / 60.0) * 20.0)
        penalty_complaints = min(10.0, unresolved_comp * 5.0 + (comp_last_90 * 2.0))
        
        engagement_score = float(round(np.clip(score_tx + score_digital + score_products + score_recency - penalty_complaints, 0.0, 100.0), 1))
        
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
            "hasCreditCard": int(has_credit_card),
            "hasLoan": int(has_loan),
            "hasInvestment": int(has_investment),
            "hasInsurance": int(has_insurance),
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
        "transactions": transactions[:20000],
        "complaints": complaints[:5000],
        "digitalInteractions": digital_interactions[:10000],
        "customerFeatures": customer_features_list
    }

if __name__ == "__main__":
    print("Generating synthetic banking dataset (12,000 customers for 10k train / 2k test)...")
    data = generate_synthetic_bank_data(num_customers=12000)
    
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


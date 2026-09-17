# cmd. — Churn Modeling & Decision Engine

An institutional analytical platform engineered for retail banking institutions to monitor, predict, and mitigate customer attrition. **cmd.** integrates core banking transaction and account signals, computes multi-dimensional volatility metrics, executes machine learning inference (Random Forest with TreeSHAP explainability and K-Means behavioral clustering), and provides interactive what-if simulation alongside role-based operational workflows for risk executives, branch managers, and quantitative analysts.

---

## Brand Identity & Aesthetic

- **Name**: `cmd.` (**C**hurn **M**odeling & **D**ecision Engine)
- **Visual Identity**: Modern-retro pixel branding inspired by Minecraft typography, utilizing Google Font **Silkscreen** alongside a sharp isometric command block mark and electric blue square pixel period (`.`).
- **Design Philosophy**: High-density, minimalist, visualization-first banking intelligence. Strict rejection of generic AI templates, purple gradients, pill buttons, and fake vanity metrics.

---

## Architecture Overview

The system is organized into three decoupled micro-services and a document database:

```
                  ┌─────────────────────────────────────┐
                  │       Frontend (Next.js 14)         │
                  │   Port 3000 | App Router, Tailwind  │
                  └──────────────────┬──────────────────┘
                                     │ /api/* proxy
                                     ▼
                  ┌─────────────────────────────────────┐
                  │        Backend API (Express)        │
                  │   Port 5000 | TypeScript, Mongoose   │
                  └──────────┬──────────────────┬───────┘
                             │                  │
               Internal HTTP │                  │ Mongoose
                             ▼                  ▼
┌───────────────────────────────────────┐   ┌───────────────────────────────┐
│         ML Service (FastAPI)          │   │      MongoDB (Document Store)  │
│  Port 8000 | Scikit-Learn, SHAP, K-Means │   │  Collections: Customers,      │
└───────────────────────────────────────┘   │  Features, Accounts, Models   │
                                            └───────────────────────────────┘
```

1. **Frontend (`frontend/`)**: Built on Next.js 14 (App Router) and React. Features an interactive telemetry landing page, 1-click evaluation profiles, and dedicated operational workspaces. Proxies `/api/*` calls to the backend on port 5000.
2. **Backend (`backend/`)**: Node.js and Express in TypeScript. Implements JWT authentication, role-based access control (RBAC), Mongoose data models, seed generation, analytical aggregation pipelines, and proxies predictions to the ML service.
3. **ML Microservice (`ml-service/`)**: Python FastAPI service running Scikit-learn (Random Forest, Logistic Regression), TreeSHAP for exact feature attribution, and K-Means clustering.
4. **Database (MongoDB)**: Stores institutional datasets including customers, account balances, transaction histories, digital banking usage, customer complaints, segments, and audit logs. Supports both local MongoDB and MongoDB Atlas.

---

## Prerequisites

Ensure the following runtimes are installed on your host machine or WSL2 environment:

- **Node.js**: v18.0.0 or higher (v20 LTS recommended)
- **npm**: v9.0.0 or higher
- **Python**: v3.10, v3.11, or v3.12 with `pip` and `virtualenv`
- **MongoDB**: v6.0 or higher (local service or free MongoDB Atlas cluster)

---

## Environment Variables

Copy `.env.example` to `.env` in the repository root. The backend automatically reads this file:

```bash
cp .env.example .env
```

| Variable | Default Value | Required | Description |
| :--- | :--- | :---: | :--- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/banking_churn_db` | **Yes** | Connection string for local MongoDB or MongoDB Atlas cluster. |
| `PORT` | `5000` | **Yes** | Express backend HTTP listener port. |
| `NODE_ENV` | `development` | No | Environment mode (`development` or `production`). |
| `FRONTEND_URL` | `http://localhost:3000` | **Yes** | Origin URL for CORS configuration. |
| `BACKEND_URL` | `http://localhost:5000` | **Yes** | Internal backend base address. |
| `JWT_ACCESS_SECRET` | `replace_with_secure_access_secret_key_in_production` | **Yes** | Signing secret for short-lived 15-minute access tokens. |
| `JWT_REFRESH_SECRET` | `replace_with_secure_refresh_secret_key_in_production` | **Yes** | Signing secret for 7-day refresh tokens. |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | No | Access token expiration window. |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | No | Refresh token expiration window. |
| `ML_SERVICE_URL` | `http://127.0.0.1:8000` | **Yes** | Base URL where FastAPI microservice listens. |
| `ML_SERVICE_API_KEY` | `aegis_ml_internal_key` | No | Shared secret header between backend and ML service. |
| `GEMINI_API_KEY` | *(empty)* | No | Optional Google Gemini API key for AI summaries. If omitted, built-in deterministic fallbacks are used. |

---

## Step-by-Step Quick Start

### 1. Clone the Repository
```bash
git clone <repo-url>
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env to set your MONGODB_URI if using MongoDB Atlas
```

### 3. Install All Dependencies
```bash
# Install root orchestration tools
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Set up Python virtual environment for ML service
cd ml-service
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
cd ..
```

### 4. Verify / Train Machine Learning Models
Model artifacts are pre-trained in `ml-service/artifacts/`. To retrain from scratch:
```bash
npm run train
```
This fits the Random Forest classifier, Logistic Regression model, StandardScaler, TreeSHAP explainer, and K-Means segmentation model, saving them to `ml-service/artifacts/`.

### 5. Seed Database
Seed the database with enterprise banking records (customers, accounts, transactions, digital interactions, customer complaints, and pre-computed risk features):
```bash
npm run seed
```

### 6. Run the Development Server
Start all three services concurrently with a single command:
```bash
npm run dev
```

This launches:
- **ML Microservice** at [http://localhost:8000](http://localhost:8000)
- **Backend API** at [http://localhost:5000](http://localhost:5000)
- **Frontend App** at [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials & Role Access

The platform enforces strict Role-Based Access Control (RBAC). Five pre-configured evaluation accounts are available with **1-click direct login** available on both the landing page and authentication portal:

| Role Key | Name | Email | Password | Allowed Views & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Chief Risk Officer** | Arjun Kapoor | `admin@bank.com` | `Admin@123` | Executive portfolio oversight, macro capital exposure, user administration, system configuration, governance exports. |
| **Risk Analyst** | Priya Sharma | `analyst@bank.com` | `Analyst@123` | Full portfolio diagnostics, customer explorer, SHAP feature attribution, risk watchlists, model fairness scores. |
| **Branch Manager** | Vikram Mehta | `manager@bank.com` | `Manager@123` | Branch customer surveillance, relationship manager assignments, retention outreach workflows, fee waiver simulator. |
| **Compliance Officer** | Ananya Deshmukh | `compliance@bank.com` | `Admin@123` | Immutable audit log surveillance, model version control, bias evaluation, regulatory compliance exports. |
| **Demo Guest** | Executive Guest | `guest@bank.com` | `Analyst@123` | Read-only evaluation mode exploring core risk scoring and interactive scenario simulation. |

---

## Key Workspace Views & Visualizations

- **Interactive Telemetry Landing Page**: Dynamic SVG 12-month attrition trajectory curve with live retention simulation toggle (-38.4% projected risk reduction), segmented portfolio risk distribution bar, and interactive SHAP/K-Means modules.
- **Portfolio Executive Dashboard**: Live KPI banner (Total Monitored Capital, Customer Count, Churn Rate, High/Critical Risk Counts, Open Grievances), 12-month dynamics curve, risk tier distribution, and top SHAP churn drivers.
- **Risk & Churn Surveillance**: Multi-dimensional risk breakdowns by age cohort, product holdings, and digital adoption tiers with sorting and filtering.
- **Customer Intelligence Explorer**: Paginated search and filtering across the portfolio with real-time risk tier badges and quick navigation to individual customer dossiers.
- **Customer 360 Dossier**: Comprehensive customer profile displaying account balance, transactional velocity, digital engagement score, TreeSHAP force plot breakdown, and retention intervention triggers.
- **Customer Segmentation**: Unsupervised K-Means cohort visualization separating At-Risk Affluent, Low-Balance Dormant, High-Grievance, and Core Salaried customers.
- **What-If Retention Simulator**: Real-time slider-based scenario testing allowing risk officers to adjust relationship interventions (fee waivers, interest rate discounts, dedicated RM outreach) and immediately measure customer churn probability reduction.
- **Model Governance & Diagnostics**: Model performance metrics (ROC-AUC 0.88, F1-Score 0.84, Precision 0.82), confusion matrix, feature importance rankings, and model artifact version history.
- **Audit Logs (Admin/Compliance)**: Comprehensive audit trail tracking all customer detail views, simulation runs, profile updates, and authentication events.

---

## Troubleshooting Guide

### 1. Exit Code 137 / Killed During Dev Startup
- **Symptom**: `npm run dev:frontend exited with code 137` and other processes terminate with `SIGTERM`.
- **Cause**: A previous or duplicate `next dev` instance was already running on port 3000, exceeding WSL2 memory limits.
- **Resolution**: Kill all orphaned Node/Next processes and restart:
  ```bash
  killall -9 node 2>/dev/null || true
  npm run dev
  ```

### 2. MongoDB Connection Failure
- **Symptom**: Backend console outputs `[Database] MongoDB Connection Error`.
- **Resolution**: Verify your MongoDB service is running locally (`sudo systemctl start mongod` or `net start MongoDB`). If using MongoDB Atlas, check that your IP address is whitelisted in Atlas Network Access and that your `.env` connection string includes the correct credentials.

### 3. ML Service Not Starting
- **Symptom**: Concurrently terminates or outputs `ModuleNotFoundError: No module named 'uvicorn'`.
- **Resolution**: Ensure the Python virtual environment exists and has dependencies installed:
  ```bash
  cd ml-service
  python3 -m venv venv
  ./venv/bin/pip install -r requirements.txt
  cd ..
  ```

### 4. Port Collisions (Ports 3000, 5000, or 8000 in use)
- **Symptom**: `EADDRINUSE` error during startup.
- **Resolution**: Check which process is occupying the port and terminate it:
  ```bash
  # On Linux / WSL:
  lsof -ti:3000 | xargs kill -9
  lsof -ti:5000 | xargs kill -9
  lsof -ti:8000 | xargs kill -9
  ```

### 5. Gemini API Key Missing or Invalid
- **Symptom**: Backend logs `Gemini API call failed, using high-fidelity fallback`.
- **Resolution**: This is non-blocking. The application is designed with intelligent, deterministic fallbacks for customer executive summaries and portfolio briefings. If you wish to use live Gemini outputs, add a valid `GEMINI_API_KEY` to `.env`.

---

## License & Compliance

Designed for enterprise banking risk operations. Adheres to institutional model governance guidelines and role-based access standards.

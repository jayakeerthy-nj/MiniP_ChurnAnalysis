# Banking Customer Risk & Churn Analytics

**cmd.** (Churn Modeling & Decision Engine) is an enterprise analytics platform for retail banking institutions. It monitors, predicts, and helps mitigate customer attrition using machine learning, behavioral segmentation, and SHAP explainability.

---

## Problem Statement

Retail banks lose significant revenue when customers close accounts or move balances to competitors. Traditional rule-based early-warning systems lack the precision to prioritize high-value at-risk customers. This platform uses machine learning to predict churn probability for every customer, explain the behavioral drivers, and surface actionable retention recommendations to relationship managers and risk officers.

---

## Features

- **Customer Risk Dashboard**: Real-time KPIs including churn rate, risk distribution, portfolio balance, and engagement scores
- **Customer Explorer**: Searchable, filterable table of all customers with risk levels and behavioral signals
- **Customer 360**: Per-customer deep profile including transactions, complaints, digital usage, ML prediction, and AI summary
- **Churn Analytics**: Correlation matrix, churn vs. tenure, churn vs. complaint drivers
- **Risk Matrix**: Risk by age group, product holdings, digital usage tier, and high-risk watchlist
- **Customer Segments**: K-Means clustering with behavioral profiles (5 segments)
- **What-If Simulator**: Test retention interventions and see projected churn probability change
- **Recommendations Engine**: Four prioritized retention playbooks based on real customer data
- **Reports**: Executive summary and CSV export of customer risk data
- **Admin Panel**: User management, audit logs, ML model monitoring
- **RBAC**: Role-based access control (ADMIN, ANALYST, MANAGER)
- **Gemini AI Integration**: Optional AI-generated customer insight summaries

---

## Architecture

```
                    USERS
                      |
                      v
              +---------------+
              |   FRONTEND    |
              |   Next.js 14  |  Port 3000
              +-------+-------+
                      | /api/* proxy
                      v
              +---------------+
              |    BACKEND    |
              | Node/Express  |  Port 5000
              +---+-------+---+
                  |       |
                  v       v
             MongoDB    ML SERVICE
           (Atlas or   FastAPI/Python  Port 8000
            local)       |
                         +-- XGBoost (primary churn model)
                         +-- Random Forest
                         +-- Logistic Regression
                         +-- K-Means (segmentation)
                         +-- SHAP (explainability)
                  |
                  v
              Gemini API
              (via backend only)
```

---

## Folder Structure

```
banking-churn-analytics/
|
+-- frontend/          Next.js 14 application
|   +-- src/
|       +-- app/       Routes: /, /login, /workspace
|       +-- components/ View components for each dashboard section
|       +-- lib/       api.ts - centralized Axios client
|       +-- stores/    Zustand auth store
|       +-- styles/    globals.css
|       +-- types/     TypeScript type definitions
|
+-- backend/           Node.js + Express API
|   +-- src/
|       +-- config/    db.ts (MongoDB), env.ts (env vars)
|       +-- controllers/ One controller per feature domain
|       +-- middleware/ auth.ts, rbac.ts, errorHandler.ts, audit.ts
|       +-- models/    Mongoose models (Customer, Account, Transaction, etc.)
|       +-- routes/    Express routers
|       +-- services/  analyticsService, geminiService, mlClientService
|       +-- scripts/   seed.ts (database seeding)
|       +-- tests/     api.test.ts
|
+-- ml-service/        Python FastAPI ML microservice
|   +-- app/           main.py (predict, simulate, segment endpoints)
|   +-- artifacts/     Trained model files (.joblib) and metadata (.json)
|   +-- training/      train.py (model training script)
|   +-- tests/         test_ml.py
|   +-- data_generator.py
|
+-- data/              Shared seed datasets (JSON)
+-- docs/              Documentation
+-- .env.example       Required environment variables template
+-- docker-compose.yml Docker orchestration (optional)
+-- package.json       Root scripts to run all services
```

---

## Requirements

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 18.x (20 LTS recommended) | For frontend and backend |
| npm | 9.x | Comes with Node.js |
| Python | 3.10, 3.11, or 3.12 | For ML service |
| MongoDB | 6.x or Atlas | Local or cloud |

---

## Environment Setup

### 1. Clone the repository

```bash
git clone <github-url>
cd banking-churn-analytics
```

### 2. Create environment file

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
# MongoDB (required)
MONGODB_URI=mongodb://127.0.0.1:27017/banking_churn_db
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=<app>

# Gemini AI (optional - fallback responses used if not set)
GEMINI_API_KEY=

# JWT secrets (use strong random strings in production)
JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_a_different_long_random_string
```

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Ubuntu/WSL
sudo systemctl start mongod

# macOS with Homebrew
brew services start mongodb-community
```

**Option B: MongoDB Atlas (free tier)**
1. Go to https://cloud.mongodb.com and create a free cluster
2. Create a database user
3. Add your IP to the network access list (or set 0.0.0.0/0 for development)
4. Copy the connection string into `MONGODB_URI` in your `.env`

### 4. Gemini API Setup (optional)

1. Go to https://aistudio.google.com/app/apikey
2. Create a free API key
3. Add it to `GEMINI_API_KEY` in your `.env`

If `GEMINI_API_KEY` is not set, the backend uses built-in rule-based fallbacks for AI summaries. The rest of the application works normally.

---

## Installation

### Install all Node.js dependencies

```bash
# From the project root
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

### Set up Python environment for ML service

```bash
cd ml-service

# Create virtual environment
python3 -m venv .venv

# Activate (Linux/macOS/WSL)
source .venv/bin/activate

# Activate (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

cd ..
```

---

## Seed the Database

After MongoDB is running and `.env` is configured:

```bash
npm run seed
```

This populates:
- 3 RBAC users (admin, analyst, manager)
- 1,200 customers with accounts, transactions, complaints, digital interactions
- Customer features with ML-predicted risk levels
- Customer segments from K-Means clustering
- Model version metadata

**Default login credentials (seeded):**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bank.com | Admin@123 |
| Analyst | analyst@bank.com | Analyst@123 |
| Manager | manager@bank.com | Manager@123 |

---

## Running the Project

### All services at once

```bash
npm run dev
```

This starts ML service, backend, and frontend concurrently with color-coded output.

### Individual services

```bash
# ML service (requires .venv activated in ml-service/)
npm run dev:ml

# Backend
npm run dev:backend

# Frontend
npm run dev:frontend
```

### Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| ML Service | http://localhost:8000 |
| Backend Health | http://localhost:5000/api/health |
| ML Health | http://localhost:8000/health |

---

## Docker (Optional)

Docker runs all four services (MongoDB, ML, Backend, Frontend) together:

```bash
# Start all services
docker compose up --build

# Run in background
docker compose up --build -d

# Stop all services
docker compose down
```

**Note:** The backend JWT secrets and Gemini key must be set in your `.env` file. Docker Compose reads them automatically.

---

## Running Tests

### ML service tests

```bash
cd ml-service
source .venv/bin/activate
python -m pytest tests/ -v
```

### Backend integration tests (requires running MongoDB)

```bash
cd backend
npm test
```

### TypeScript type check

```bash
cd backend
npx tsc --noEmit
```

---

## Training the ML Model

The ML artifacts are already included in `ml-service/artifacts/`. If you want to retrain on new data:

```bash
# Place updated CSV at data/customer_features.csv, then:
npm run train

# Or directly:
cd ml-service
source .venv/bin/activate
python training/train.py
```

---

## Common Errors

### "Cannot connect to MongoDB"
- Check that MongoDB is running: `sudo systemctl status mongod` (local) or verify Atlas cluster is active
- Check that `MONGODB_URI` in `.env` is correct
- For Atlas: verify your IP is in the network access list

### "ML service unavailable" warnings in backend
- This is non-fatal. The backend falls back to a heuristic prediction.
- Start the ML service: `npm run dev:ml`
- Check it is running: `curl http://localhost:8000/health`

### "Token expired" or redirected to login unexpectedly
- Access tokens expire after 15 minutes by default
- The browser redirects to `/login` automatically on expiry

### Frontend shows no data / all zeros
- The database needs to be seeded: `npm run seed`
- Check the backend is running: `curl http://localhost:5000/api/health`
- Check browser Network tab for failed API calls

### `npm run dev` fails with "concurrently not found"
```bash
npm install  # from project root, installs concurrently
```

### ML service fails to import
```bash
cd ml-service
source .venv/bin/activate
pip install -r requirements.txt
```

### Python `ModuleNotFoundError: No module named 'app'`
```bash
# Run from the ml-service directory
cd ml-service
python -m uvicorn app.main:app --reload --port 8000
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | None | Login and receive JWT |
| GET | /api/auth/me | Required | Get current user |
| POST | /api/auth/logout | Required | Logout |
| GET | /api/customers | Required | List customers (paginated, filterable) |
| GET | /api/customers/:id | Required | Customer 360 profile |
| GET | /api/customers/:id/ai-summary | Required | Gemini AI insight |
| GET | /api/analytics/dashboard | Required | Dashboard KPIs and trend |
| GET | /api/analytics/risk | Required | Risk analysis and watchlist |
| GET | /api/analytics/churn | Required | Churn drivers and correlation |
| GET | /api/analytics/segments | Required | Customer segment data |
| GET | /api/analytics/executive-brief | Required | Gemini executive summary |
| GET | /api/recommendations | Required | Retention recommendations |
| POST | /api/simulator/simulate | Required | What-if intervention simulation |
| GET | /api/reports/summary | Required | Executive summary report |
| GET | /api/reports/export/csv | Required | Download risk report CSV |
| GET | /api/admin/users | ADMIN only | List all platform users |
| POST | /api/admin/users | ADMIN only | Create a new user |
| GET | /api/admin/audit | ADMIN only | Audit log entries |
| GET | /api/admin/models | ADMIN only | ML model monitoring |

---

## Troubleshooting

**Fresh install checklist:**
1. `npm install` at root
2. `cd frontend && npm install`
3. `cd backend && npm install`
4. `cd ml-service && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
5. `cp .env.example .env` and fill in `MONGODB_URI` and `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
6. `npm run seed` (MongoDB must be running)
7. `npm run dev`

**If something is broken, check in order:**
1. `curl http://localhost:5000/api/health` - is backend up?
2. `curl http://localhost:8000/health` - is ML service up?
3. Open browser DevTools > Network tab - look for failed requests
4. Check terminal output from `npm run dev` for error messages

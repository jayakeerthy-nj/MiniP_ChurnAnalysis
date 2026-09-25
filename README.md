# Banking Customer Risk & Churn Analytics

**Banking Risk Intelligence** is an enterprise analytics and decision platform for retail banking institutions. It monitors, predicts, and mitigates customer attrition using machine learning, behavioral segmentation, and SHAP explainability.

---

## 1. Project Overview

Retail banks lose significant revenue when customers close accounts or transfer balances to competitors. Traditional rule-based early-warning systems lack the precision to identify and prioritize high-value at-risk customers. 

This platform uses calibrated machine learning models to predict churn probability for every customer, explain the underlying behavioral drivers using SHAP values, and surface prescriptive retention recommendations to relationship managers and risk committees.

---

## 2. Tech Stack

- **Frontend**: **React.js (v18)** + **JavaScript (JSX)** + **Vite** + **Tailwind CSS** + **Recharts** + **Lucide React** (Port `5173`)
- **Backend**: **Node.js** + **Express** + **TypeScript** + **Mongoose** (Port `5000`)
- **ML Service**: **Python** + **FastAPI** + **XGBoost** + **Scikit-Learn** + **SHAP** (Port `8000`)
- **Database**: **MongoDB** (Local or MongoDB Atlas)
- **AI Synthesis**: **Google Gemini API** (invoked exclusively via backend server)

---

## 3. Architecture

```
                                 USERS
                                   |
                                   v
                       +-----------------------+
                       |   REACT FRONTEND      |
                       |   React 18 + Vite     |  Port 5173
                       +-----------+-----------+
                                   | /api/*
                                   v
                       +-----------------------+
                       |    BACKEND SERVER     |
                       | Express + TypeScript  |  Port 5000
                       +---+-------+-------+---+
                           |       |       |
                           v       |       v
                      MongoDB      |   Gemini AI
                    (Mongoose)     |   (via Backend)
                                   v
                       +-----------------------+
                       |   PYTHON ML SERVICE   |
                       |  FastAPI + XGBoost    |  Port 8000
                       |  SHAP + K-Means       |
                       +-----------------------+
```

---

## 4. Repository Structure

```
banking-churn-analytics/
├── frontend/                     # React.js + JavaScript + Vite Application
│   ├── public/
│   │   └── favicon.svg           # Banking Risk Intelligence Favicon
│   ├── src/
│   │   ├── assets/               # Static assets
│   │   ├── components/
│   │   │   ├── layout/           # Sidebar, Header, PageHeader
│   │   │   ├── dashboard/        # KPIGrid, RiskOverview, ChurnTrend, SegmentOverview, HighRiskCustomers
│   │   │   ├── customers/        # CustomerTable, CustomerCard, CustomerRiskBadge
│   │   │   ├── charts/           # ChurnChart, RiskChart, SegmentChart, EngagementChart
│   │   │   └── ui/               # Button, Card, Badge, Modal, Table, Loading
│   │   ├── pages/                # Login, Dashboard, Customers, CustomerDetail, Segments, Risk, ChurnAnalytics, Recommendations, Simulator, Reports, Admin
│   │   ├── services/
│   │   │   └── api.js            # Central Axios API client
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication and session state
│   │   ├── hooks/                # useDebounce, custom utility hooks
│   │   ├── utils/                # formatters (currency, percent, dates, risk levels)
│   │   ├── App.jsx               # React Router routes and Protected Route guards
│   │   ├── main.jsx              # React DOM entry point
│   │   └── index.css             # Dark theme design system tokens
│   ├── index.html                # Vite HTML root
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite bundler & API reverse proxy configuration
│   └── tailwind.config.js        # Dark enterprise theme tokens
│
├── backend/                      # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/               # Database and environment configs
│   │   ├── controllers/          # Business logic controllers
│   │   ├── middleware/           # Auth, RBAC, error handlers
│   │   ├── models/               # Mongoose schemas (Customer, User, AuditLog, etc.)
│   │   ├── routes/               # Express API route declarations
│   │   ├── services/             # ML, Gemini, Customer, and Analytics services
│   │   └── server.ts             # Express server entry point
│   └── package.json
│
├── ml-service/                   # Python + FastAPI Machine Learning Engine
│   ├── app/                      # FastAPI application routes and schemas
│   ├── artifacts/                # Trained XGBoost, scaler, and K-Means models
│   ├── training/                 # Model training and validation pipelines
│   └── requirements.txt
│
├── data/                         # Seed data and dataset definitions
├── package.json                  # Root workspace script orchestrator
└── README.md
```

---

## 5. Security & Role-Based Access Control (RBAC)

The system enforces authentication using JWT tokens and role authorizations:

| Role | Default Email | Password | Permissions |
|------|---------------|----------|-------------|
| **ADMIN** | `admin@bank.com` | `Admin@123` | Full administrative control, Model telemetry, User management, Audit logs, Dataset ingestion |
| **ANALYST** | `analyst@bank.com` | `Analyst@123` | Full analytics access, Customer 360, Segments, Simulator, Recommendations, Reports |
| **MANAGER** | `manager@bank.com` | `Manager@123` | Customer explorer, Customer 360, Watchlists, Retention Playbooks, Reports |

---

## 6. Installation & Setup

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Python**: v3.10+ (for ML service)
- **MongoDB**: Local instance running on `mongodb://localhost:27017/banking_churn` or MongoDB Atlas URI
- **Docker**

### 1. Clone & Install Root Dependencies
```bash
git clone <repo-url>
cd MiniP_ChurnAnalysis
npm install
```

### 2. Configure Environment Variables

**Root / Backend (`backend/.env` or `.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/banking_churn
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
ML_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_optional
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000
```

### 3. Setup Python ML Microservice
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 4. Start Database & Seed Data
Start the MongoDB database container using Docker:
```bash
docker-compose up -d mongodb
```

Seed the database with initial customer records, transactions, and user accounts:
```bash
cd backend
npm install
npm run seed
```

---

## 7. Running the Platform

### Option A: Run All Services Simultaneously
```bash
npm run dev
```
This concurrently starts:
- **ML Service** on `http://localhost:8000`
- **Backend API** on `http://localhost:5000`
- **React Frontend** on `http://localhost:5173`
---

## 8. Build & Verification

To verify full system compilation:
```bash
npm run build
```
This compiles backend TypeScript (`tsc`) and builds the React Vite production bundle (`dist/`).

# Engineering Decision Log

## Purpose

This document records important architectural, technical, product, security, ML, UI, and development decisions made during the evolution of the Banking Customer Risk & Churn Analytics project.

It should be updated whenever an important implementation decision is made.

Do not use this file as a general changelog. A changelog says WHAT changed. This file explains:
- WHAT changed
- WHY it changed
- WHAT alternatives were considered
- WHAT impact it has

---

## DECISION: Microservices Separation of Frontend, Backend, and ML Service

Date:
2026-09-14

Status:
Accepted

Context:
The application requires a modern React interface, a robust API layer for business logic and data persistence, and a Python-based Machine Learning pipeline for model training, SHAP explainability, and inference. Combining these into a single monolithic Node service would limit Python ML capabilities, while putting everything in Python would make React UI rendering and Express middleware complex.

Decision:
Decompose the system into three distinct services:
1. `frontend/`: Next.js 14 App Router, TypeScript, Tailwind CSS
2. `backend/`: Express.js, TypeScript, Mongoose, JWT authentication
3. `ml-service/`: FastAPI, Python, XGBoost, Scikit-learn, SHAP

Reason:
Reason not recoverable from the current codebase. (Inferred to allow leveraging Node/TypeScript ecosystem for web API/frontend and Python ecosystem for ML/SHAP).

Alternatives Considered:
- Monolithic Python application (Django/Flask + templates or embedded Next.js build)
- Single Node.js backend executing Python scripts via child processes

Impact:
Independent deployment, scaling, and dependency isolation for UI, API, and ML services. Service ports standardized to 3000 (Frontend), 5000 (Backend), 8000 (ML Service).

Files Changed:
- `frontend/`
- `backend/`
- `ml-service/`
- `docker-compose.yml`

Testing:
Verified independent service startup and communication across HTTP interfaces.

Notes:
Service boundary strictly forbids direct communication between Frontend and ML Service. All ML requests must pass through Backend proxy endpoints.

---

## DECISION: MongoDB Atlas Selection for Customer and Analytics Data Storage

Date:
2026-09-14

Status:
Accepted

Context:
The project needs a document database capable of storing structured customer risk profiles, transaction histories, segment definitions, model metrics, user credentials, and security audit logs.

Decision:
Adopt MongoDB (Mongoose ORM in Express backend) with MongoDB Atlas cloud database support.

Reason:
Reason not recoverable from the current codebase.

Alternatives Considered:
- Relational SQL Database (PostgreSQL / MySQL)
- Embedded SQLite

Impact:
Flexible document schema allowing dynamic feature sets for churn risk parameters and transactional aggregations without rigid migration scripts.

Files Changed:
- `backend/src/config/database.ts`
- `backend/src/models/Customer.ts`
- `backend/src/models/Transaction.ts`
- `backend/src/models/User.ts`
- `backend/src/models/AuditLog.ts`
- `backend/src/models/Segment.ts`

Testing:
Verified database connection, index creation, seeding via seed script, and aggregation pipelines.

Notes:
Database URI configured via `MONGODB_URI` environment variable.

---

## DECISION: FastAPI for Python ML Inference and Explainability Service

Date:
2026-09-14

Status:
Accepted

Context:
The machine learning pipeline requires an asynchronous, lightweight Python web framework to expose churn prediction models, K-Means customer segmentation, SHAP explainability matrices, and model metrics to the backend.

Decision:
Use FastAPI with Uvicorn ASGI server.

Reason:
Reason not recoverable from the current codebase.

Alternatives Considered:
- Flask
- Django REST Framework

Impact:
High-performance async request handling, automatic OpenAPI schema generation, clean Pydantic request/response validation.

Files Changed:
- `ml-service/app/main.py`
- `ml-service/app/api/endpoints.py`

Testing:
Verified API endpoint contracts using FastAPI TestClient (`pytest`) and direct HTTP verification.

Notes:
Dependencies managed via virtual environment (`venv`).

---

## DECISION: Machine Learning Architecture: XGBoost Churn Model, K-Means Clustering, and SHAP

Date:
2026-09-14

Status:
Accepted

Context:
Banking risk management requires high prediction accuracy for churn forecasting, interpretable feature importance for regulatory and business transparency, and customer segmentation for targeted retention campaigns.

Decision:
1. **Churn Model:** Train and compare Logistic Regression, Random Forest, and XGBoost. Use XGBoost as the production predictor.
2. **Segmentation:** Use K-Means clustering validated by Elbow Method and Silhouette Score.
3. **Explainability:** Compute tree-based SHAP values for individual prediction feature attributions.

Reason:
XGBoost provides superior ROC-AUC and F1 scores on tabular banking datasets; SHAP provides mathematically sound feature contribution values necessary for banking compliance and user trust.

Alternatives Considered:
- Deep Neural Networks (MLP) (lacks intrinsic explainability compared to tree SHAP)
- Single Logistic Regression (insufficient non-linear pattern capture for complex customer behavior)

Impact:
Pre-trained joblib artifacts (`churn_model.joblib`, `kmeans_model.joblib`, `scaler.joblib`, `feature_names.joblib`) serialized and loaded into FastAPI memory at startup.

Files Changed:
- `ml-service/app/services/ml_service.py`
- `ml-service/app/models/`
- `data/`

Testing:
Evaluated precision, recall, F1, ROC-AUC, and verified SHAP waterfall/summary value calculations via unit test suite (`pytest app/tests/test_api.py`).

Notes:
All ML inferences are dynamic and accept what-if parameter variations.

---

## DECISION: Gemini API Integration as Backend Business Intelligence Layer

Date:
2026-09-14

Status:
Accepted

Context:
Users need natural-language executive summaries, customer risk explanations, segment behavior breakdowns, and personalized retention action plans alongside raw quantitative charts and ML outputs.

Decision:
Integrate Google Gemini API exclusively within the backend Node.js service (`backend/src/services/geminiService.ts`). Gemini receives structured JSON data (customer profile, SHAP feature scores, transaction metrics) and returns formatted narrative insights.

Reason:
Reason not recoverable from the current codebase.

Alternatives Considered:
- Direct client-side Gemini SDK calls from frontend React components
- Local LLM deployment (Ollama / HuggingFace)

Impact:
- Absolute security: Gemini API key is never exposed to client browsers (`NEXT_PUBLIC_` prohibited).
- Resilience: If Gemini API key is missing or service is unavailable, backend falls back gracefully to structured fallback recommendations without breaking the UI.

Files Changed:
- `backend/src/services/geminiService.ts`
- `backend/src/controllers/geminiController.ts`
- `backend/src/routes/geminiRoutes.ts`

Testing:
Verified backend fallback output when `GEMINI_API_KEY` is omitted or invalid.

Notes:
Gemini is strictly used as an analytical natural language layer and NEVER generates or overrides quantitative ML predictions or database metrics.

---

## DECISION: Centralized API Interceptor Client in Next.js Frontend

Date:
2026-09-20

Status:
Accepted

Context:
Scattershot `fetch` or `axios` calls across components lead to code duplication, inconsistent authorization header attachment, unhandled token expiration, and hardcoded backend URLs.

Decision:
Create a single centralized Axios client instance (`frontend/src/lib/api.ts`) configured with base URL `/api` (proxied by Next.js rewrites to backend port 5000), automatic Bearer token injection from `localStorage`, and response interceptors handling 401 unauthenticated redirects.

Reason:
Ensures machine independence, centralized URL management, clean authentication state management, and unified error handling.

Alternatives Considered:
- Dispersed `fetch` calls with hardcoded `http://localhost:5000` URLs in individual React components

Impact:
Frontend components import `api` from `@/lib/api` exclusively.

Files Changed:
- `frontend/src/lib/api.ts`
- `frontend/src/stores/authStore.ts`
- `frontend/next.config.mjs`

Testing:
Verified Next.js rewrite routing, token injection, and automatic redirect on 401 unauthorized status.

Notes:
`BACKEND_URL` environment variable configures Next.js dev server rewrite proxy.

---

## DECISION: JWT Authentication, Password Hashing, and Backend Role-Based Access Control (RBAC)

Date:
2026-09-14

Status:
Accepted

Context:
Enterprise banking applications require authentication and granular permissions based on user roles (`ADMIN`, `ANALYST`, `MANAGER`).

Decision:
Implement JWT authentication (Access & Refresh tokens) with bcrypt password hashing. Enforce access permissions on Express backend routes via `requireRole` middleware.

Reason:
Reason not recoverable from the current codebase.

Alternatives Considered:
- Session-cookie authentication
- Third-party OAuth (Auth0 / Firebase)

Impact:
Stateless authentication across REST endpoints. Route protection enforced server-side.

Files Changed:
- `backend/src/middleware/authMiddleware.ts`
- `backend/src/controllers/authController.ts`
- `backend/src/services/authService.ts`
- `backend/src/routes/authRoutes.ts`

Testing:
Tested role enforcement via integration test suite (`tsx --test src/tests/api.test.ts`), verifying 401 Unauthorized for missing tokens and 403 Forbidden for insufficient roles.

Notes:
Universal password bypasses and auto-login fallbacks were explicitly removed during security cleanup on 2026-09-20.

---

## DECISION: Database-Driven Monthly Analytics Aggregation Pipeline

Date:
2026-09-20

Status:
Accepted

Context:
Previously, the backend `analyticsService.ts` generated monthly analytics trends using hardcoded mathematical functions (sine/cosine curves), violating the core project mandate against fake metrics.

Decision:
Replace synthetic trend calculations with a native MongoDB aggregation pipeline querying the `Transaction` collection, grouped by calendar year and month.

Reason:
Adheres strictly to Rule 13 ("NO FAKE DATA"). Ensures all dashboard visualizations display verified database transaction metrics.

Alternatives Considered:
- Keeping mathematical functions as fallback when database is empty
- Client-side calculation from raw transaction arrays

Impact:
Dashboard monthly trend charts accurately reflect historical transaction data stored in MongoDB Atlas.

Files Changed:
- `backend/src/services/analyticsService.ts`

Testing:
Verified aggregation response against live seeded MongoDB Atlas database via API verification script (`scratch/test_apis.py`).

Notes:
Aggregation falls back gracefully to empty month buckets if no transactions exist in a date range.

---

## DECISION: Auth Store and API Interceptor Security Hardening

Date:
2026-09-20

Status:
Accepted

Context:
Audit revealed hardcoded admin credentials in `frontend/src/lib/api.ts` (silently logging in as admin) and universal password bypass checks in `frontend/src/stores/authStore.ts` (`pass === "demo" || pass === "123456"`).

Decision:
1. Removed all hardcoded auto-login requests from `api.ts`; added 401 interceptor redirect to `/login`.
2. Removed universal password string checks from `authStore.ts`.
3. Updated `initAuth()` to validate existing access tokens against backend `GET /api/auth/me` on app load.

Reason:
Eliminates critical security flaws and ensures true JWT authentication enforcement across the application.

Alternatives Considered:
- Retaining hardcoded credentials for "demo mode"

Impact:
Users must authenticate with valid database credentials (`admin@bank.com`, `analyst@bank.com`, etc.).

Files Changed:
- `frontend/src/lib/api.ts`
- `frontend/src/stores/authStore.ts`

Testing:
Verified invalid token handling and successful login flow with hashed database credentials.

Notes:
Documented standard user credentials in `README.md` and `.env.example`.

---

## DECISION: Machine-Independent Configuration Strategy via Environment Variables

Date:
2026-09-20

Status:
Accepted

Context:
Hardcoded paths and missing `.env.example` templates made cloning and executing on alternative developer machines error-prone.

Decision:
1. Standardize all machine configuration using root and frontend `.env.example` files.
2. Ensure backend, frontend, and ML service read dynamic environment variables (`PORT`, `MONGODB_URI`, `BACKEND_URL`, `ML_SERVICE_URL`).
3. Add `ml-service/app/__init__.py` to enable standard Python module importing across environments.

Reason:
Adheres to Rule 7 ("MACHINE INDEPENDENCE") and Rule 8 ("ENVIRONMENT VARIABLES"). Allows frictionless `git clone` and local execution.

Alternatives Considered:
- Relying on hardcoded local defaults in source code

Impact:
Developer onboarding reduced to cloning, copying `.env.example` to `.env`, and executing standard startup scripts.

Files Changed:
- `.env.example`
- `frontend/.env.example`
- `ml-service/app/__init__.py`
- `.gitignore`
- `README.md`

Testing:
Executed comprehensive 14-point machine verification test script (`scratch/verify.py`), passing all environment and build assertions.

Notes:
`.env` is explicitly gitignored.

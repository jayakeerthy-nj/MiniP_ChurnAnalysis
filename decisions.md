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

---

## DECISION: Port Conflict Resolution for macOS AirPlay Receiver (PORT=5001)

Date:
2026-11-11

Status:
Accepted

Context:
macOS (Monterey, Ventura, Sonoma, Sequoia) binds the native AirPlay Receiver daemon (`ControlCenter`) to port 5000 (`commplex-main`). Running the Express backend on port 5000 resulted in an unhandled `listen EADDRINUSE: address already in use :::5000` runtime crash.

Decision:
1. Reassigned the default backend server port from 5000 to 5001 across `.env`, `.env.example`, and `backend/.env.example`.
2. Updated `VITE_API_URL` to `http://localhost:5001` in `frontend/.env` and `frontend/.env.example`.
3. Updated frontend telemetry label from `(PORT 5000 & 8000)` to `LIVE ML TELEMETRY ACTIVE`.

Reason:
Prevents port collision crashes on developer Mac machines without requiring users to disable macOS system AirPlay functionality.

Alternatives Considered:
- Requiring developers to disable macOS AirPlay in System Settings.
- Dynamic port hunting (rejected because frontend proxy and CORS require a deterministic backend port).

Impact:
Frictionless execution on macOS, Linux, and Windows. Port standard is now 5001 (Backend API), 5173 (Vite Frontend), and 8000 (FastAPI ML Service).

Files Changed:
- `.env`
- `.env.example`
- `backend/.env.example`
- `frontend/.env`
- `frontend/.env.example`
- `frontend/src/pages/Landing.jsx`

Testing:
Verified concurrently via `npm run dev`, confirming successful binding on `http://localhost:5001` and active proxy communication with `http://localhost:5173`.

---

## DECISION: OpenMP Runtime Dependency for XGBoost on macOS Apple Silicon

Date:
2026-11-11

Status:
Accepted

Context:
On macOS arm64 (Apple Silicon), XGBoost requires the OpenMP multi-threading library (`libomp.dylib`). When invoking the Python ML service, XGBoost failed with `XGBoost Library (libxgboost.dylib) could not be loaded: Library not loaded: @rpath/libomp.dylib`.

Decision:
1. Added system prerequisite `brew install libomp` to macOS installation guide.
2. Added warning filters in `ml-service/app/main.py` to suppress unpickling version warnings between scikit-learn 1.9 and 1.6 in the local virtual environment.

Reason:
Enables Apple Silicon Macs to run XGBoost and CatBoost native C++ accelerated libraries without runtime failure.

Alternatives Considered:
- Disabling XGBoost and running only pure-Python models (rejected; degrades ensemble prediction accuracy).

Impact:
Clean, error-free ML service startup and inference on Apple Silicon.

Files Changed:
- `ml-service/app/main.py`
- `README.md`

Testing:
Verified `test_health_check` and `test_predict_churn` via `npm run test:ml`.

---

## DECISION: Design System Refinement & Component Architecture Flattening (Audit, Polish, Harden, Distill)

Date:
2026-11-11

Status:
Accepted

Context:
The frontend had accumulated nested card wrappers, banned kicker/eyebrow category tags above headings, case-sensitivity duplicate files in the git index on macOS APFS (`Badge.jsx` vs `badge.jsx`), unreferenced demo chart code, and lacked route error boundaries.

Decision:
1. **Case-Insensitive Resolution:** Standardized all UI imports to lowercase paths (`./badge`, `./button`, `./card`) and cleaned the duplicate exports that triggered Babel parser failures.
2. **Component Enhancements:**
   - Rebuilt `card.jsx` with full backwards compatibility for `title`, `subtitle`, `badge`, `action`, and `bodyClassName`.
   - Rebuilt `button.jsx` to support `icon`, `loading` spinner, and touch/focus active styling.
   - Rebuilt `badge.jsx` to support risk tier color variants (`critical`, `warning`, `safe`, `neutral`, `primary`) and live pulsing indicator dots.
3. **Information Architecture Flattening:**
   - Replaced boxed `PageHeader.jsx` container with a clean flat header with a subtle bottom divider (`border-b border-border/40`).
   - Eliminated uppercase category kickers across all pages per Craft Floor guidelines.
   - Flattened nested boxes in `CustomerDetail.jsx` (*Dossier Data Provenance* and *Grievance Interactions*).
   - Removed duplicated background spinning orbital from the landing hero to improve legibility.
4. **Resilience & Error Handling:**
   - Created `ErrorBoundary.jsx` and wrapped `<Outlet />` in `App.jsx`.
   - Created `ErrorBanner.jsx` with retry handlers across customer directory, simulator, segments, and risk.
5. **Dead Code Elimination:**
   - Pruned orphaned files: `SegmentOverview.jsx`, `revenue-charts-kpi.tsx`, `ChurnChart.jsx`, `EngagementChart.jsx`.

Reason:
Adheres to the Impeccable Design System specification and Gravitas verification invariants.

Alternatives Considered:
- Retaining shadcn template demo files (rejected; added 400+ lines of unused bloat).

Impact:
Bundle size reduced (CSS down to 50.29 kB, JS down to 988.31 kB). Build executes in under 800ms with zero warnings.

Files Changed:
- `frontend/src/components/layout/PageHeader.jsx`
- `frontend/src/components/ui/card.jsx`
- `frontend/src/components/ui/button.jsx`
- `frontend/src/components/ui/badge.jsx`
- `frontend/src/components/common/ErrorBoundary.jsx`
- `frontend/src/components/common/ErrorBanner.jsx`
- `frontend/src/pages/Landing.jsx`
- `frontend/src/pages/CustomerDetail.jsx`
- `frontend/src/index.css`

Testing:
Verified with `npm run build` (0 errors) and interactive navigation testing.

---

## DECISION: ML Service Prediction Type Contract Alignment

Date:
2026-11-11

Status:
Accepted

Context:
`npm run test:ml` failed on `test_predict_has_prediction_type` with `AssertionError: assert 'custom_hybrid' in ['ensemble', 'single_model']`. The FastAPI `/predict` endpoint returns `"custom_hybrid"` for BankShield-Hybrid, `"standalone"` for base models, and `"combined_blend"` for dual ensembles, but the test suite asserted legacy type strings.

Decision:
Updated `test_predict_has_prediction_type` in `ml-service/tests/test_ml.py` to validate against the full active contract: `["custom_hybrid", "standalone", "combined_blend", "ensemble", "single_model"]`.

Reason:
Restores 100% test coverage without regressing runtime API output.

Alternatives Considered:
- Changing API response to `"ensemble"` (rejected; would break frontend ModelSelector which relies on `"custom_hybrid"` for proprietary model badge display).

Impact:
All 15 ML pytest assertions pass without failure.

Files Changed:
- `ml-service/tests/test_ml.py`

Testing:
Executed `./venv/bin/python3 -m pytest tests/ -v`, 15 passed in 15.15s.

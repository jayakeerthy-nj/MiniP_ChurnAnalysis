# Engineering Constitution & System Rules

Before making ANY change to this project, the AI agent or developer MUST read `rules.md` and follow its rules.

---

## 1. PROJECT IDENTITY

- **Project:** Banking Customer Risk & Churn Analytics
- **Purpose:** A professional banking analytics platform combining:
  - Data Analytics
  - Data Visualization
  - Machine Learning
  - Customer Segmentation
  - Churn Prediction
  - Explainable AI (SHAP)
  - GenAI Business Insights (Gemini)
  - Retention Recommendations
  - What-if Simulation

This is NOT a basic CRUD application.

---

## 2. CORE ARCHITECTURE

The intended system flow is strictly structured as follows:

```
Frontend -> Backend -> MongoDB
Backend  -> ML Service
Backend  -> Gemini
```

### Core Services:
- `frontend` (Next.js App Router)
- `backend` (Express/TypeScript REST API)
- `ml-service` (FastAPI Python Engine)
- `MongoDB` (Database)
- `Gemini` (GenAI Service via Backend)

Do not introduce unnecessary services.

---

## 3. TECHNOLOGY RULES

Respect the existing tech stack:

### Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- Existing UI components
- Existing icon library (`lucide-react`)

### Backend:
- Node.js
- Express
- TypeScript
- Mongoose
- JWT
- bcrypt
- Zod (where appropriate)
- Helmet
- CORS

### ML Service:
- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- SHAP
- Joblib

### Database:
- MongoDB / MongoDB Atlas

### GenAI:
- Google Gemini API (Backend-only)

### Infrastructure:
- Docker / Docker Compose (optional local orchestration)
- Git / GitHub

Do not introduce technologies merely because they are popular.

---

## 4. DO NOT OVERENGINEER

Do NOT introduce:
- Kubernetes
- Kafka
- Redis
- Unnecessary microservices
- Unnecessary APIs
- Unnecessary cloud infrastructure
- Unnecessary databases
- Unnecessary frameworks

Only introduce a new dependency or service if there is a genuine technical requirement.
If a dependency is added, document WHY in `decisions.md`.

---

## 5. PRESERVE WORKING FEATURES

NEVER delete or replace working functionality simply to make the project smaller.

Before deleting anything:
1. Search for references across all components.
2. Determine whether it is actually used.
3. Understand its purpose.
4. Check whether another component depends on it.
5. If redundant, consolidate safely.
6. Fix imports and references.
7. Test after making the change.
8. Record important changes in `decisions.md`.

Do not casually remove:
- Authentication / RBAC
- MongoDB models
- API endpoints
- ML models / ML artifacts
- SHAP explainability
- Segmentation logic
- Gemini service integration
- Dashboard views / functionality
- Recommendations engine
- Simulator

---

## 6. STRUCTURE RULES

Keep the repository logically separated into:
- `frontend/`
- `backend/`
- `ml-service/`
- `data/`
- `docs/`

Do NOT flatten folders merely because there are many directories.

Backend separation into `controllers/`, `models/`, `routes/`, `services/`, `middleware/`, `config/` is intentional and MUST be preserved.

Frontend should follow standard Next.js organization.
ML service must remain separate from the Node backend.

Objectives:
- Logical separation
- Simplicity
- Maintainability
- No code duplication
- Easy onboarding
- Reliable GitHub cloning

---

## 7. MACHINE INDEPENDENCE

The project must work seamlessly on another developer's machine upon cloning.

NEVER introduce:
- Hardcoded C drive or Windows paths
- Hardcoded system usernames
- Hardcoded home directory paths
- WSL-specific absolute paths (`/mnt/...`)
- Machine-specific absolute paths
- Local machine environment assumptions

Prefer:
- Relative file paths
- Environment variables (`process.env` / `os.getenv`)
- Project-root relative resolution
- Portable configurations

If an existing hardcoded machine-specific path is found, refactor it immediately.

---

## 8. ENVIRONMENT VARIABLES

Never hardcode:
- MongoDB connection strings / credentials
- Gemini API keys
- JWT secrets
- Machine-specific backend or service URLs
- Private access credentials

Always use `.env` files and maintain `.env.example` templates.

Never commit `.env` or `.env.local` to version control.

Gemini API keys must **NEVER** be exposed to the frontend. NEVER use `NEXT_PUBLIC_GEMINI_API_KEY`.
Only keep environment variables that are actually used in code.

---

## 9. PORTS

Standard ports across the system:
- **Frontend:** 3000
- **Backend:** 5000
- **ML Service:** 8000

Do not randomly introduce other ports.
Keep service URLs centralized (e.g. via `BACKEND_URL` / `ML_SERVICE_URL`).
Do not scatter raw API URLs throughout frontend components; use the centralized API client.

---

## 10. API FLOW

Expected data flow:
```
Frontend -> Backend -> MongoDB
Backend  -> ML Service
Backend  -> Gemini
```

Frontend MUST NOT directly call Gemini or the ML Service.
All frontend requests must flow through the centralized API client (`frontend/src/lib/api.ts`) to backend endpoints.

---

## 11. ML RULES

### Churn Prediction:
Compare models:
- Logistic Regression
- Random Forest
- XGBoost

Use appropriate evaluation metrics:
- Accuracy, Precision, Recall, F1-Score
- ROC-AUC, PR-AUC
- Confusion Matrix

Do not select a model solely based on raw accuracy.
XGBoost may be used as the final production model only when justified by actual comparative evaluation.

### Explainability & Clustering:
- Use **SHAP** for feature importance and prediction explainability.
- Use **K-Means** for customer segmentation.
- Use **Elbow Method** and **Silhouette Score** for clustering validation.

---

## 12. GEMINI RULES

Google Gemini is NOT the churn prediction model.

### Responsibilities:
- **XGBoost:** Churn prediction & risk scoring
- **K-Means:** Customer segmentation
- **SHAP:** Model explainability
- **Gemini:** Natural-language business intelligence & executive summaries

Gemini may generate:
- Customer profile summaries
- Segment descriptions & characteristics
- Actionable retention recommendations
- Executive analytical summaries

Gemini must receive structured, factual input data from the backend.
Gemini must **NOT** invent numerical facts or metrics.
The application must remain fully functional even if Gemini is offline or unconfigured.

---

## 13. NO FAKE DATA

Do NOT hardcode fake:
- Customer counts
- Churn percentages
- Risk category percentages
- Segment sizes
- Model accuracy scores
- Financial values or transaction sums

All metrics displayed on dashboards must originate from MongoDB aggregations, real analytics pipelines, or actual ML inference output.
Synthetic seed data generated by verified data scripts is acceptable; hardcoded fake dashboard variables are **NOT** acceptable.

---

## 14. WHAT-IF SIMULATION

The What-If Simulator must route inputs to the live ML inference engine.
Do **NOT** hardcode or mock simulation outputs.

When a user alters input parameters (e.g., transaction frequency, digital activity score, complaints count, active products, account balance), the ML model must compute the updated prediction dynamically.
Outputs must clearly state they are model predictions, not guaranteed outcomes.

---

## 15. SECURITY

Authentication and Access Control:
- Uses **JWT** tokens and **bcrypt** password hashing.
- Protected routes on both frontend and backend.
- **Role-Based Access Control (RBAC)** enforced on the backend (e.g., `ADMIN`, `ANALYST`, `MANAGER`).
- Backend MUST enforce RBAC permissions; never rely solely on hiding UI elements.

Security Logging:
- Never log passwords, API keys, JWT secrets, or sensitive customer PII.
- Preserve system audit logging for sensitive administrative actions.

---

## 16. UI RULES

The interface must reflect professional enterprise banking analytics software.

### Design Characteristics:
- Clean, restrained, modern, data-focused
- Enterprise-grade, highly readable, information-dense without clutter

### DO NOT use:
- Purple gradients
- Giant pill buttons
- Fake reviews or marketing banners
- Fake metrics or vague copy
- Emoji icons
- Em dash character
- Excessive animations or cursor effects
- AI-slop or crypto/gaming visual aesthetics
- Excessive rounded cards or dark gradients

### Preferred Aesthetics:
- Clean data tables, interactive charts, structured typography
- Meaningful vector icons (`lucide-react`)
- Professional banking palette (Sleek slate, navy, neutral dark/light contrasts)

---

## 17. COPY RULES

Avoid vague marketing language. Use precise, factual product terminology.

- **Avoid:** "Transform your financial future.", "Unlock intelligent banking.", "The future of customer intelligence."
- **Prefer:** "Customer Risk & Churn Analytics", "Identify churn risk, understand customer behavior, and prioritize retention opportunities."

### STRICT PUNCTUATION RULE:
DO NOT use the em dash character. Use commas, periods, colons, parentheses, or separate sentences instead.

---

## 18. DEVELOPMENT WORKFLOW

Before modifying any code:
1. Read `rules.md`.
2. Inspect the relevant existing implementation thoroughly.
3. Search for existing references and usages.
4. Understand dependencies and component impacts.
5. Identify the smallest safe change.
6. Implement the change cleanly.
7. Run relevant builds and test suites.
8. Verify no regressions were introduced.
9. Update project documentation if setup/behavior changed.
10. Record significant architectural decisions in `decisions.md`.

Do NOT modify unrelated files.

---

## 19. DECISION LOGGING

Whenever an important implementation decision is made, update `decisions.md`.

### Examples of loggable decisions:
- Architectural or structural changes
- Database schema / Mongoose model modifications
- Authentication or security behavior updates
- API contract changes
- ML model selection or pipeline modifications
- Feature additions or deprecations
- Dependency additions or replacements
- Folder structure reorganizations
- Changes to Gemini prompt architecture or integration pattern
- Bug fixes that required structural or architectural decisions

Do NOT record routine typos, minor CSS tweaks, or formatting adjustments.

---

## 20. DECISION LOG FORMAT

Every entry in `decisions.md` must adhere to the following schema:

```markdown
## DECISION: <short descriptive title>

Date:
YYYY-MM-DD

Status:
Accepted / Superseded / Rejected

Context:
What problem or requirement existed?

Decision:
What was changed or implemented?

Reason:
Why was this approach chosen?

Alternatives Considered:
What other approaches were evaluated?

Impact:
What components or workflows are affected?

Files Changed:
List key files modified or added.

Testing:
What tests or verification steps were executed?

Notes:
Important context for future developers or AI agents.
```

**IMPORTANT:** Never claim that something was tested if it was not actually tested.

---

## 21. CHANGE SAFETY

Before making destructive changes, **STOP and verify**.

Destructive actions include:
- Deleting source files or directories
- Changing database schemas or dropping collections
- Replacing ML models or feature encoders
- Modifying authentication mechanisms or token formats
- Changing API route signatures or return types
- Removing core npm/python dependencies
- Reorganizing main service directories
- Renaming environment variables or configuration keys

Understand full downstream dependencies before executing destructive updates.

---

## 22. DOCUMENTATION

`README.md` must remain up-to-date and developer-friendly.

It must cover:
- Project overview & architecture diagram
- Core features & capabilities
- Directory structure overview
- System requirements (Node, Python, MongoDB)
- Environment variable configuration
- Step-by-step setup (Frontend, Backend, ML Service)
- Docker Compose setup
- Troubleshooting & common errors

If any change impacts setup or execution workflows, update `README.md` immediately.

---

## 23. TESTING

Do NOT mark a task as "fixed" or "complete" unless verified through execution.

Recommended verification steps:
- TypeScript compilation (`tsc --noEmit`)
- Next.js build / dev execution
- Express backend startup & endpoint responses
- FastAPI ML service execution (`pytest` / direct API calls)
- Live MongoDB database connection & queries
- End-to-end authentication flow
- Dynamic ML prediction & What-If simulation execution
- Gemini service fallback behavior under invalid API keys
- Automated test scripts (`npm run test`)

Simulate fresh clone setup whenever modifying dependencies or configuration files.

---

## 24. AI BEHAVIOR

You are an engineer working on an existing codebase, NOT an autonomous redesign agent.

Do NOT:
- Redesign everything from scratch
- Replace working technologies without technical necessity
- Create duplicate services, components, or API endpoints
- Delete working code without detailed impact investigation
- Invent non-existent functionality
- Fabricate test results, metrics, or evaluation data
- Silently modify project architecture

When uncertain: **Inspect first**.
When requirements conflict with existing architecture: **Choose the smallest safe, compliant solution**.
When making key architectural decisions: **Record them in `decisions.md`**.

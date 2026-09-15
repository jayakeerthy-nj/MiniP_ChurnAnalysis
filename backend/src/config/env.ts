import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/banking_churn_db",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "aegis_super_secret_access_jwt_key_2026",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "aegis_super_secret_refresh_jwt_key_2026",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
  ML_SERVICE_API_KEY: process.env.ML_SERVICE_API_KEY || "aegis_ml_internal_key",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ""
};

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY is not set. Generative AI summaries will use realistic rule-based fallback responses.");
}

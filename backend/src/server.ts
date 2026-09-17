import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { authRouter } from "./routes/authRoutes.js";
import { customerRouter } from "./routes/customerRoutes.js";
import { analyticsRouter } from "./routes/analyticsRoutes.js";
import { recommendationRouter } from "./routes/recommendationRoutes.js";
import { simulatorRouter } from "./routes/simulatorRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";

const app = express();

// Security headers & CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any localhost origin in dev
      if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"]
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Minimal cookie parser middleware
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      const name = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      req.cookies[name] = decodeURIComponent(val);
    });
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." }
});
app.use("/api/", limiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Banking Customer Risk & Churn Analytics API",
    version: "1.0.0"
  });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/simulator", simulatorRouter);
app.use("/api/reports", reportRouter);
app.use("/api/admin", adminRouter);

// Global error handler
app.use(errorHandler);

const PORT = ENV.PORT;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Banking Customer Risk & Churn Analytics API listening on http://localhost:${PORT}`);
    console.log(`Authentication & RBAC active (Roles: ADMIN, ANALYST, MANAGER)`);
  });
}

startServer();

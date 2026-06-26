import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import { getPool, closePool } from "./config/database.js";
import { httpLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { apiKeyAuth } from "./middleware/auth.js";
import { swaggerSpec } from "./swagger/swagger.js";

import glRoutes from "./routes/gl.js";
import arRoutes from "./routes/ar.js";
import apRoutes from "./routes/ap.js";
import salesRoutes from "./routes/sales.js";
import stockRoutes from "./routes/stock.js";

import logger from "./middleware/logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-API-Key", "Authorization"],
  })
);

app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

// ─── Request processing ───────────────────────────────────────────────────────
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(httpLogger());

// ─── Health check (no auth required) ─────────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    res.json({ success: true, message: "API is healthy.", database: "connected" });
  } catch {
    res.status(503).json({ success: false, message: "Database unreachable.", database: "error" });
  }
});

// ─── Swagger (no auth required) ──────────────────────────────────────────────
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "AutoCount REST API",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerSpec);
});

// ─── API routes (protected) ───────────────────────────────────────────────────
app.use("/api", apiKeyAuth);
app.use("/api/gl", glRoutes);
app.use("/api/ar", arRoutes);
app.use("/api/ap", apRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/stock", stockRoutes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Boot ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await getPool();
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Swagger UI:  http://localhost:${PORT}/api-docs`);
      logger.info(`Health:      http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Closing server...");
  await closePool();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received. Closing server...");
  await closePool();
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

start();

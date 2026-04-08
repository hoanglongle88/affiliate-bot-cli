/**
 * Affiliate Bot API Server + Web Dashboard
 *
 * Usage:
 *   npm run server          # Start API server
 *   npm run server -- --port 4000  # Custom port
 *
 * Web Dashboard: http://localhost:3000 (proxied to Vite in dev)
 * API: http://localhost:3000/api/*
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import { swaggerSpec } from "./swagger";
import scriptsRouter from "./api/routes/scripts";
import captionsRouter from "./api/routes/captions";
import productsRouter from "./api/routes/products";
import trendsRouter from "./api/routes/trends";
import historyRouter from "./api/routes/history";
import shortRouter from "./api/routes/short";
import imageRouter from "./api/routes/image";
import statsRouter from "./api/routes/stats";

const app = express();

// ── Rate Limiting ──

// General API: 100 req/5min
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: { error: "Quá nhiều yêu cầu. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI-heavy endpoints: 10 req/5min (tốn API credits)
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: "Bạn đã đạt giới hạn AI. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(generalLimiter); // Apply global rate limit

// Swagger API docs
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Affiliate Bot API",
    customCss: ".swagger-ui .topbar { display: none }",
  }),
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/scripts", aiLimiter, scriptsRouter); // AI endpoints — strict limit
app.use("/api/captions", aiLimiter, captionsRouter); // AI endpoints
app.use("/api/products", productsRouter); // Products — route-level limiters applied
app.use("/api/trends", aiLimiter, trendsRouter); // AI endpoints
app.use("/api/history", historyRouter);
app.use("/api/short", aiLimiter, shortRouter); // AI endpoints
app.use("/api/image", aiLimiter, imageRouter); // AI endpoints
app.use("/api/stats", statsRouter);

// Serve web dashboard in production
const webDist = path.join(__dirname, "../web/dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

// 404 handler for API
app.use(/^\/api\/(.*)/, (_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[API Error]", err.message);
    res.status(500).json({ error: "Internal server error" });
  },
);

export default app;

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
import path from "path";
import fs from "fs";
import scriptsRouter from "./api/routes/scripts";
import captionsRouter from "./api/routes/captions";
import productsRouter from "./api/routes/products";
import trendsRouter from "./api/routes/trends";
import historyRouter from "./api/routes/history";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/scripts", scriptsRouter);
app.use("/api/captions", captionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/trends", trendsRouter);
app.use("/api/history", historyRouter);

// Serve web dashboard in production
const webDist = path.join(__dirname, "../web/dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

// 404 handler for API
app.use("/api/*", (_req, res) => {
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

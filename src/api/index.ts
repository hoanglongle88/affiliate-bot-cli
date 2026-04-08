import express from "express";
import cors from "cors";
import scriptsRouter from "./routes/scripts";
import captionsRouter from "./routes/captions";
import productsRouter from "./routes/products";
import trendsRouter from "./routes/trends";
import historyRouter from "./routes/history";

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

// Routes
app.use("/api/scripts", scriptsRouter);
app.use("/api/captions", captionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/trends", trendsRouter);
app.use("/api/history", historyRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[API Error]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

export default app;

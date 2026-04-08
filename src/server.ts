/**
 * Affiliate Bot API Server
 *
 * Usage:
 *   npm run server          # Start API server
 *   npm run server -- --port 4000  # Custom port
 */

import dotenv from "dotenv";
dotenv.config();

import app from "./api";

const PORT = parseInt(process.env.API_PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`\n🚀 Affiliate Bot API Server`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
  console.log("Available endpoints:");
  console.log(`  POST   /api/scripts       - Create video script`);
  console.log(`  POST   /api/captions      - Create caption/description`);
  console.log(`  GET    /api/products      - List all products`);
  console.log(`  POST   /api/products      - Create product`);
  console.log(`  DELETE /api/products/:id  - Delete product`);
  console.log(`  POST   /api/trends/scan   - Scan trend`);
  console.log(`  GET    /api/history       - List history`);
  console.log(`  DELETE /api/history/:id   - Delete history entry\n`);
});

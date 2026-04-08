/**
 * Entry point to start the API server
 */
import app from "./server";

const PORT = parseInt(process.env.API_PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`\n🚀 Affiliate Bot API Server`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`🌐 Web Dashboard: http://localhost:5173 (dev) or http://localhost:${PORT} (prod)\n`);
  console.log("Available API endpoints:");
  console.log(`  POST   /api/scripts       - Create video script`);
  console.log(`  POST   /api/captions      - Create caption/description`);
  console.log(`  GET    /api/products      - List all products`);
  console.log(`  POST   /api/products      - Create product`);
  console.log(`  DELETE /api/products/:id  - Delete product`);
  console.log(`  POST   /api/trends/scan   - Scan trend`);
  console.log(`  GET    /api/history       - List history`);
  console.log(`  DELETE /api/history/:id   - Delete history entry`);
  console.log(`  GET    /api/health        - Health check\n`);
});

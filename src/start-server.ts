/**
 * Entry point to start the API server
 */
import app from "./server";

const PORT = parseInt(process.env.API_PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`\n🚀 Affiliate Bot API Server v2.1.0`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(
    `🌐 Web Dashboard: http://localhost:5173 (dev) or http://localhost:${PORT} (prod)`,
  );
  console.log(`📖 API Docs (Swagger): http://localhost:${PORT}/api/docs\n`);
});

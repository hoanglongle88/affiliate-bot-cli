import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { AutonomousTrendScanner } from "../../agents/trend-scanner";
import {
  saveProduct,
  saveTrendBrief,
  saveToHistoryWithRefs,
} from "../../data/storage";
import { getNicheById } from "../../config/niches";

const router = Router();

// Trend scan limiter — 5 req/5min (web search rất tốn tài nguyên)
const trendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: "Quá nhiều lần scan. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

interface TrendScanRequest {
  nicheId?: string;
}

/**
 * POST /api/trends/scan — Scan trend with optional niche
 * Fix: properly resolve nicheId instead of always passing undefined
 */
router.post(
  "/scan",
  trendLimiter,
  async (req: Request<{}, {}, TrendScanRequest>, res: Response) => {
    try {
      const { nicheId } = req.body;

      // Resolve niche config from ID
      const niche = nicheId ? getNicheById(nicheId) : undefined;

      const scanner = new AutonomousTrendScanner();
      const { brief, product } = await scanner.scanAndGenerate(niche);

      // Save product + trend brief
      const savedProduct = await saveProduct(product);
      const savedBrief = await saveTrendBrief(brief, savedProduct.id);

      // Save to history (trend workflow)
      await saveToHistoryWithRefs(savedProduct.id, null, null, "trend");

      res.json({
        brief,
        product,
        productId: savedProduct.id,
        trendId: savedBrief.id,
        message: "Trend scan complete",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;

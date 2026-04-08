import { Router, Request, Response } from "express";
import {
  getProducts,
  getHistory,
  getVideoScripts,
  getPostDescriptions,
  getTrendBriefs,
  getShortVideoPrompts,
  getImageBriefs,
} from "../../data/storage";

const router = Router();

// GET /api/stats - Dashboard stats
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [products, history, scripts, descriptions, trends, shorts, images] =
      await Promise.all([
        getProducts(),
        getHistory(),
        getVideoScripts(1),
        getPostDescriptions(1),
        getTrendBriefs(1),
        getShortVideoPrompts(1),
        getImageBriefs(1),
      ]);

    res.json({
      totalProducts: products.length,
      totalScripts: scripts.length,
      totalDescriptions: descriptions.length,
      totalTrends: trends.length,
      totalShorts: shorts.length,
      totalImages: images.length,
      totalHistory: history.length,
      historyByWorkflow: history.reduce(
        (acc: Record<string, number>, h: any) => {
          acc[h.workflow] = (acc[h.workflow] || 0) + 1;
          return acc;
        },
        {},
      ),
      recentProducts: products.slice(0, 5),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { supabase } from "../../services/supabase-client";

const router = Router();

// Simple in-memory cache (TTL 10 seconds)
let cachedStats: any = null;
let cacheExpiry = 0;

const CACHE_TTL = 10_000; // 10 seconds

// GET /api/stats - Dashboard stats (optimized with cached count queries)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const now = Date.now();

    // Return cached stats if fresh
    if (cachedStats && now < cacheExpiry) {
      console.log("[API] GET /api/stats - returning cached stats");
      res.json(cachedStats);
      return;
    }

    console.log("[API] GET /api/stats - computing fresh stats...");

    // Use count queries (head: true = only count, no data)
    const [
      { count: totalProducts },
      { count: totalScripts },
      { count: totalDescriptions },
      { count: totalTrends },
      { count: totalShorts },
      { count: totalImages },
      { count: totalHistory },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("video_scripts")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("post_descriptions")
        .select("*", { count: "exact", head: true }),
      supabase.from("trend_briefs").select("*", { count: "exact", head: true }),
      supabase
        .from("short_video_prompts")
        .select("*", { count: "exact", head: true }),
      supabase.from("image_briefs").select("*", { count: "exact", head: true }),
      supabase.from("history").select("*", { count: "exact", head: true }),
    ]);

    const result = {
      totalProducts: totalProducts || 0,
      totalScripts: totalScripts || 0,
      totalDescriptions: totalDescriptions || 0,
      totalTrends: totalTrends || 0,
      totalShorts: totalShorts || 0,
      totalImages: totalImages || 0,
      totalHistory: totalHistory || 0,
    };

    // Cache for 10 seconds
    cachedStats = result;
    cacheExpiry = now + CACHE_TTL;

    console.log(`[API] GET /api/stats - returning:`, JSON.stringify(result));

    res.json(result);
  } catch (error: any) {
    console.error("[API] GET /api/stats - error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

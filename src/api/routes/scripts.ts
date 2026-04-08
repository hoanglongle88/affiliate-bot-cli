import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { VideoCreatorAgent } from "../../agents/video-creator";
import {
  saveVideoScript,
  saveToHistoryWithRefs,
  getVideoScripts,
  getVideoScriptById,
  deleteVideoScript,
  bulkDeleteVideoScripts,
  updateVideoScript,
} from "../../data/storage";
import { Platform, ProductInfo } from "../../types/content";
import { validateScript } from "../../utils/validator";

// Script generation limiter — 10 per 5min
const scriptGenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: "Quá nhiều lần tạo kịch bản. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export route limiter — 3 per 5min
const exportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: { error: "Quá nhiều lần export. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Bulk operations limiter — 15 per 5min
const bulkLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: { error: "Quá nhiều thao tác. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

interface CreateScriptRequest {
  product: ProductInfo;
  platform: Platform;
  productId?: string | null;
}

// POST /api/scripts - Create new script
router.post(
  "/",
  scriptGenLimiter,
  async (req: Request<{}, {}, CreateScriptRequest>, res: Response) => {
    try {
      const { product, platform, productId = null } = req.body;

      if (!product || !platform) {
        res.status(400).json({ error: "Missing product or platform" });
        return;
      }

      const agent = new VideoCreatorAgent();
      const script = await agent.generateScript(product, platform);

      // Validate — vẫn lưu kể cả khi có warning
      const validation = validateScript(script);
      const warnings = validation.issues;

      // Save to DB
      const saved = await saveVideoScript(script, productId);
      await saveToHistoryWithRefs(productId, saved.id, null, "script");

      res.json({
        script: {
          ...script,
          id: saved.id,
          productId: saved.productId,
          // Normalize casing to match GET response
          voiceoverCta: script.voiceoverCTA,
        },
        warnings: warnings.length > 0 ? warnings : undefined,
        message: "Script created and saved",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// GET /api/scripts/history - Get script history with pagination
router.get("/history", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const platform = req.query.platform as string | undefined;

    const offset = (page - 1) * limit;
    const { scripts, total } = await getVideoScripts(limit, offset, platform);

    const totalPages = Math.ceil(total / limit);

    res.json({
      scripts: scripts.map((s) => ({
        id: s.id,
        productId: s.productId,
        platform: s.platform,
        title: s.title,
        hook: s.hook,
        body: s.body,
        voiceoverCTA: s.voiceoverCta,
        wordCount: s.wordCount,
        estimatedDuration: s.estimatedDuration,
        createdAt: s.createdAt,
      })),
      total,
      page,
      totalPages,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scripts/:id - Get script by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const script = await getVideoScriptById(id);

    if (!script) {
      res.status(404).json({ error: "Script not found" });
      return;
    }

    res.json({
      script: {
        id: script.id,
        productId: script.productId,
        platform: script.platform,
        title: script.title,
        hook: script.hook,
        body: script.body,
        voiceoverCTA: script.voiceoverCta,
        wordCount: script.wordCount,
        estimatedDuration: script.estimatedDuration,
        createdAt: script.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/scripts/:id - Delete script
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await deleteVideoScript(id);

    if (!deleted) {
      res.status(404).json({ error: "Script not found" });
      return;
    }

    res.json({ message: "Script deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scripts/:id/regenerate - Regenerate script with same product
router.post("/:id/regenerate", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const oldScript = await getVideoScriptById(id);

    if (!oldScript) {
      res.status(404).json({ error: "Script not found" });
      return;
    }

    // Need product info to regenerate - if no productId, error
    if (!oldScript.productId) {
      res.status(400).json({ error: "Cannot regenerate: no product linked" });
      return;
    }

    // Get product info from DB
    const { getProductById } = await import("../../data/storage");
    const product = await getProductById(oldScript.productId);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const productInfo: ProductInfo = {
      name: product.name,
      description: product.description,
      price: product.price,
      rating: product.rating,
      sold: product.sold,
      usp: product.usp,
    };

    const agent = new VideoCreatorAgent();
    const newScript = await agent.generateScript(
      productInfo,
      oldScript.platform,
    );

    const validation = validateScript(newScript);
    const warnings = validation.issues;

    // Update in-place — giữ nguyên ID
    const updated = await updateVideoScript(id, newScript);
    if (!updated) {
      res.status(500).json({ error: "Failed to update script" });
      return;
    }

    res.json({
      script: {
        ...newScript,
        id,
        productId: oldScript.productId,
        // Normalize casing to match GET response
        voiceoverCta: newScript.voiceoverCTA,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
      message: "Script regenerated successfully (same ID)",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scripts/bulk-delete - Delete multiple scripts
router.post(
  "/bulk-delete",
  bulkLimiter,
  async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: "Missing or invalid ids" });
        return;
      }

      // Check which ids exist before deleting
      const scriptsToCheck = await Promise.all(
        ids.map((id) => getVideoScriptById(id)),
      );
      const existingIds = scriptsToCheck
        .filter((s) => s !== undefined)
        .map((s) => s!.id);
      const notFoundIds = ids.filter((id) => !existingIds.includes(id));

      if (existingIds.length === 0) {
        res.status(404).json({
          error: "No valid scripts found",
          notFound: notFoundIds,
        });
        return;
      }

      const deletedCount = await bulkDeleteVideoScripts(existingIds);

      res.json({
        message: `Deleted ${deletedCount} scripts`,
        deletedCount,
        notFoundCount: notFoundIds.length,
        notFound: notFoundIds.length > 0 ? notFoundIds : undefined,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// POST /api/scripts/export - Export scripts to TXT
router.post("/export", exportLimiter, async (req: Request, res: Response) => {
  try {
    const { ids, platform } = req.body;

    const MAX_EXPORT = 10000;
    let allScripts: Awaited<ReturnType<typeof getVideoScripts>>["scripts"];
    let totalCount: number;

    if (platform) {
      const result = await getVideoScripts(MAX_EXPORT, 0, platform);
      allScripts = result.scripts;
      totalCount = result.total;
    } else {
      const result = await getVideoScripts(MAX_EXPORT);
      allScripts = result.scripts;
      totalCount = result.total;
    }

    const filtered = ids
      ? allScripts.filter((s) => ids.includes(s.id))
      : allScripts;

    const truncated = ids ? false : totalCount > MAX_EXPORT;

    const txtContent = filtered
      .map(
        (s) => `# ${s.title}
Platform: ${s.platform}
Duration: ~${s.estimatedDuration} | ~${s.wordCount} words

🎣 HOOK:
${s.hook}

📝 BODY:
${s.body}

📢 CTA:
${s.voiceoverCta}

---
`,
      )
      .join("\n");

    const header = truncated
      ? `⚠️ LƯU Ý: Chỉ export ${MAX_EXPORT} scripts mới nhất / tổng ${totalCount}. Dùng filter để export subset.\n\n${"=".repeat(60)}\n\n`
      : "";

    res.setHeader("Content-Type", "text/plain");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="scripts-${new Date().toISOString().split("T")[0]}.txt"`,
    );
    res.send(header + txtContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

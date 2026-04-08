import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { MarketingWriterAgent } from "../../agents/marketing-writer";
import { savePostDescription, saveToHistoryWithRefs } from "../../data/storage";
import { Platform, ProductInfo } from "../../types/content";
import { validateDescription } from "../../utils/validator";

const router = Router();

// Caption limiter — 10 req/5min
const captionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: "Quá nhiều lần tạo caption. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

interface CreateCaptionRequest {
  product: ProductInfo;
  scriptSummary: string;
  platform: Platform;
  productId?: string | null;
  scriptId?: string | null;
  targetAudience?: string;
}

router.post(
  "/",
  captionLimiter,
  async (req: Request<{}, {}, CreateCaptionRequest>, res: Response) => {
    try {
      const {
        product,
        scriptSummary,
        platform,
        productId = null,
        scriptId = null,
        targetAudience,
      } = req.body;

      if (!product || !scriptSummary || !platform) {
        res
          .status(400)
          .json({ error: "Missing product, scriptSummary, or platform" });
        return;
      }

      const agent = new MarketingWriterAgent();
      const description = await agent.generateDescription(
        product,
        scriptSummary,
        platform,
        targetAudience,
      );

      // Validate
      const validation = validateDescription(description);
      if (!validation.isValid) {
        res.status(400).json({
          error: "Description validation failed",
          issues: validation.issues,
        });
        return;
      }

      // Save to DB — auto-builds caption from components
      const saved = await savePostDescription(description, productId, scriptId);
      await saveToHistoryWithRefs(productId, scriptId, saved.id, "description");

      res.json({
        // Return saved version with auto-built caption
        description: {
          id: saved.id,
          platform: saved.platform,
          headline: saved.headline,
          content: saved.content,
          offer: saved.offer,
          cta: saved.cta,
          hashtags: saved.hashtags,
          caption: saved.caption,
          wordCount: saved.wordCount,
          createdAt: saved.createdAt,
        },
        message: "Caption created and saved",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;

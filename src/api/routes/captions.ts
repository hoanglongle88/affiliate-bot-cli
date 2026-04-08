import { Router, Request, Response } from "express";
import { MarketingWriterAgent } from "../../agents/marketing-writer";
import { savePostDescription, saveToHistoryWithRefs } from "../../data/storage";
import { Platform, ProductInfo } from "../../types/content";
import { validateDescription } from "../../utils/validator";

const router = Router();

interface CreateCaptionRequest {
  product: ProductInfo;
  scriptSummary: string;
  platform: Platform;
  productId?: string | null;
  scriptId?: string | null;
  targetAudience?: string;
}

router.post("/", async (req: Request<{}, {}, CreateCaptionRequest>, res: Response) => {
  try {
    const { product, scriptSummary, platform, productId = null, scriptId = null, targetAudience } = req.body;

    if (!product || !scriptSummary || !platform) {
      res.status(400).json({ error: "Missing product, scriptSummary, or platform" });
      return;
    }

    const agent = new MarketingWriterAgent();
    const description = await agent.generateDescription(product, scriptSummary, platform, targetAudience);

    // Validate
    const validation = validateDescription(description);
    if (!validation.isValid) {
      res.status(400).json({ error: "Description validation failed", issues: validation.issues });
      return;
    }

    // Save to DB
    const saved = await savePostDescription(description, productId, scriptId);
    await saveToHistoryWithRefs(productId, null, saved.id, "description");

    res.json({
      description: { ...description, id: saved.id },
      message: "Caption created and saved",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

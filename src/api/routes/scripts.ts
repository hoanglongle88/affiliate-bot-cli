import { Router, Request, Response } from "express";
import { VideoCreatorAgent } from "../../agents/video-creator";
import { saveVideoScript, saveToHistoryWithRefs } from "../../data/storage";
import { Platform, ProductInfo } from "../../types/content";
import { validateScript } from "../../utils/validator";

const router = Router();

interface CreateScriptRequest {
  product: ProductInfo;
  platform: Platform;
  productId?: string | null;
}

router.post("/", async (req: Request<{}, {}, CreateScriptRequest>, res: Response) => {
  try {
    const { product, platform, productId = null } = req.body;

    if (!product || !platform) {
      res.status(400).json({ error: "Missing product or platform" });
      return;
    }

    const agent = new VideoCreatorAgent();
    const script = await agent.generateScript(product, platform);

    // Validate
    const validation = validateScript(script);
    if (!validation.isValid) {
      res.status(400).json({ error: "Script validation failed", issues: validation.issues });
      return;
    }

    // Save to DB
    const saved = await saveVideoScript(script, productId);
    await saveToHistoryWithRefs(productId, saved.id, null, "script");

    res.json({
      script: { ...script, id: saved.id },
      message: "Script created and saved",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

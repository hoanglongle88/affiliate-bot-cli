import { Router, Request, Response } from "express";
import { ImageCreatorAgent } from "../../agents/image-creator";
import type { ImagePromptOutput } from "../../prompts/image-creator";

const router = Router();

interface CreateImageRequest {
  productName: string;
  category?: string;
  adPlatform: string;
  aspectRatio: string;
  mainMessage?: string;
  price?: string;
  productId?: string | null;
}

router.post(
  "/",
  async (req: Request<{}, {}, CreateImageRequest>, res: Response) => {
    try {
      const {
        productName,
        category = "Đa ngành hàng",
        adPlatform,
        aspectRatio,
        mainMessage = "",
        price = "",
        productId = null,
      } = req.body;

      if (!productName || !adPlatform || !aspectRatio) {
        res
          .status(400)
          .json({ error: "Missing productName, adPlatform, or aspectRatio" });
        return;
      }

      const agent = new ImageCreatorAgent();
      const brief: ImagePromptOutput = await agent.generateBrief({
        name: productName,
        category,
        adPlatform: adPlatform as any,
        aspectRatio: aspectRatio as any,
        mainMessage: mainMessage || productName,
        price: price || "Chưa có",
      });

      // Save to DB if productId provided
      if (productId) {
        const { saveImageBrief } = await import("../../data/storage");
        await saveImageBrief({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          productId,
          adPlatform,
          aspectRatio,
          adFormat: brief.adFormat,
          visualStyle: brief.visualStyle,
          colorPalette: brief.colorPalette,
          promptSafe: brief.prompts.safe,
          promptBold: brief.prompts.bold,
          promptLifestyle: brief.prompts.lifestyle,
          negativePrompt: brief.negativePrompt,
          shootingNotes: brief.shootingNotes,
          createdAt: new Date().toISOString(),
        });
      }

      res.json({
        brief,
        message: "Image brief created",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;

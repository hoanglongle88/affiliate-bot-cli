import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { ShortCreatorAgent } from "../../agents/short-creator";
import {
  saveShortVideoPrompt,
  saveToHistoryWithRefs,
} from "../../data/storage";
import { Platform, VideoScript } from "../../types/content";

const router = Router();

// Short video limiter — 10 req/5min
const shortLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: "Quá nhiều lần tạo prompt. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

interface CreateShortRequest {
  productName: string;
  script: {
    platform: Platform;
    hook: string;
    body: string;
    voiceoverCTA: string;
    estimatedDuration: string;
    wordCount?: number;
    title?: string;
  };
  productId?: string | null;
  scriptId?: string | null;
}

router.post(
  "/",
  shortLimiter,
  async (req: Request<{}, {}, CreateShortRequest>, res: Response) => {
    try {
      const {
        productName,
        script,
        productId = null,
        scriptId = null,
      } = req.body;

      if (!productName || !script) {
        res.status(400).json({ error: "Missing productName or script" });
        return;
      }

      const videoScript: VideoScript = {
        platform: script.platform,
        title: script.title || "",
        hook: script.hook,
        body: script.body,
        voiceoverCTA: script.voiceoverCTA,
        wordCount: script.wordCount || 0,
        estimatedDuration: script.estimatedDuration,
      };

      const agent = new ShortCreatorAgent();
      const prompt = await agent.generatePromptFromScript(
        productName,
        videoScript,
      );

      // Save to DB (returns void — ID generated internally)
      await saveShortVideoPrompt(prompt, productId, scriptId);
      await saveToHistoryWithRefs(productId, scriptId, null, "short_video");

      res.json({
        prompt,
        message: "Video prompt created",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;

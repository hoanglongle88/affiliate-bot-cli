import { Router, Request, Response } from "express";
import { ShortCreatorAgent } from "../../agents/short-creator";
import { saveShortVideoPrompt, saveToHistoryWithRefs } from "../../data/storage";
import { Platform, VideoScript } from "../../types/content";

const router = Router();

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

router.post("/", async (req: Request<{}, {}, CreateShortRequest>, res: Response) => {
  try {
    const { productName, script, productId = null, scriptId = null } = req.body;

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
    const prompt = await agent.generatePromptFromScript(productName, videoScript);

    // Save to DB
    await saveShortVideoPrompt(prompt, productId, scriptId);
    await saveToHistoryWithRefs(productId, scriptId, null, "short_video");

    res.json({
      prompt,
      message: "Video prompt created",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

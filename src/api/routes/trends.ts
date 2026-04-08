import { Router, Request, Response } from "express";
import { AutonomousTrendScanner } from "../../agents/trend-scanner";
import { saveProduct, saveTrendBrief, saveToHistoryWithRefs } from "../../data/storage";
import { NicheConfig } from "../../config/niches";

const router = Router();

interface TrendScanRequest {
  nicheId?: string;
}

router.post("/scan", async (req: Request<{}, {}, TrendScanRequest>, res: Response) => {
  try {
    const { nicheId } = req.body;

    const scanner = new AutonomousTrendScanner();
    const { brief, product } = await scanner.scanAndGenerate(
      nicheId ? undefined : undefined,
    );

    // Save product + trend brief
    const savedProduct = await saveProduct(product);
    await saveTrendBrief(brief, savedProduct.id);

    res.json({
      brief,
      product,
      productId: savedProduct.id,
      message: "Trend scan complete",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

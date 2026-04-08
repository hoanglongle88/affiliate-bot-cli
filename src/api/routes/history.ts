import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import {
  getHistory,
  getHistoryWithRefs,
  deleteHistoryEntry,
  clearHistory,
} from "../../data/storage";

const router = Router();

// Clear history limiter — 2 req/15min
const clearLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2,
  message: { error: "Quá nhiều lần xóa lịch sử. Vui lòng đợi 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/history - List history
router.get("/", async (_req: Request, res: Response) => {
  try {
    const history = await getHistoryWithRefs(50);
    res.json({ history, total: history.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/history/:id - Delete entry
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await deleteHistoryEntry(String(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    res.json({ message: "Entry deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/history - Clear all history
router.delete("/", clearLimiter, async (_req: Request, res: Response) => {
  try {
    await clearHistory();
    res.json({ message: "History cleared" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

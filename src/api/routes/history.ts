import { Router, Request, Response } from "express";
import {
  getHistory,
  getHistoryWithRefs,
  deleteHistoryEntry,
  clearHistory,
} from "../../data/storage";

const router = Router();

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
router.delete("/", async (_req: Request, res: Response) => {
  try {
    await clearHistory();
    res.json({ message: "History cleared" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

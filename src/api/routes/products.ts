import { Router, Request, Response } from "express";
import {
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  deleteAllProducts,
} from "../../data/storage";
import { ProductInfo } from "../../types/content";

const router = Router();

// GET /api/products - List all products
router.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await getProducts();
    res.json({ products, total: products.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await getProductById(String(req.params.id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Create product
router.post("/", async (req: Request<{}, {}, ProductInfo>, res: Response) => {
  try {
    const { name, description, price, rating, sold } = req.body;

    if (!name || !description) {
      res.status(400).json({ error: "Missing name or description" });
      return;
    }

    const product = await saveProduct({
      name,
      description,
      price,
      rating,
      sold,
    });
    res.status(201).json({ product, message: "Product created" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await deleteProduct(String(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ message: "Product deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products - Delete all products
router.delete("/", async (_req: Request, res: Response) => {
  try {
    const count = await deleteAllProducts();
    res.json({ message: `Deleted ${count} products` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

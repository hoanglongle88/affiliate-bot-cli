import { Router, Request, Response } from "express";
import {
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  deleteAllProducts,
  SavedProduct,
} from "../../data/storage";
import { ProductInfo } from "../../types/content";

const router = Router();

// GET /api/products - List products with search + pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const allProducts = await getProducts();
    const q = (req.query.q as string)?.toLowerCase() || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Search filter
    const filtered = q
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.price.toLowerCase().includes(q),
        )
      : allProducts;

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;
    const products = filtered.slice(start, start + limit);

    console.log(
      `[API] GET /api/products: page=${page}, limit=${limit}, q="${q}" → returning ${products.length}/${total} products`,
    );

    res.json({ products, total, page: currentPage, totalPages, limit });
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

// PUT /api/products/:id - Update product
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, description, price, rating, sold } = req.body;
    if (!name || !description) {
      res.status(400).json({ error: "Missing name or description" });
      return;
    }
    const updated = await saveProduct({
      name,
      description,
      price,
      rating,
      sold,
    });
    res.json({ product: updated, message: "Product updated" });
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

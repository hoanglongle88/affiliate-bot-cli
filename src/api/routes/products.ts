import { Router, Request, Response } from "express";
import { parse } from "csv-parse/sync";
import {
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct,
  deleteAllProducts,
} from "../../data/storage";

const router = Router();

// GET /api/products - List products with search + sort + pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const allProducts = await getProducts();
    const q = (req.query.q as string)?.toLowerCase() || "";
    const sort = (req.query.sort as string) || "date_desc";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Search filter
    let filtered = q
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.price.toLowerCase().includes(q),
        )
      : allProducts;

    // Sort
    switch (sort) {
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "usage_desc":
        filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      case "usage_asc":
        filtered.sort((a, b) => (a.usageCount || 0) - (b.usageCount || 0));
        break;
      case "date_asc":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "date_desc":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;
    const products = filtered.slice(start, start + limit);

    res.json({ products, total, page: currentPage, totalPages, limit });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/export - Export all products as CSV
router.get("/export", async (_req: Request, res: Response) => {
  try {
    const allProducts = await getProducts();

    const header =
      "Mã sản phẩm,Tên sản phẩm,Giá,Đánh giá,Đã bán,Lượt dùng,Ngày tạo\n";
    const rows = allProducts
      .map(
        (p) =>
          `${p.id},"${p.name.replace(/"/g, '""')}",${p.price},${p.rating},${p.sold},${p.usageCount || 0},${p.createdAt}`,
      )
      .join("\n");

    const csv = header + rows;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=products_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    res.send("\uFEFF" + csv); // BOM for Excel UTF-8
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products/import - Import products from CSV
router.post("/import", async (req: Request, res: Response) => {
  try {
    const { csvContent } = req.body;

    if (!csvContent) {
      res.status(400).json({ error: "Missing csvContent" });
      return;
    }

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let success = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of records as any[]) {
      try {
        const name = row["Tên sản phẩm"]?.trim();
        if (!name) {
          skipped++;
          continue;
        }

        await saveProduct({
          name,
          description: row["Mô tả"] || name,
          price: row["Giá"] || "Chưa có",
          rating: row["Đánh giá"] || "Chưa có",
          sold: row["Đã bán"] || "Chưa có",
        });
        success++;
      } catch (e: any) {
        const productName = row["Tên sản phẩm"] || "Unknown";
        errors.push(`${productName}: ${e.message}`);
      }
    }

    res.json({
      success,
      skipped,
      errors,
      message: `Imported ${success} products`,
    });
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
router.post("/", async (req: Request, res: Response) => {
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

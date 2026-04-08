import { Router, Request, Response } from "express";
import { parse } from "csv-parse/sync";
import rateLimit from "express-rate-limit";
import { supabase } from "../../services/supabase-client";
import {
  getProducts,
  getProductById,
  saveProduct,
  updateProductById,
  deleteProduct,
  bulkDeleteProducts,
  deleteAllProducts,
} from "../../data/storage";

const router = Router();

// ── Route-level limiters ──

// Import: 5 per 5min
const importLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: "Quá nhiều lần import. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Delete all: 2 per 15min (very dangerous operation)
const deleteAllLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2,
  message: { error: "Quá nhiều lần xóa hết. Vui lòng đợi 15 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export: 5 per 5min
const exportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: "Quá nhiều lần export. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Validation helpers ──

function validateProductInput(body: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!name) errors.push("Thiếu tên sản phẩm");
  else if (name.length > 200) errors.push("Tên quá dài (tối đa 200 ký tự)");

  if (!description) errors.push("Thiếu mô tả");
  else if (description.length > 2000)
    errors.push("Mô tả quá dài (tối đa 2000 ký tự)");

  const price = body.price as string | undefined;
  if (price && price.length > 50) errors.push("Giá quá dài");

  const rating = body.rating as string | undefined;
  if (rating && rating.length > 20) errors.push("Đánh giá không hợp lệ");

  const sold = body.sold as string | undefined;
  if (sold && sold.length > 20) errors.push("Số lượng bán không hợp lệ");

  const usp = body.usp as string | undefined;
  if (usp && usp.length > 500) errors.push("USP quá dài (tối đa 500 ký tự)");

  return { valid: errors.length === 0, errors };
}

// Escape CSV field to prevent formula injection
function csvEscape(value: string): string {
  // Prefix with single quote if starts with dangerous chars
  if (/^[=+\-@]/.test(value)) {
    return `'"${value.replace(/"/g, '""')}"`;
  }
  // Wrap in quotes and escape internal quotes
  return `"${value.replace(/"/g, '""')}"`;
}

// Bulk operations: 15 per 5min
const bulkLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: { error: "Quá nhiều thao tác. Vui lòng đợi 5 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitize imported value to prevent CSV formula injection
function sanitizeImportValue(value: string | undefined): string {
  if (!value) return "Chưa có";
  const trimmed = value.trim();
  if (/^[=+\-@]/.test(trimmed)) {
    return "'" + trimmed;
  }
  return trimmed || "Chưa có";
}

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

// GET /api/products - Server-side pagination + search + sort
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const q = (req.query.q as string) || "";
    const sort = (req.query.sort as string) || "date_desc";

    const offset = (page - 1) * limit;
    const { products, total } = await getProducts(limit, offset, q, sort);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      products,
      total,
      page: Math.min(page, totalPages),
      totalPages,
      limit,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/export - Export ALL products as CSV (safe escape)
router.get("/export", exportLimiter, async (_req: Request, res: Response) => {
  try {
    const MAX_EXPORT = 10000;
    const { products: allProducts, total } = await getProducts(MAX_EXPORT);

    const header =
      "Mã sản phẩm,Tên sản phẩm,Mô tả,Giá,Đánh giá,Đã bán,USP,Lượt dùng,Ngày tạo\n";
    const rows = allProducts
      .map((p) =>
        [
          p.id,
          csvEscape(p.name),
          csvEscape(p.description),
          csvEscape(p.price),
          csvEscape(p.rating),
          csvEscape(p.sold),
          csvEscape(p.usp || ""),
          p.usageCount || 0,
          p.createdAt,
        ].join(","),
      )
      .join("\n");

    const warning =
      total > MAX_EXPORT
        ? `⚠️ CHU Y: Chi export ${MAX_EXPORT}/${total} san pham gan day\n\n`
        : "";

    const csv = warning + header + rows;

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

// POST /api/products/import - Import ALL products from CSV
router.post("/import", importLimiter, async (req: Request, res: Response) => {
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
    let updated = 0;
    const errors: string[] = [];

    for (const row of records as Record<string, string>[]) {
      try {
        const name = row["Tên sản phẩm"]?.trim();
        if (!name) {
          skipped++;
          continue;
        }

        // Sanitize imported values
        const descVal = sanitizeImportValue(row["Mô tả"]);
        const description = descVal === "Chưa có" ? name : descVal;
        if (description.length > 2000) {
          errors.push(`${name}: Mô tả quá dài`);
          skipped++;
          continue;
        }

        const price = sanitizeImportValue(row["Giá"]);
        const rating = sanitizeImportValue(row["Đánh giá"]);
        const sold = sanitizeImportValue(row["Đã bán"]);
        const rawUsp = row["USP"]?.trim();
        const usp =
          rawUsp && rawUsp.length > 0
            ? /^[=+\-@]/.test(rawUsp)
              ? "'" + rawUsp
              : rawUsp
            : undefined;

        // Check if product with this name already exists
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .ilike("name", name)
          .single();

        if (existing) {
          // Update without incrementing usage_count
          const updateData: Record<string, unknown> = {
            description,
            price,
            rating,
            sold,
          };
          if (usp) updateData.usp = usp;

          await supabase
            .from("products")
            .update(updateData)
            .eq("id", existing.id);

          updated++;
        } else {
          await saveProduct({
            name,
            description,
            price,
            rating,
            sold,
            usp,
          });
        }
        success++;
      } catch (e: any) {
        const productName = row["Tên sản phẩm"] || "Unknown";
        errors.push(`${productName}: ${e.message}`);
      }
    }

    res.json({
      success,
      updated,
      created: success - updated,
      skipped,
      errors: errors.slice(0, 20), // Limit error messages
      message: `Imported ${success} products (${updated} updated, ${success - updated} new), ${skipped} skipped`,
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
    const validation = validateProductInput(req.body);
    if (!validation.valid) {
      res.status(400).json({
        error: "Validation failed",
        issues: validation.errors,
      });
      return;
    }

    const { name, description, price, rating, sold, usp } = req.body;
    const product = await saveProduct({
      name: name.trim(),
      description: description.trim(),
      price: price?.trim() || "Chưa có",
      rating: rating?.trim() || "Chưa có",
      sold: sold?.trim() || "Chưa có",
      usp: usp?.trim(),
    });
    res.status(201).json({ product, message: "Product created" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Update product BY ID (not by name)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    // Check product exists
    const existing = await getProductById(id);
    if (!existing) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const validation = validateProductInput(req.body);
    if (!validation.valid) {
      res.status(400).json({
        error: "Validation failed",
        issues: validation.errors,
      });
      return;
    }

    const { name, description, price, rating, sold, usp } = req.body;
    const updated = await updateProductById(id, {
      name: name.trim(),
      description: description.trim(),
      price: price?.trim(),
      rating: rating?.trim(),
      sold: sold?.trim(),
      usp: usp?.trim(),
    });

    if (!updated) {
      res.status(500).json({ error: "Failed to update product" });
      return;
    }

    res.json({ product: updated, message: "Product updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Delete single product
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

// POST /api/products/bulk-delete - Delete multiple products
router.post(
  "/bulk-delete",
  bulkLimiter,
  async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: "Missing or invalid ids" });
        return;
      }

      if (ids.length > 100) {
        res.status(400).json({ error: "Tối đa 100 IDs mỗi yêu cầu" });
        return;
      }

      // Check which ids exist — single query instead of N+1
      const { data: existingProducts } = await supabase
        .from("products")
        .select("id")
        .in("id", ids);

      const existingIds = existingProducts?.map((p) => p.id) || [];
      const notFoundIds = ids.filter((id) => !existingIds.includes(id));

      if (existingIds.length === 0) {
        res.status(404).json({
          error: "No valid products found",
          notFound: notFoundIds,
        });
        return;
      }

      const deletedCount = await bulkDeleteProducts(existingIds);

      res.json({
        message: `Deleted ${deletedCount} products`,
        deletedCount,
        notFoundCount: notFoundIds.length,
        notFound: notFoundIds.length > 0 ? notFoundIds : undefined,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// DELETE /api/products - Delete all products (DANGEROUS)
router.delete("/", deleteAllLimiter, async (_req: Request, res: Response) => {
  try {
    const count = await deleteAllProducts();
    res.json({
      message: `Deleted ${count} products`,
      deletedCount: count,
      warning:
        "This action cascades to all linked scripts, descriptions, and trends.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

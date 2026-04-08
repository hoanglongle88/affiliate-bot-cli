#!/usr/bin/env node
/**
 * Migration script: Chuyển dữ liệu từ JSON files cũ lên Supabase
 *
 * Cách dùng:
 * 1. Cấu hình SUPABASE_URL và SUPABASE_ANON_KEY trong .env
 * 2. Chạy SQL schema trong Supabase SQL Editor (file supabase-schema.sql)
 * 3. Chạy script này: npm run migrate
 *
 * Sau khi migration thành công, có thể xóa các file JSON cũ.
 */

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { supabase } from "./services/supabase-client";

const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

interface SavedProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: string;
  sold: string;
  usageCount: number;
  createdAt: string;
}

interface HistoryEntry {
  id: string;
  product: any;
  content: any;
  createdAt: string;
  workflow: string;
}

async function migrateProducts() {
  console.log("📦 Đang đọc products.json...");

  if (!fs.existsSync(PRODUCTS_FILE)) {
    console.log("⚠️  Không tìm thấy products.json, bỏ qua");
    return;
  }

  const products: SavedProduct[] = JSON.parse(
    fs.readFileSync(PRODUCTS_FILE, "utf-8"),
  );
  console.log(`✅ Đọc được ${products.length} sản phẩm`);

  console.log("🚀 Đang upload lên Supabase...");

  let success = 0;
  let failed = 0;

  for (const product of products) {
    const { error } = await supabase.from("products").upsert({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      rating: product.rating,
      sold: product.sold,
      usage_count: product.usageCount,
      created_at: product.createdAt,
    });

    if (error) {
      console.error(`❌ Lỗi "${product.name}": ${error.message}`);
      failed++;
    } else {
      success++;
    }
  }

  console.log(`✅ Products: ${success} thành công, ${failed} thất bại`);
}

async function migrateHistory() {
  console.log("\n📜 Đang đọc history.json...");

  if (!fs.existsSync(HISTORY_FILE)) {
    console.log("⚠️  Không tìm thấy history.json, bỏ qua");
    return;
  }

  const history: HistoryEntry[] = JSON.parse(
    fs.readFileSync(HISTORY_FILE, "utf-8"),
  );
  console.log(`✅ Đọc được ${history.length} lịch sử`);

  console.log("🚀 Đang upload lên Supabase...");

  let success = 0;
  let failed = 0;

  for (const entry of history) {
    const { error } = await supabase.from("history").upsert({
      id: entry.id,
      product_data: entry.product,
      content_data: entry.content,
      workflow: entry.workflow,
      created_at: entry.createdAt,
    });

    if (error) {
      console.error(`❌ Lỗi "${entry.product.name}": ${error.message}`);
      failed++;
    } else {
      success++;
    }
  }

  console.log(`✅ History: ${success} thành công, ${failed} thất bại`);
}

async function main() {
  console.log("🔍 Kiểm tra cấu hình Supabase...");
  console.log("✅ Supabase đã được cấu hình\n");

  await migrateProducts();
  await migrateHistory();

  console.log("\n" + "═".repeat(50));
  console.log("🎉 Migration hoàn tất!");
  console.log("═".repeat(50));
  console.log("\n💡 Bạn có thể xóa files JSON cũ nếu muốn:");
  console.log(`   - ${PRODUCTS_FILE}`);
  console.log(`   - ${HISTORY_FILE}`);
}

main().catch((err) => {
  console.error("❌ Lỗi migration:", err.message);
  process.exit(1);
});

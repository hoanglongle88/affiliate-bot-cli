# Hướng dẫn Setup Supabase

## 📋 Tổng quan

Bot sử dụng **Supabase (PostgreSQL)** làm storage duy nhất. Không có JSON fallback.

Nếu Supabase chưa được cấu hình trong `.env`, bot sẽ thoát ngay với thông báo lỗi.

### Ưu điểm của Supabase

✅ **Đa thiết bị**: Dữ liệu đồng bộ across machines
✅ **Backup tự động**: Supabase tự backup hàng ngày
✅ **Query mạnh mẽ**: PostgreSQL queries, filters, pagination
✅ **Scalable**: Không giới hạn file size
✅ **An toàn**: Row Level Security, encrypted at rest
✅ **Miễn phí**: Free tier đủ dùng cho cá nhân

## 🚀 Các bước setup Supabase

### Bước 1: Tạo Supabase Project

1. Truy cập https://supabase.com
2. Đăng nhập/đăng ký tài khoản (dùng GitHub, Google, email)
3. Click **"New Project"**
4. Điền thông tin:
   - **Organization**: Chọn hoặc tạo mới
   - **Project name**: Đặt tên (VD: `affiliate-bot-db`)
   - **Database Password**: Tạo mật khẩu mạnh (lưu lại!)
   - **Region**: Chọn gần nhất (Singapore hoặc Tokyo cho VN)
5. Click **"Create new project"**
6. Đợi 1-2 phút để project được tạo

### Bước 2: Lấy thông tin kết nối

1. Vào Supabase Dashboard → Project của bạn
2. Click **"Project Settings"** (biểu tượng bánh răng ⚙️)
3. Scroll xuống phần **"API"**
4. Copy 2 thông tin:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Chuỗi dài bắt đầu bằng `eyJ...`

### Bước 3: Chạy SQL Schema

1. Trong Supabase Dashboard, click **"SQL Editor"** (thanh bên trái)
2. Click **"New query"**
3. Mở file `supabase-schema.sql` trong project của bạn
4. Copy toàn bộ nội dung file
5. Paste vào SQL Editor
6. Click **"Run"** (hoặc Ctrl+Enter)
7. Đợi thông báo **"Success. No rows returned"**

> ✅ **Đã tạo xong:** 6 tables (`products`, `video_scripts`, `post_descriptions`, `trend_briefs`, `image_briefs`, `history`) với indexes và policies

### Bước 4: Cấu hình .env

Mở file `.env` trong project và cập nhật:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Ví dụ thực tế:**

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.abcdefghijklmnopqrstuvwxyz123456
```

### Bước 5: Migration dữ liệu cũ (nếu có)

Nếu bạn đã có dữ liệu trong JSON files cũ (`data/products.json`, `data/history.json`):

```bash
npm run migrate
```

**Script sẽ tự động:**

1. ✅ Kiểm tra kết nối Supabase
2. ✅ Đọc `data/products.json`
3. ✅ Upload từng sản phẩm lên Supabase
4. ✅ Đọc `data/history.json`
5. ✅ Upload từng history entry lên Supabase
6. ✅ Báo cáo kết quả (thành công/thất bại)

### Bước 6: Chạy bot và kiểm tra

```bash
npm run dev
```

**Kiểm tra:**

1. Tạo 1 nội dung mới
2. Vào Supabase Dashboard → **Table Editor**
3. Kiểm tra các tables: `products`, `video_scripts`, `post_descriptions`, `history`
4. Xem dữ liệu đã được insert

## 📊 Database Schema chi tiết

### Bảng `products`

Lưu trữ thông tin sản phẩm đã được sử dụng.

| Cột           | Kiểu        | Ràng buộc         | Mô tả                         |
| ------------- | ----------- | ----------------- | ----------------------------- |
| `id`          | TEXT        | PRIMARY KEY       | ID unique (VD: `prod_abc123`) |
| `name`        | TEXT        | NOT NULL          | Tên sản phẩm                  |
| `description` | TEXT        | NOT NULL          | Mô tả sản phẩm                |
| `price`       | TEXT        | DEFAULT "Chưa có" | Giá tiền                      |
| `rating`      | TEXT        | DEFAULT "Chưa có" | Đánh giá (VD: "4.8/5")        |
| `sold`        | TEXT        | DEFAULT "Chưa có" | Số lượng đã bán (VD: "10k+")  |
| `usage_count` | INTEGER     | DEFAULT 1         | Số lần đã sử dụng tạo content |
| `created_at`  | TIMESTAMPTZ | DEFAULT NOW()     | Thời gian tạo                 |

### Bảng `video_scripts`

Lưu kịch bản video đã tạo bởi AI.

| Cột                  | Kiểu        | Ràng buộc        | Mô tả                            |
| -------------------- | ----------- | ---------------- | -------------------------------- |
| `id`                 | TEXT        | PRIMARY KEY      | ID unique                        |
| `product_id`         | TEXT        | FK → products.id | Link đến sản phẩm (nullable)     |
| `platform`           | TEXT        | NOT NULL         | Nền tảng (tiktok, youtube, etc.) |
| `title`              | TEXT        | NOT NULL         | Tiêu đề kịch bản                 |
| `hook`               | TEXT        | NOT NULL         | Câu mở đầu thu hút               |
| `body`               | TEXT        | NOT NULL         | Nội dung chính                   |
| `voiceover_cta`      | TEXT        | NOT NULL         | Kêu gọi hành động                |
| `word_count`         | INTEGER     | NOT NULL         | Số từ                            |
| `estimated_duration` | TEXT        | NOT NULL         | Thời lượng ước tính              |
| `raw_ai_response`    | JSONB       | nullable         | Response gốc từ AI               |
| `created_at`         | TIMESTAMPTZ | DEFAULT NOW()    | Thời gian tạo                    |

### Bảng `post_descriptions`

Lưu caption/mô tả bài đăng cho các nền tảng.

| Cột          | Kiểu        | Ràng buộc             | Mô tả                        |
| ------------ | ----------- | --------------------- | ---------------------------- |
| `id`         | TEXT        | PRIMARY KEY           | ID unique                    |
| `product_id` | TEXT        | FK → products.id      | Link đến sản phẩm (nullable) |
| `script_id`  | TEXT        | FK → video_scripts.id | Link đến script (nullable)   |
| `platform`   | TEXT        | NOT NULL              | Nền tảng                     |
| `caption`    | TEXT        | NOT NULL              | Nội dung caption             |
| `hashtags`   | TEXT[]      | DEFAULT '{}'          | Mảng hashtags                |
| `cta`        | TEXT        | NOT NULL              | Call-to-action               |
| `word_count` | INTEGER     | NOT NULL              | Số từ                        |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW()         | Thời gian tạo                |

### Bảng `trend_briefs`

Lưu kết quả research trend từ AI.

| Cột               | Kiểu        | Ràng buộc        | Mô tả                           |
| ----------------- | ----------- | ---------------- | ------------------------------- |
| `id`              | TEXT        | PRIMARY KEY      | ID unique                       |
| `source`          | TEXT        | NOT NULL         | Nguồn (tiktok, youtube, shopee) |
| `niche`           | TEXT        | NOT NULL         | Ngách sản phẩm                  |
| `product_id`      | TEXT        | FK → products.id | Link đến sản phẩm (nullable)    |
| `angle`           | TEXT        | NOT NULL         | Góc tiếp cận                    |
| `hook`            | TEXT        | NOT NULL         | Câu hook trend                  |
| `hashtags`        | TEXT[]      | DEFAULT '{}'     | Mảng hashtags                   |
| `pain_point`      | TEXT        | NOT NULL         | Pain point của khách hàng       |
| `cta_angle`       | TEXT        | NOT NULL         | Góc kêu gọi hành động           |
| `raw_ai_response` | JSONB       | nullable         | Response gốc từ AI              |
| `created_at`      | TIMESTAMPTZ | DEFAULT NOW()    | Thời gian tạo                   |

### Bảng `image_briefs`

Lưu creative brief cho ảnh quảng cáo.

| Cột                | Kiểu        | Ràng buộc        | Mô tả                                 |
| ------------------ | ----------- | ---------------- | ------------------------------------- |
| `id`               | TEXT        | PRIMARY KEY      | ID unique                             |
| `product_id`       | TEXT        | FK → products.id | Link đến sản phẩm (nullable)          |
| `ad_platform`      | TEXT        | NOT NULL         | Nền tảng ads (facebook, tiktok, etc.) |
| `aspect_ratio`     | TEXT        | NOT NULL         | Tỷ lệ ảnh (1:1, 9:16, 16:9)           |
| `ad_format`        | TEXT        | NOT NULL         | Format ads                            |
| `visual_style`     | TEXT        | NOT NULL         | Phong cách hình ảnh                   |
| `color_palette`    | TEXT[]      | DEFAULT '{}'     | Bảng màu đề xuất                      |
| `prompt_safe`      | TEXT        | NOT NULL         | Prompt an toàn                        |
| `prompt_bold`      | TEXT        | NOT NULL         | Prompt nổi bật                        |
| `prompt_lifestyle` | TEXT        | NOT NULL         | Prompt lifestyle                      |
| `negative_prompt`  | TEXT        | NOT NULL         | Prompt tiêu cực (tránh)               |
| `shooting_notes`   | TEXT        | NOT NULL         | Ghi chú chụp/quay                     |
| `raw_ai_response`  | JSONB       | nullable         | Response gốc từ AI                    |
| `created_at`       | TIMESTAMPTZ | DEFAULT NOW()    | Thời gian tạo                         |

### Bảng `history`

Lưu lịch sử tạo nội dung, reference đến các bảng content.

| Cột              | Kiểu        | Ràng buộc                                         | Mô tả                                |
| ---------------- | ----------- | ------------------------------------------------- | ------------------------------------ |
| `id`             | TEXT        | PRIMARY KEY                                       | ID unique                            |
| `product_id`     | TEXT        | FK → products.id                                  | Link đến products table              |
| `script_id`      | TEXT        | FK → video_scripts.id                             | Link đến video script (nullable)     |
| `description_id` | TEXT        | FK → post_descriptions.id                         | Link đến post description (nullable) |
| `workflow`       | TEXT        | CHECK (script/description/full/trend/image_brief) | Loại workflow đã dùng                |
| `created_at`     | TIMESTAMPTZ | DEFAULT NOW()                                     | Thời gian tạo                        |

## 🔧 API Functions

### Products

| Function               | Return type                          |
| ---------------------- | ------------------------------------ |
| `saveProduct(product)` | `Promise<SavedProduct>`              |
| `getProducts()`        | `Promise<SavedProduct[]>`            |
| `getProductById(id)`   | `Promise<SavedProduct \| undefined>` |
| `deleteProduct(id)`    | `Promise<boolean>`                   |
| `deleteAllProducts()`  | `Promise<number>`                    |

### Video Scripts

| Function                                            | Return type                              |
| --------------------------------------------------- | ---------------------------------------- |
| `saveVideoScript(script, productId, rawAiResponse)` | `Promise<SavedVideoScript>`              |
| `getVideoScripts(limit)`                            | `Promise<SavedVideoScript[]>`            |
| `getVideoScriptById(id)`                            | `Promise<SavedVideoScript \| undefined>` |
| `getVideoScriptsByProductId(productId, limit)`      | `Promise<SavedVideoScript[]>`            |
| `deleteVideoScript(id)`                             | `Promise<boolean>`                       |
| `deleteAllVideoScripts()`                           | `Promise<void>`                          |

### Post Descriptions

| Function                                           | Return type                                  |
| -------------------------------------------------- | -------------------------------------------- |
| `savePostDescription(desc, productId, scriptId)`   | `Promise<SavedPostDescription>`              |
| `getPostDescriptions(limit)`                       | `Promise<SavedPostDescription[]>`            |
| `getPostDescriptionById(id)`                       | `Promise<SavedPostDescription \| undefined>` |
| `getPostDescriptionsByProductId(productId, limit)` | `Promise<SavedPostDescription[]>`            |
| `deletePostDescription(id)`                        | `Promise<boolean>`                           |
| `deleteAllPostDescriptions()`                      | `Promise<void>`                              |

### Trend Briefs

| Function                           | Return type                             |
| ---------------------------------- | --------------------------------------- |
| `saveTrendBrief(brief, productId)` | `Promise<SavedTrendBrief>`              |
| `getTrendBriefs(limit)`            | `Promise<SavedTrendBrief[]>`            |
| `getTrendBriefById(id)`            | `Promise<SavedTrendBrief \| undefined>` |
| `deleteTrendBrief(id)`             | `Promise<boolean>`                      |
| `deleteAllTrendBriefs()`           | `Promise<void>`                         |

### Image Briefs

| Function                 | Return type                             |
| ------------------------ | --------------------------------------- |
| `saveImageBrief(brief)`  | `Promise<SavedImageBrief>`              |
| `getImageBriefs(limit)`  | `Promise<SavedImageBrief[]>`            |
| `getImageBriefById(id)`  | `Promise<SavedImageBrief \| undefined>` |
| `deleteImageBrief(id)`   | `Promise<boolean>`                      |
| `deleteAllImageBriefs()` | `Promise<void>`                         |

### History

| Function                                                       | Return type                                                |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| `saveToHistory(product, content, workflow)`                    | `Promise<HistoryEntry>`                                    |
| `saveToHistoryWithRefs(productId, scriptId, descId, workflow)` | `Promise<PersistedHistoryEntry>`                           |
| `getHistory()`                                                 | `Promise<HistoryEntry[]>`                                  |
| `getHistoryWithRefs(limit)`                                    | `Promise<PersistedHistoryEntry[]>`                         |
| `getHistoryEntry(id)`                                          | `Promise<HistoryEntry \| undefined>`                       |
| `getHistoryEntryWithRefs(id)`                                  | `Promise<{history, product, script, description} \| null>` |
| `clearHistory()`                                               | `Promise<void>`                                            |
| `deleteHistoryEntry(id)`                                       | `Promise<boolean>`                                         |

## ❓ Troubleshooting

### Lỗi "Supabase credentials not configured"

**Nguyên nhân:** `.env` chưa có thông tin Supabase hoặc giá trị là placeholder.

**Cách sửa:**

1. Mở file `.env`
2. Kiểm tra `SUPABASE_URL` và `SUPABASE_ANON_KEY`
3. Đảm bảo không phải giá trị mẫu (`your_supabase_project_url`, `your_supabase_anon_key`)
4. Nếu chưa có, quay lại **Bước 1-4** ở trên

### Lỗi "relation 'products' does not exist"

**Nguyên nhân:** Chưa chạy SQL schema trong Supabase.

**Cách sửa:**

1. Vào Supabase Dashboard → **SQL Editor**
2. Copy nội dung file `supabase-schema.sql`
3. Paste và **Run**
4. Kiểm tra lại trong **Table Editor** xem tables đã có chưa

### Migration thất bại

**Kiểm tra:**

1. ✅ Kết nối internet ổn định
2. ✅ Supabase project đang hoạt động (vào Dashboard kiểm tra)
3. ✅ Credentials đúng trong `.env`
4. ✅ SQL schema đã được chạy
5. ✅ JSON files có dữ liệu hợp lệ

## 🎯 Các lệnh hữu ích

```bash
# Migration dữ liệu từ JSON cũ lên Supabase
npm run migrate

# Chạy bot
npm run dev

# Build và chạy production
npm run build
npm start
```

---

**Cập nhật lần cuối:** 2026-04-08
**Version:** 2.0.0

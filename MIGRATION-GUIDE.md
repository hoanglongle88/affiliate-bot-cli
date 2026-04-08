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

> ⚠️ **Nếu đã có tables cũ:** Xóa tables cũ trước khi chạy schema mới, hoặc dùng `ALTER TABLE` để thêm cột mới.

### Bước 4: Cấu hình .env

Mở file `.env` trong project và cập nhật:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Bước 5: Migration dữ liệu cũ (nếu có)

Nếu bạn đã có dữ liệu trong JSON files cũ (`data/products.json`, `data/history.json`):

```bash
npm run migrate
```

### Bước 6: Chạy bot và kiểm tra

```bash
npm run dev
```

## 📊 Database Schema chi tiết

### Bảng `products`

| Cột           | Kiểu        | Mô tả             |
| ------------- | ----------- | ----------------- |
| `id`          | TEXT        | PRIMARY KEY       |
| `name`        | TEXT        | NOT NULL          |
| `description` | TEXT        | NOT NULL          |
| `price`       | TEXT        | DEFAULT "Chưa có" |
| `rating`      | TEXT        | DEFAULT "Chưa có" |
| `sold`        | TEXT        | DEFAULT "Chưa có" |
| `usage_count` | INTEGER     | DEFAULT 1         |
| `created_at`  | TIMESTAMPTZ | DEFAULT NOW()     |

### Bảng `video_scripts`

Lưu kịch bản video đã tạo bởi AI.

| Cột                  | Kiểu        | Mô tả               |
| -------------------- | ----------- | ------------------- |
| `id`                 | TEXT        | PRIMARY KEY         |
| `product_id`         | TEXT        | FK → products.id    |
| `platform`           | TEXT        | NOT NULL            |
| `title`              | TEXT        | NOT NULL            |
| `hook`               | TEXT        | NOT NULL (5-20 từ)  |
| `body`               | TEXT        | NOT NULL (≥ 2 đoạn) |
| `voiceover_cta`      | TEXT        | NOT NULL (3-15 từ)  |
| `word_count`         | INTEGER     | NOT NULL            |
| `estimated_duration` | TEXT        | NOT NULL            |
| `raw_ai_response`    | JSONB       | nullable            |
| `created_at`         | TIMESTAMPTZ | DEFAULT NOW()       |

### Bảng `post_descriptions`

Lưu caption/mô tả bài đăng. Orchestrator tự ghép caption từ components.

| Cột          | Kiểu        | Mô tả                                |
| ------------ | ----------- | ------------------------------------ |
| `id`         | TEXT        | PRIMARY KEY                          |
| `product_id` | TEXT        | FK → products.id                     |
| `script_id`  | TEXT        | FK → video_scripts.id                |
| `platform`   | TEXT        | NOT NULL                             |
| `headline`   | TEXT        | NOT NULL DEFAULT '' (3-15 từ)        |
| `content`    | TEXT        | NOT NULL DEFAULT '' (30-500 ký tự)   |
| `offer`      | TEXT        | NOT NULL DEFAULT '' (≥ 10 ký tự)     |
| `cta`        | TEXT        | NOT NULL (≥ 5 ký tự)                 |
| `caption`    | TEXT        | NOT NULL (auto-built)                |
| `hashtags`   | TEXT[]      | DEFAULT '{}' (≥ 3 items, không có #) |
| `word_count` | INTEGER     | NOT NULL                             |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW()                        |

### Bảng `trend_briefs`

| Cột               | Kiểu        | Mô tả            |
| ----------------- | ----------- | ---------------- |
| `id`              | TEXT        | PRIMARY KEY      |
| `source`          | TEXT        | NOT NULL         |
| `niche`           | TEXT        | NOT NULL         |
| `product_id`      | TEXT        | FK → products.id |
| `angle`           | TEXT        | NOT NULL         |
| `hook`            | TEXT        | NOT NULL         |
| `hashtags`        | TEXT[]      | DEFAULT '{}'     |
| `pain_point`      | TEXT        | NOT NULL         |
| `cta_angle`       | TEXT        | NOT NULL         |
| `raw_ai_response` | JSONB       | nullable         |
| `created_at`      | TIMESTAMPTZ | DEFAULT NOW()    |

### Bảng `image_briefs`

| Cột                | Kiểu        | Mô tả            |
| ------------------ | ----------- | ---------------- |
| `id`               | TEXT        | PRIMARY KEY      |
| `product_id`       | TEXT        | FK → products.id |
| `ad_platform`      | TEXT        | NOT NULL         |
| `aspect_ratio`     | TEXT        | NOT NULL         |
| `ad_format`        | TEXT        | NOT NULL         |
| `visual_style`     | TEXT        | NOT NULL         |
| `color_palette`    | TEXT[]      | DEFAULT '{}'     |
| `prompt_safe`      | TEXT        | NOT NULL         |
| `prompt_bold`      | TEXT        | NOT NULL         |
| `prompt_lifestyle` | TEXT        | NOT NULL         |
| `negative_prompt`  | TEXT        | NOT NULL         |
| `shooting_notes`   | TEXT        | NOT NULL         |
| `raw_ai_response`  | JSONB       | nullable         |
| `created_at`       | TIMESTAMPTZ | DEFAULT NOW()    |

### Bảng `history`

| Cột              | Kiểu        | Mô tả                                             |
| ---------------- | ----------- | ------------------------------------------------- |
| `id`             | TEXT        | PRIMARY KEY                                       |
| `product_id`     | TEXT        | FK → products.id                                  |
| `script_id`      | TEXT        | FK → video_scripts.id                             |
| `description_id` | TEXT        | FK → post_descriptions.id                         |
| `workflow`       | TEXT        | CHECK (script/description/full/trend/image_brief) |
| `created_at`     | TIMESTAMPTZ | DEFAULT NOW()                                     |

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

### Lỗi "relation 'products' does not exist"

**Nguyên nhân:** Chưa chạy SQL schema trong Supabase.

### Migration thất bại

**Kiểm tra:**

1. ✅ Kết nối internet ổn định
2. ✅ Supabase project đang hoạt động
3. ✅ Credentials đúng trong `.env`
4. ✅ SQL schema đã được chạy

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

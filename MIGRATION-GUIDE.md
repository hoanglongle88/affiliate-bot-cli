# Hướng dẫn Setup Supabase

## 📋 Tổng quan

Bot sử dụng **Supabase (PostgreSQL)** làm storage duy nhất. Không có JSON fallback.

Nếu Supabase chưa được cấu hình trong `.env`, bot sẽ thoát ngay với thông báo lỗi.

### Ưu điểm

✅ **Đa thiết bị**: Dữ liệu đồng bộ across machines
✅ **Backup tự động**: Supabase tự backup hàng ngày
✅ **Query mạnh mẽ**: PostgreSQL queries, filters, pagination
✅ **Scalable**: Không giới hạn file size
✅ **An toàn**: Row Level Security, encrypted at rest
✅ **Miễn phí**: Free tier đủ dùng cho cá nhân

## 🚀 Các bước setup

### Bước 1: Tạo Supabase Project

1. Truy cập https://supabase.com
2. Đăng nhập → **"New Project"**
3. Điền Organization, Project name, Database Password, Region
4. Đợi 1-2 phút

### Bước 2: Lấy thông tin kết nối

1. Project Settings ⚙️ → **API**
2. Copy **Project URL** và **anon public key**

### Bước 3: Chạy SQL Schema

1. SQL Editor → New query
2. Paste nội dung `supabase-schema.sql`
3. Run → Đợi **"Success"**

> ✅ Đã tạo 7 tables: `products`, `video_scripts`, `post_descriptions`, `trend_briefs`, `image_briefs`, `short_video_prompts`, `history`

### Bước 4: Cấu hình .env

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Bước 5: Migration (nếu có dữ liệu cũ)

```bash
npm run migrate
```

### Bước 6: Chạy bot

```bash
npm run dev        # CLI
npm run server     # API Server
npm run web        # Web Dashboard (dev)
```

## 📊 Database Schema

### Bảng `products`

| Cột           | Kiểu        | Mô tả             |
| ------------- | ----------- | ----------------- |
| `id`          | TEXT        | PRIMARY KEY       |
| `name`        | TEXT        | NOT NULL          |
| `description` | TEXT        | NOT NULL          |
| `price`       | TEXT        | DEFAULT "Chưa có" |
| `rating`      | TEXT        | DEFAULT "Chưa có" |
| `sold`        | TEXT        | DEFAULT "Chưa có" |
| `usp`         | TEXT        | nullable          |
| `usage_count` | INTEGER     | DEFAULT 1         |
| `created_at`  | TIMESTAMPTZ | DEFAULT NOW()     |

> ⚠️ **Nếu chưa có cột `usp`**: Chạy lệnh này trong SQL Editor:
>
> ```sql
> ALTER TABLE products ADD COLUMN IF NOT EXISTS usp TEXT;
> ```

### Bảng `video_scripts`

| Cột                  | Kiểu        | Mô tả            |
| -------------------- | ----------- | ---------------- |
| `id`                 | TEXT        | PRIMARY KEY      |
| `product_id`         | TEXT        | FK → products.id |
| `platform`           | TEXT        | NOT NULL         |
| `title`              | TEXT        | NOT NULL         |
| `hook`               | TEXT        | NOT NULL         |
| `body`               | TEXT        | NOT NULL         |
| `voiceover_cta`      | TEXT        | NOT NULL         |
| `word_count`         | INTEGER     | NOT NULL         |
| `estimated_duration` | TEXT        | NOT NULL         |
| `raw_ai_response`    | JSONB       | nullable         |
| `created_at`         | TIMESTAMPTZ | DEFAULT NOW()    |

### Bảng `post_descriptions`

| Cột          | Kiểu        | Mô tả                 |
| ------------ | ----------- | --------------------- |
| `id`         | TEXT        | PRIMARY KEY           |
| `product_id` | TEXT        | FK → products.id      |
| `script_id`  | TEXT        | FK → video_scripts.id |
| `platform`   | TEXT        | NOT NULL              |
| `headline`   | TEXT        | NOT NULL DEFAULT ''   |
| `content`    | TEXT        | NOT NULL DEFAULT ''   |
| `offer`      | TEXT        | NOT NULL DEFAULT ''   |
| `caption`    | TEXT        | NOT NULL              |
| `hashtags`   | TEXT[]      | DEFAULT '{}'          |
| `cta`        | TEXT        | NOT NULL              |
| `word_count` | INTEGER     | NOT NULL              |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW()         |

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

### Bảng `short_video_prompts`

| Cột              | Kiểu        | Mô tả                  |
| ---------------- | ----------- | ---------------------- |
| `id`             | TEXT        | PRIMARY KEY            |
| `product_id`     | TEXT        | FK → products.id       |
| `script_id`      | TEXT        | FK → video_scripts.id  |
| `style_analysis` | TEXT        | NOT NULL               |
| `video_prompt`   | TEXT        | NOT NULL               |
| `aspect_ratio`   | TEXT        | DEFAULT '9:16'         |
| `visual_quality` | TEXT        | DEFAULT '1080p, 60fps' |
| `created_at`     | TIMESTAMPTZ | DEFAULT NOW()          |

### Bảng `history`

| Cột              | Kiểu        | Mô tả                                                         |
| ---------------- | ----------- | ------------------------------------------------------------- |
| `id`             | TEXT        | PRIMARY KEY                                                   |
| `product_id`     | TEXT        | FK → products.id                                              |
| `script_id`      | TEXT        | FK → video_scripts.id                                         |
| `description_id` | TEXT        | FK → post_descriptions.id                                     |
| `workflow`       | TEXT        | CHECK (script/description/full/trend/image_brief/short_video) |
| `created_at`     | TIMESTAMPTZ | DEFAULT NOW()                                                 |

## 🔧 API Endpoints

### Scripts

| Method   | Endpoint                      | Mô tả                             |
| -------- | ----------------------------- | --------------------------------- |
| `POST`   | `/api/scripts`                | Generate video script             |
| `GET`    | `/api/scripts/history`        | List scripts (pagination, filter) |
| `GET`    | `/api/scripts/:id`            | Get script by ID                  |
| `POST`   | `/api/scripts/:id/regenerate` | Regenerate script (same ID)       |
| `DELETE` | `/api/scripts/:id`            | Delete script                     |
| `POST`   | `/api/scripts/bulk-delete`    | Delete multiple scripts           |
| `POST`   | `/api/scripts/export`         | Export scripts to TXT             |

### Products

| Method   | Endpoint                                 | Mô tả                                          |
| -------- | ---------------------------------------- | ---------------------------------------------- |
| `GET`    | `/api/products?page=1&limit=10&q=&sort=` | List products (server-side search, pagination) |
| `GET`    | `/api/products/export`                   | Export ALL products as CSV                     |
| `POST`   | `/api/products/import`                   | Import products from CSV                       |
| `POST`   | `/api/products`                          | Create product                                 |
| `PUT`    | `/api/products/:id`                      | Update product (by ID)                         |
| `DELETE` | `/api/products/:id`                      | Delete product                                 |
| `POST`   | `/api/products/bulk-delete`              | Delete multiple products                       |
| `DELETE` | `/api/products`                          | Delete all products (dangerous)                |

### Content Generation

| Method | Endpoint           | Mô tả                     |
| ------ | ------------------ | ------------------------- |
| `POST` | `/api/scripts`     | Generate video script     |
| `POST` | `/api/captions`    | Generate caption          |
| `POST` | `/api/short`       | Generate Veo video prompt |
| `POST` | `/api/image`       | Generate image brief      |
| `POST` | `/api/trends/scan` | Scan trend                |

### Dashboard

| Method   | Endpoint           | Mô tả                        |
| -------- | ------------------ | ---------------------------- |
| `GET`    | `/api/stats`       | Dashboard stats (cached 10s) |
| `GET`    | `/api/history`     | History entries              |
| `DELETE` | `/api/history/:id` | Delete history entry         |
| `GET`    | `/api/health`      | Health check                 |

## ❓ Troubleshooting

### "Supabase credentials not configured"

`.env` chưa có thông tin Supabase hoặc giá trị là placeholder.

### "relation 'products' does not exist"

Chưa chạy SQL schema trong Supabase.

### "Gemini API đã hết quota (429)"

API key Gemini đã hết free tier quota. Nâng cấp paid plan hoặc dùng Ollama.

### Migration thất bại

Kiểm tra: internet, Supabase hoạt động, credentials đúng, schema đã chạy.

## 🎯 Các lệnh hữu ích

```bash
# Migration dữ liệu từ JSON cũ lên Supabase
npm run migrate

# Chạy CLI
npm run dev

# Chạy API Server
npm run server

# Chạy Web Dashboard (dev)
npm run web

# Build production
npm run build
npm run web:build
npm run server:prod
```

---

## 📝 Changelog

### v2.1.0 — 2026-04-09

#### Scripts Module

- ✅ Server-side pagination (offset/limit) thay vì load 1000 records
- ✅ Regenerate script giữ nguyên ID (update thay vì delete+create)
- ✅ Bulk delete scripts (1 query Supabase `.in()`)
- ✅ Validation → warning (vẫn lưu script dù có cảnh báo)
- ✅ Debounce generate button (3s cooldown)
- ✅ Product selector với autocomplete, auto-fill form
- ✅ Platform filter dropdown
- ✅ Hook preview trong script list cards
- ✅ Copy riêng từng phần (Hook/Body/CTA)
- ✅ Bulk select/delete/export với checkbox
- ✅ Axios timeout 60s + error interceptor tập trung
- ✅ Rate limiting: AI endpoints 10/5min, export 3/5min

#### Products Module

- ✅ Server-side pagination + search + sort (Supabase `.range()`, `.or()`)
- ✅ Fix `usp` persistence — lưu/get/update đầy đủ
- ✅ Fix PUT update theo ID (không còn upsert theo name)
- ✅ CSV injection protection (export + import sanitization)
- ✅ Bulk delete products (1 query `.in()`, cap 100 IDs)
- ✅ Delete all confirmation modal (cascade delete warning)
- ✅ Search debounce 400ms, fix double-fetch bug
- ✅ Backend validation (length limits, trim whitespace)
- ✅ Import không increment `usageCount` khi update
- ✅ Export dùng axios instance thay vì raw fetch
- ✅ Rate limiting: import 5/5min, export 5/5min, deleteAll 2/15min

### v2.0.0 — 2026-04-08

- Migration lên Supabase làm storage duy nhất

---

**Cập nhật lần cuối:** 2026-04-09
**Version:** 2.1.0

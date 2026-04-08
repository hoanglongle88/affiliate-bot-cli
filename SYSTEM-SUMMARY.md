# 🤖 Affiliate Bot CLI - Tóm tắt hệ thống

## 📋 Tổng quan

Công cụ CLI tạo nội dung affiliate marketing đa nền tảng (TikTok, YouTube, Facebook Reels, Instagram Reels, Facebook Ads) sử dụng AI Ollama/Gemini. Dữ liệu lưu Supabase (PostgreSQL).

---

## 🎯 7 Chức năng chính

### 1. 🔍 Trend Researcher — Nghiên cứu xu hướng

**Workflow:** `trendscan`

- AI research web → tìm sản phẩm HOT theo niche
- Tạo TrendBrief + lưu product + lưu trend brief vào DB
- Sau research: user chọn → Tạo script / Tạo description / Scan niche khác / Menu
- Progress indicator với elapsed time

### 2. 🎬 Video Creator — Kịch bản video đa nền tảng

**Workflow:** `script`

- 5 nền tảng: TikTok, YouTube, FB Reels, IG Reels, FB Ads
- AI tạo kịch bản conversion-focused (60s vàng)
- Cấu trúc: Hook → Problem → Solution → CTA
- Title tự động dựa trên angle (pain-point/price-shock/social-proof/curiosity)
- **Tự lưu script vào DB** (`video_scripts` table)
- Post-actions: Copy / Export / Edit / Regenerate / ⏮️ Back / Menu

### 3. ✍️ Marketing Writer — Caption theo nền tảng

**Workflow:** `description`

- Caption tối ưu CTR cho từng nền tảng
- Cấu trúc: Hook → Problem/Solution → Social Proof → CTA → Hashtags
- Hashtags auto-default theo nền tảng
- **Tự lưu caption vào DB** (`post_descriptions` table), link với script qua `script_id`
- Post-actions: Copy / Export / Edit / Regenerate / ⏮️ Back / Menu

### 4. 🎨 Image Creator — Creative brief ảnh ads

**Workflow:** `imagebrief`

- Chọn sản phẩm → nền tảng ads → tỷ lệ ảnh
- AI tạo brief: format, visual style, color palette, 3 prompts (safe/bold/lifestyle)
- **Tự lưu brief vào DB** (`image_briefs` table)
- Post-actions: Copy / Export / Regenerate / Menu

### 5. 🎤 TTS Voice — Google Text-to-Speech

**Workflow:** `tts`

- Chọn script từ history hoặc tạo mới
- Google TTS Vietnamese → MP3
- Lưu `/output/audio/`

### 6. 📜 History — Quản lý nội dung

- Xem 50 entry gần nhất (tối đa 100 trong DB)
- 🗑️ Xóa toàn bộ lịch sử (có xác nhận)
- Copy / Export / Xóa entry / Tạo lại
- History lưu reference IDs → content tables, không nhúng toàn bộ content

### 7. 📦 Products — Quản lý sản phẩm

- Xem sản phẩm đã lưu + usage count
- 🗑️ Xóa toàn bộ sản phẩm (có xác nhận)
- Navigation: ⏮️ Back → danh sách, Menu → menu chính

---

## 🧩 4 AI Agents

### 1. AutonomousTrendScanner (`agents/trend-scanner.ts`)

- `scanAndGenerate(niche?)` → `{ brief, product, trendBriefId }`
- Progress indicator: `⏳ Đang research trend... X.Xs`
- Tự lưu product + trend brief vào DB
- Chỉ research, KHÔNG gọi agents khác

### 2. VideoCreatorAgent (`agents/video-creator.ts`)

- `generateScript(product, platform, productId?)` → `{ script, savedId }`
- Progress indicator: `⏳ Đang tạo kịch bản... X.Xs`
- Tự lưu script vào DB (`video_scripts` table)
- Parse JSON: hook, body, cta, script (merged), angle, platform_vibe, visual_cues
- Title angle-based: "Đừng mua nếu chưa biết", "Giá không tưởng", v.v.

### 3. MarketingWriterAgent (`agents/marketing-writer.ts`)

- `generateDescription(product, scriptSummary, platform, productId?, scriptId?, targetAudience?)` → `{ description, savedId }`
- Progress indicator: `⏳ Đang tạo mô tả... X.Xs`
- Tự lưu caption vào DB (`post_descriptions` table)
- Auto-default hashtags theo nền tảng
- Giữ emoji trong caption, chỉ remove hashtags

### 4. ImageCreatorAgent (`agents/image-creator.ts`)

- `generateBrief(input, productId?)` → `{ brief, savedId }`
- Progress indicator: `⏳ Đang tạo brief ảnh... X.Xs`
- Tự lưu brief vào DB (`image_briefs` table)
- 3 prompts: safe, bold, lifestyle

---

## 🌐 5 Nền tảng

```typescript
type Platform =
  | "tiktok" // POV, tự nhiên, Gen Z
  | "youtube" // Nhanh gọn, SEO
  | "facebook_reels" // Tò mò, life hacks
  | "instagram_reels" // Aesthetic, lifestyle
  | "facebook_ads"; // Chuyên nghiệp, chốt đơn
```

---

## 📝 AI Prompts

### Video Creator (`prompts/video-creator.ts`)

- **SYSTEM**: Đạo diễn sáng tạo + Conversion Copywriter. Cấu trúc 60s vàng: Hook → Problem → Solution → CTA.
- **Output JSON**: `platform_vibe`, `angle`, `target_persona`, `hook`, `body`, `cta`, `visual_cues`, `script`
- **User prompt**: Product info + platform context (5 nền tảng)

### Marketing Writer (`prompts/marketing-writer.ts`)

- **SYSTEM**: Senior Conversion Copywriter đa kênh. PAS/AIDA framework.
- **Cấu trúc**: Hook → Body (3-4 dòng) → CTA → Hashtags
- **User prompt**: `{ name, usp, targetAudience, price }` + scriptSummary + platform

### Trend Researcher (`prompts/trend-researcher.ts`)

- **SYSTEM**: Chuyên gia nghiên cứu xu hướng VN, dùng web search tìm data thực.
- **Output JSON**: productName, price, rating, sold, views, trendPercent, description, angle, hook, hashtags, painPoint, ctaAngle

### Image Creator (`prompts/image-creator.ts`)

- **SYSTEM**: Art Director cho ads. Visual guidelines theo ngành.
- **Output JSON**: adFormat, visualStyle, colorPalette, prompts (safe/bold/lifestyle), negativePrompt, shootingNotes

---

## ✅ Validation

| Loại            | Rules                                                      |
| --------------- | ---------------------------------------------------------- |
| **Script**      | 80-150 từ, hook ≥ 10 chars, body ≥ 50 chars, CTA ≥ 5 chars |
| **Description** | 100-300 từ, ≥ 3 hashtags, CTA ≥ 5 chars                    |

**Retry:** Tối đa 2 lần, hiển thị cảnh báo nếu không đạt.

---

## 🗑️ Xóa dữ liệu

- `deleteAllProducts()` → Supabase `DELETE FROM products`
- `clearHistory()` → Supabase `DELETE FROM history`
- `deleteAllVideoScripts()` → Supabase `DELETE FROM video_scripts`
- `deleteAllPostDescriptions()` → Supabase `DELETE FROM post_descriptions`
- `deleteAllTrendBriefs()` → Supabase `DELETE FROM trend_briefs`
- `deleteAllImageBriefs()` → Supabase `DELETE FROM image_briefs`
- Tất cả có xác nhận trước khi thực thi.

---

## 🔐 Database

**Storage:** Supabase (PostgreSQL) — không có JSON fallback.

Nếu Supabase chưa được cấu hình trong `.env`, bot sẽ thoát với lỗi.

### 6 Tables

| Table               | Mô tả                         |
| ------------------- | ----------------------------- |
| `products`          | Sản phẩm đã lưu               |
| `video_scripts`     | Kịch bản video AI đã tạo      |
| `post_descriptions` | Caption bài đăng AI đã tạo    |
| `trend_briefs`      | Kết quả research trend        |
| `image_briefs`      | Creative brief ảnh ads        |
| `history`           | Lịch sử tạo content (ref IDs) |

---

## 🛠️ Tính năng nổi bật

- ✏️ Chỉnh sửa hook/body/CTA/caption trong editor
- 💾 Copy clipboard / Export `.txt`
- 🔄 Products lưu tự động, theo dõi usage count
- 📋 Chọn script đã lưu làm context cho caption (4 nguồn: script product, all scripts, manual, AI-gen)
- ⏮️ Back navigation: Quay lại bước trước hoặc menu
- 🗑️ Xóa toàn bộ products/history (có xác nhận)
- ⏳ Progress indicator với elapsed time cho mọi AI call
- 📋 Menu phân nhóm, header chi tiết per feature
- 🎨 Chalk colors, empty state hints

---

_Cập nhật: 2026-04-08_

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

### 2. 🎬 Video Creator — Kịch bản video đa nền tảng

**Workflow:** `script`

- 5 nền tảng: TikTok, YouTube, FB Reels, IG Reels, FB Ads
- AI tạo kịch bản conversion-focused (60s vàng)
- Cấu trúc: Hook → Body (≥ 2 đoạn) → CTA
- Orchestrator lưu sau khi validation pass

### 3. ✍️ Marketing Writer — Caption theo nền tảng

**Workflow:** `description`

- Caption tối ưu CTR cho từng nền tảng
- Cấu trúc: Headline → Content → Offer → CTA → Hashtags
- Orchestrator tự ghép caption từ components
- Link với script qua `script_id`

### 4. 🎨 Image Creator — Creative brief ảnh ads

**Workflow:** `imagebrief`

- Chọn sản phẩm → nền tảng ads → tỷ lệ ảnh
- AI tạo brief: format, visual style, color palette, 3 prompts (safe/bold/lifestyle)

### 5. 🎤 TTS Voice — Google Text-to-Speech

**Workflow:** `tts`

- Chọn script từ history hoặc tạo mới
- Google TTS Vietnamese → MP3
- Lưu `/output/audio/`

### 6. 📜 History — Quản lý nội dung

- Xem 50 entry gần nhất (tối đa 100 trong DB)
- History lưu reference IDs → content tables
- Copy / Export / Xóa entry / Tạo lại

### 7. 📦 Products — Quản lý sản phẩm

- Xem sản phẩm đã lưu + usage count
- 🗑️ Xóa toàn bộ sản phẩm (có xác nhận)

---

## 🧩 4 AI Agents

### 1. AutonomousTrendScanner (`agents/trend-scanner.ts`)

- `scanAndGenerate(niche?)` → `{ brief, product }`
- **KHÔNG tự lưu DB** — Orchestrator lưu product + trend brief
- Chỉ research, KHÔNG gọi agents khác

### 2. VideoCreatorAgent (`agents/video-creator.ts`)

- `generateScript(product, platform)` → `VideoScript`
- **KHÔNG tự lưu DB** — Orchestrator lưu sau khi validation pass
- Parse JSON: angle, hook, body, cta, script, visual_cues

### 3. MarketingWriterAgent (`agents/marketing-writer.ts`)

- `generateDescription(product, scriptSummary, platform, targetAudience?)` → `PostDescription`
- **KHÔNG tự lưu DB** — Orchestrator lưu sau khi validation pass
- Parse JSON: headline, content, offer, cta, hashtags[]

### 4. ImageCreatorAgent (`agents/image-creator.ts`)

- `generateBrief(input)` → `ImagePromptOutput`
- **KHÔNG tự lưu DB** — Orchestrator lưu sau khi hiển thị
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

### Video Creator

- **SYSTEM**: Đạo diễn sáng tạo + Conversion Copywriter. Cấu trúc 60s vàng.
- **JSON Output**: `angle`, `hook` (5-20 từ), `body` (≥ 2 đoạn), `cta` (3-15 từ), `script` (lời thoại thuần), `visual_cues[]`

### Marketing Writer

- **SYSTEM**: Senior Conversion Copywriter đa kênh. PAS/AIDA framework.
- **JSON Output**: `headline` (3-15 từ), `content` (30-500 ký tự), `offer` (≥ 10 ký tự), `cta` (≥ 5 ký tự), `hashtags[]` (array, không có #)
- **Rule quan trọng**: Content KHÔNG trùng lặp với hook của video script
- **Caption auto-built**: Orchestrator ghép từ headline + content + offer + cta + hashtags

### Trend Researcher

- **SYSTEM**: Chuyên gia nghiên cứu xu hướng VN, dùng web search
- **JSON Output**: productName, price, rating, sold, views, trendPercent, description, angle, hook, hashtags, painPoint, ctaAngle

### Image Creator

- **SYSTEM**: Art Director cho ads
- **JSON Output**: adFormat, visualStyle, colorPalette, prompts (safe/bold/lifestyle), negativePrompt, shootingNotes

---

## ✅ Validation

### VideoScript

| Rule       | Yêu cầu                               |
| ---------- | ------------------------------------- |
| **Hook**   | 5-20 từ                               |
| **Body**   | ≥ 2 đoạn (tách bằng `\n`)             |
| **CTA**    | 3-15 từ                               |
| **Script** | Không rỗng, chỉ lời thoại (không rác) |

### PostDescription

| Rule         | Yêu cầu                           |
| ------------ | --------------------------------- |
| **Headline** | 3-15 từ                           |
| **Content**  | 30-500 ký tự                      |
| **Offer**    | ≥ 10 ký tự                        |
| **CTA**      | ≥ 5 ký tự                         |
| **Hashtags** | ≥ 3 items (array, không có dấu #) |

**Caption tự động ghép:** Orchestrator tự build caption từ headline + content + offer + cta + hashtags — không bắt AI tạo thêm caption.

**Retry:** Tối đa 2 lần, hiển thị cảnh báo nếu không đạt.

---

## 🗑️ Xóa dữ liệu

- `deleteAllProducts()` → Supabase `DELETE FROM products`
- `clearHistory()` → Supabase `DELETE FROM history`
- `deleteAllVideoScripts()` → Supabase `DELETE FROM video_scripts`
- `deleteAllPostDescriptions()` → Supabase `DELETE FROM post_descriptions`
- `deleteAllTrendBriefs()` → Supabase `DELETE FROM trend_briefs`
- `deleteAllImageBriefs()` → Supabase `DELETE FROM image_briefs`

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
- 📝 Orchestrator tự ghép caption từ components — tiết kiệm token, format chuẩn
- ⏮️ Back navigation: Quay lại bước trước hoặc menu
- 🗑️ Xóa toàn bộ products/history (có xác nhận)
- ⏳ Progress indicator với elapsed time cho mọi AI call
- 🎨 Chalk colors, empty state hints

---

_Cập nhật: 2026-04-08_

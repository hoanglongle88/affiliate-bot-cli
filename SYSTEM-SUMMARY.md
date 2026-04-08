# 🤖 Affiliate Bot CLI - Tóm tắt hệ thống

## 📋 Tổng quan

Công cụ CLI + Web Dashboard tạo nội dung affiliate marketing đa nền tảng (TikTok, YouTube, Facebook Reels, Instagram Reels, Facebook Ads) sử dụng AI Ollama/Gemini. Dữ liệu lưu Supabase (PostgreSQL).

---

## 🎯 Chức năng chính

### CLI (9 chức năng)

| #   | Chức năng           | Mô tả                                   |
| --- | ------------------- | --------------------------------------- |
| 1   | 🔍 Trend Researcher | Quét trend, tìm sản phẩm hot theo niche |
| 2   | 🎬 Video Creator    | Tạo kịch bản video TikTok/YouTube       |
| 3   | ✍️ Marketing Writer | Tạo caption & hashtags bài đăng         |
| 4   | 🎨 Image Creator    | Tạo brief ảnh ads (prompt AI)           |
| 5   | 🎬 Short Creator    | Video prompt cho AI Veo                 |
| 6   | 🎤 TTS Voice        | Chuyển kịch bản thành giọng nói         |
| 7   | 📜 History          | Xem & quản lý nội dung đã tạo           |
| 8   | 📦 Products         | Xem & quản lý sản phẩm                  |
| 9   | ⚙️ System / Usage   | Kiểm tra kết nối AI + thống kê          |

### Web Dashboard (9 pages)

| Page           | Tính năng                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------- |
| **Tổng quan**  | Stats cards (products, scripts, captions, trends) + API status                                      |
| **Sản phẩm**   | CRUD, sort, search, pagination, import/export CSV, tooltips, toast, optimistic updates, empty state |
| **Kịch bản**   | Form tạo script video với AI                                                                        |
| **Caption**    | Form tạo caption bài đăng với AI                                                                    |
| **Quét Trend** | Auto/manual scan trend sản phẩm                                                                     |
| **Video Veo**  | Storyboard timeline cho AI video generation                                                         |
| **Brief Ảnh**  | 3 prompts (safe/bold/lifestyle) + color palette                                                     |
| **Lịch sử**    | Danh sách entries theo sản phẩm                                                                     |
| **Máy chủ**    | Health check + API endpoints list                                                                   |

---

## 🧩 5 AI Agents

| Agent                      | Vai trò                    | Đầu ra               |
| -------------------------- | -------------------------- | -------------------- |
| **AutonomousTrendScanner** | Research trend web         | TrendBrief + Product |
| **VideoCreatorAgent**      | Kịch bản video đa nền tảng | VideoScript          |
| **MarketingWriterAgent**   | Caption theo nền tảng      | PostDescription      |
| **ImageCreatorAgent**      | Creative brief ảnh ads     | ImagePromptOutput    |
| **ShortCreatorAgent**      | Storyboard timeline Veo    | ShortVideoPrompt     |

**Nguyên tắc:** Mỗi agent chỉ **1 trách nhiệm duy nhất** — generate content, KHÔNG gọi agent khác, KHÔNG lưu DB. Orchestrator lưu sau khi validation pass.

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

- **SYSTEM**: Đạo diễn sáng tạo + Conversion Copywriter
- **Output**: `angle`, `hook` (5-20 từ), `body` (≥ 2 đoạn), `cta` (3-15 từ), `script`, `visual_cues[]`
- **Auto-infer**: Description/USP trống → AI tự suy luận từ tên sản phẩm

### Marketing Writer

- **SYSTEM**: Senior Conversion Copywriter đa kênh
- **Output**: `headline` (3-15 từ), `content` (30-500 ký tự), `offer`, `cta`, `hashtags[]`
- **Caption auto-built**: Orchestrator ghép từ headline + content + offer + cta + hashtags

### Trend Researcher

- **SYSTEM**: Chuyên gia nghiên cứu xu hướng VN, dùng web search
- **Output**: productName, price, rating, sold, views, trendPercent, angle, hook, hashtags, painPoint

### Image Creator

- **SYSTEM**: Art Director cho ads
- **Output**: adFormat, visualStyle, colorPalette, prompts (safe/bold/lifestyle), negativePrompt

### Short Creator

- **SYSTEM**: Đạo diễn hình ảnh + Biên tập viên hậu kỳ
- **Output**: `total_duration`, `visual_style`, `timeline[]` (range, content, prompt), `video_prompt_full`

---

## ✅ Validation

### VideoScript

| Rule       | Yêu cầu                   |
| ---------- | ------------------------- |
| **Hook**   | 5-20 từ                   |
| **Body**   | ≥ 2 đoạn (tách bằng `\n`) |
| **CTA**    | 3-15 từ                   |
| **Script** | Không rỗng, chỉ lời thoại |

### PostDescription

| Rule         | Yêu cầu                       |
| ------------ | ----------------------------- |
| **Headline** | 3-15 từ                       |
| **Content**  | 30-500 ký tự                  |
| **Offer**    | ≥ 10 ký tự                    |
| **CTA**      | ≥ 5 ký tự                     |
| **Hashtags** | ≥ 3 items (array, không có #) |

**Retry:** Tối đa 2 lần, hiển thị cảnh báo nếu không đạt.

---

## 🔐 Database

**Storage:** Supabase (PostgreSQL) — không có JSON fallback.

### 7 Tables

| Table                 | Mô tả                         |
| --------------------- | ----------------------------- |
| `products`            | Sản phẩm đã lưu               |
| `video_scripts`       | Kịch bản video AI đã tạo      |
| `post_descriptions`   | Caption bài đăng AI đã tạo    |
| `trend_briefs`        | Kết quả research trend        |
| `image_briefs`        | Creative brief ảnh ads        |
| `short_video_prompts` | Storyboard timeline cho Veo   |
| `history`             | Lịch sử tạo content (ref IDs) |

---

## 🛠️ Tính năng nổi bật

- 🎨 **UI chuẩn UX** — Back/exit nhất quán, tooltips, toast notifications
- ✏️ Chỉnh sửa hook/body/CTA/caption trong editor
- 💾 Copy clipboard / Export `.txt` / Import-Export CSV
- 📊 Sort (6 options), search (debounce 300ms), pagination (10/page)
- 🔄 Optimistic updates với rollback khi lỗi
- 📦 Empty state với CTA khi không có dữ liệu
- 📋 Chọn script đã lưu làm context cho caption (4 nguồn)
- ⏳ Progress indicator với elapsed time cho mọi AI call
- 🌐 Responsive: desktop table ↔ mobile cards

---

_Cập nhật: 2026-04-08_

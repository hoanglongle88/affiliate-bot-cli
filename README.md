# 🤖 Affiliate Bot CLI

Công cụ tạo nội dung affiliate marketing tự động sử dụng AI (Ollama / Gemini) cho **TikTok, YouTube, Facebook Reels, Instagram Reels và Facebook Ads**.

## 📋 Tổng quan

**Affiliate Bot CLI** là công cụ dòng lệnh (CLI) kết hợp **Web Dashboard** giúp tự động hóa việc tạo nội dung affiliate marketing đa nền tảng. Sử dụng AI (Ollama local hoặc Google Gemini cloud), công cụ có thể:

- 🔍 **Quét trend tự động**: Nghiên cứu xu hướng thị trường, tìm sản phẩm hot
- 🎬 **Tạo kịch bản video**: Kịch bản 30-60 giây tối ưu cho TikTok/Reels/Shorts
- ✍️ **Tạo caption bài đăng**: Mô tả hấp dẫn với hashtags, CTA, social proof — theo từng nền tảng
- 🎨 **Tạo brief ảnh ads**: Creative brief + image prompts cho AI Image Generator
- 🎬 **Tạo video prompt cho AI Veo**: Storyboard timeline chi tiết từ kịch bản
- 🎤 **Chuyển giọng nói AI**: Text-to-Speech tiếng Việt
- 📦 **Quản lý thông minh**: Lưu sản phẩm, lịch sử, tái sử dụng qua Supabase
- 📥 **Import/Export CSV**: Nhập xuất sản phẩm hàng loạt

## 🚀 Cài đặt nhanh

```bash
cd affiliate-bot-cli
npm install
cp .env.example .env
# Cấu hình SUPABASE_URL và SUPABASE_ANON_KEY trong .env
npm run dev        # Chạy CLI
npm run server     # Chạy API Server
npm run web        # Chạy Web Dashboard (dev)
```

## ⚙️ Cấu hình .env

```env
# Ollama (Local AI)
OLLAMA_MODEL=llama3.2
OLLAMA_BASE_URL=http://localhost:11434

# Google Gemini (Cloud AI - Optional, requires paid plan)
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash
AI_PROVIDER=ollama

# Supabase (Required)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

> ⚠️ **Supabase là bắt buộc.** Bot sẽ thoát nếu chưa cấu hình Supabase.

## ✨ Tính năng

### 🎯 Menu chính — 11 chức năng

```
📌 TÍNH NĂNG CHÍNH:
  Trend Researcher — Quét trend, tìm sản phẩm hot
  Video Creator — Tạo kịch bản video
  Marketing Writer — Tạo caption & hashtags
  Image Creator — Tạo brief ảnh ads
  Short Creator — Video prompt cho AI Veo
  TTS Voice — Chuyển kịch bản thành giọng nói
  History — Xem & quản lý nội dung đã tạo
  Products — Xem & quản lý sản phẩm
  Import CSV — Nhập sản phẩm hàng loạt
  System — Kiểm tra kết nối AI
  Usage — Xem thống kê sử dụng AI
```

### 🌐 5 nền tảng hỗ trợ

| Nền tảng               | Kịch bản video             | Caption            | CTA mặc định       |
| ---------------------- | -------------------------- | ------------------ | ------------------ |
| **📱 TikTok**          | POV, tự nhiên, trend Gen Z | Giỏ hàng góc trái  | "Bấm vào giỏ hàng" |
| **▶️ YouTube Shorts**  | Nhanh gọn, SEO-friendly    | Link comment       | "Link ở comment"   |
| **📘 Facebook Reels**  | Tò mò, life hacks          | Link comment/inbox | "Inbox ngay"       |
| **📸 Instagram Reels** | Aesthetic, lifestyle       | Link bio           | "Xem tại Bio"      |
| **📢 Facebook Ads**    | Chuyên nghiệp, cam kết     | Chốt đơn trực tiếp | "Mua ngay"         |

### 🎨 12 Niches (Ngách sản phẩm)

Gia dụng · Thời trang nữ/nam · Công nghệ · Mỹ phẩm · Sức khỏe · Mẹ & bé · Nhà cửa · Thể thao · Thú cưng · Ô tô/Xe máy · Đồ ăn

---

## 🧩 5 AI Agents

| Agent                      | Vai trò                    | Đầu ra               |
| -------------------------- | -------------------------- | -------------------- |
| **AutonomousTrendScanner** | Research trend web         | TrendBrief + Product |
| **VideoCreatorAgent**      | Kịch bản video đa nền tảng | VideoScript          |
| **MarketingWriterAgent**   | Caption theo nền tảng      | PostDescription      |
| **ImageCreatorAgent**      | Creative brief ảnh ads     | ImagePromptOutput    |
| **ShortCreatorAgent**      | Storyboard timeline Veo    | ShortVideoPrompt     |

**Nguyên tắc:** Mỗi agent chỉ **1 trách nhiệm duy nhất** — generate content, KHÔNG gọi agent khác, KHÔNG lưu DB. Orchestrator lưu sau khi validation pass (chỉ lưu bản final).

---

## 📊 Luồng dữ liệu

```
User Input → Chọn Agent → AI Orchestrator → Ollama/Gemini
       ↓
  Parse Response (JSON)
       ↓
  Validation (retry tối đa 2 lần)
       ↓
  Orchestrator lưu bản FINAL vào DB riêng:
    - VideoScript → video_scripts table
    - PostDescription → post_descriptions table
    - TrendBrief → trend_briefs table
    - ImageBrief → image_briefs table
    - ShortVideo → short_video_prompts table
       ↓
  History lưu reference IDs (không nhúng content)
       ↓
  Formatting → Display → Post-Actions: Copy / Export / Edit / Regenerate
```

---

## 📂 Cấu trúc thư mục

```
affiliate-bot-cli/
├── src/              # Source code TypeScript
│   ├── agents/       # 5 AI agents
│   ├── api/routes/   # REST API endpoints (rate limited)
│   ├── config/       # Niche config
│   ├── data/         # Storage layer (Supabase)
│   ├── prompts/      # AI prompt definitions
│   ├── services/     # AI clients, TTS, etc.
│   ├── types/        # TypeScript types
│   ├── utils/        # Helpers (validators)
│   └── index.ts      # CLI entry point
├── web/              # React Web Dashboard
│   ├── src/
│   │   ├── core/        # Shared core module
│   │   │   ├── components/  # Reusable UI (ErrorBoundary, Tooltip)
│   │   │   ├── config/      # Axios instance (timeout, interceptors)
│   │   │   ├── constants/   # App constants
│   │   │   ├── helper/      # Validation helpers
│   │   │   ├── hooks/       # Custom hooks (useProducts, useScripts...)
│   │   │   ├── interfaces/  # TypeScript interfaces
│   │   │   └── services/    # API clients per module
│   │   └── pages/       # Page components
│   └── dist/         # Production build
├── output/audio/     # File TTS MP3
├── exports/          # File export .txt
├── data/             # CSV files để import
├── .env              # Cấu hình cá nhân
└── supabase-schema.sql # Database schema
```

---

## 🗑️ Xóa dữ liệu

- **Xóa toàn bộ sản phẩm:** Products → `🗑️ Xóa TOÀN BỘ sản phẩm`
- **Xóa toàn bộ lịch sử:** History → `🗑️ Xóa TOÀN BỘ lịch sử`
- **Xóa từng entry:** Xem chi tiết → Xóa
- Tất cả có xác nhận, hoạt động trên Supabase

---

## 🗺️ Roadmap

- [x] Module 1: Tạo nội dung AI (kịch bản + mô tả) — đa nền tảng
- [x] Module 2: Tạo voice từ kịch bản (Google TTS)
- [x] Module 2.5: Trend Researcher
- [x] Module 2.6: Image Creator (creative brief)
- [x] Module 2.7: Short Creator (video prompt cho AI Veo)
- [x] Storage: Database riêng cho scripts, descriptions, briefs (Supabase only)
- [x] Export/Import CSV cho products
- [x] Web Dashboard (React + Vite + Tailwind)
- [x] Scripts module: server-side pagination, bulk operations, regenerate, rate limiting
- [x] Products module: server-side pagination, bulk operations, CSV injection protection, rate limiting
- [ ] Module 3: Tạo video từ script + voice (FFmpeg)
- [ ] Module 4: Auto tạo ảnh từ brief (AI Image API)
- [ ] Module 5: Thống kê & analytics

---

## 🔒 Bảo mật & Production

### Rate Limiting

| Endpoint                                               | Giới hạn     |
| ------------------------------------------------------ | ------------ |
| AI endpoints (scripts, captions, trends, short, image) | 10 req/5min  |
| Export (scripts)                                       | 3 req/5min   |
| Export (products)                                      | 5 req/5min   |
| Import (products)                                      | 5 req/5min   |
| Bulk delete (scripts)                                  | 15 req/5min  |
| Bulk delete (products)                                 | 15 req/5min  |
| Delete all products                                    | 2 req/15min  |
| General API                                            | 100 req/5min |

### Security

- ✅ CSV injection protection (export escape + import sanitize)
- ✅ Input validation (length limits, format checks)
- ✅ Bulk delete capped at 100 IDs per request
- ✅ Axios timeout (60s) cho AI calls
- ✅ Centralized error interceptor trên frontend
- ✅ Delete all confirmation modal (cascade warning)

### Performance

- ✅ Server-side pagination + search + sort (Supabase)
- ✅ Single-query bulk delete (`.in()` clause)
- ✅ Search debounce (400ms)
- ✅ Regenerate keeps same ID (no broken references)

---

**Made with ❤️ for Affiliate Marketers**
_Cập nhật: 2026-04-09_

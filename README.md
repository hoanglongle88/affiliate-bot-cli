# 🤖 Affiliate Bot CLI

Công cụ tạo nội dung affiliate marketing tự động sử dụng AI (Ollama / Gemini) cho **TikTok, YouTube, Facebook Reels, Instagram Reels và Facebook Ads**.

## 📋 Tổng quan

**Affiliate Bot CLI** là công cụ dòng lệnh (CLI) giúp tự động hóa việc tạo nội dung affiliate marketing đa nền tảng. Sử dụng AI (Ollama local hoặc Google Gemini cloud), công cụ có thể:

- 🔍 **Quét trend tự động**: Nghiên cứu xu hướng thị trường, tìm sản phẩm hot
- 🎬 **Tạo kịch bản video**: Kịch bản 30-60 giây tối ưu cho TikTok/Reels/Shorts
- ✍️ **Tạo caption bài đăng**: Mô tả hấp dẫn với hashtags, CTA, social proof — theo từng nền tảng
- 🎨 **Tạo brief ảnh ads**: Creative brief + image prompts cho AI Image Generator
- 🎤 **Chuyển giọng nói AI**: Text-to-Speech tiếng Việt
- 📦 **Quản lý thông minh**: Lưu sản phẩm, lịch sử, tái sử dụng

## 🚀 Cài đặt nhanh

```bash
cd affiliate-bot-cli
npm install
cp .env.example .env
# Cấu hình SUPABASE_URL và SUPABASE_ANON_KEY trong .env
npm run dev
```

## ⚙️ Cấu hình .env

```env
# Ollama (Local AI)
OLLAMA_MODEL=llama3.2
OLLAMA_BASE_URL=http://localhost:11434

# Google Gemini (Cloud AI - Fallback)
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash
AI_PROVIDER=ollama

# Supabase (Required)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

> ⚠️ **Supabase là bắt buộc.** Bot sẽ thoát nếu chưa cấu hình Supabase.

## ✨ Tính năng

### 🎯 Menu chính — 7 chức năng

```
🔍 Nghiên cứu & Phân tích xu hướng
  1. [Trend Researcher] - Quét trend, tìm sản phẩm hot theo ngách

✍️ Tạo nội dung với AI (đa nền tảng)
  2. [Video Creator] - Tạo kịch bản video (TikTok/Reels/Shorts/Ads)
  3. [Marketing Writer] - Tạo caption & hashtags theo nền tảng
  4. [Image Creator] - Tạo brief ảnh ads (prompt AI)

🎨 Tiện ích & Quản lý
  5. [TTS Voice] - Chuyển kịch bản thành giọng nói (Google TTS)
  6. [History] - Xem & quản lý nội dung đã tạo
  7. [Products] - Xem & quản lý sản phẩm

⚙️ Hệ thống
  8. [System] - Kiểm tra kết nối AI providers
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

## 🧩 4 AI Agents

| Agent                      | Vai trò                    | Đầu ra               | Tự lưu DB?               |
| -------------------------- | -------------------------- | -------------------- | ------------------------ |
| **AutonomousTrendScanner** | Research trend web         | TrendBrief + Product | ✅ product + trend_brief |
| **VideoCreatorAgent**      | Kịch bản video đa nền tảng | VideoScript          | ✅ video_script          |
| **MarketingWriterAgent**   | Caption theo nền tảng      | PostDescription      | ✅ post_description      |
| **ImageCreatorAgent**      | Creative brief ảnh ads     | ImagePromptOutput    | ✅ image_brief           |

**Nguyên tắc:** Mỗi agent chỉ **1 trách nhiệm duy nhất**, không gọi agent khác. **Tự lưu output vào DB** khi tạo xong.

---

## 📊 Luồng dữ liệu

```
User Input → Chọn Agent → AI Orchestrator → Ollama/Gemini
       ↓
  Parse Response (JSON)
       ↓
  Validation (retry tối đa 2 lần)
       ↓
  Agent TỰ LƯU vào DB riêng:
    - VideoScript → video_scripts table
    - PostDescription → post_descriptions table
    - TrendBrief → trend_briefs table
    - ImageBrief → image_briefs table
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
├── dist/             # Compiled JavaScript (auto-generated)
├── output/audio/     # File TTS MP3
├── exports/          # File export .txt
├── .env              # Cấu hình cá nhân
└── supabase-schema.sql # Database schema
```

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
- [x] Storage: Database riêng cho scripts, descriptions, briefs (Supabase only)
- [ ] Module 3: Tạo video từ script + voice (FFmpeg)
- [ ] Module 4: Auto tạo ảnh từ brief (AI Image API)
- [ ] Module 5: Thống kê & analytics

---

**Made with ❤️ for Affiliate Marketers**
_Cập nhật: 2026-04-08_

# 🤖 Affiliate Bot CLI

Công cụ tạo nội dung affiliate marketing tự động sử dụng AI (Ollama / Gemini) cho TikTok và YouTube Shorts.

## 📋 Tổng quan

**Affiliate Bot CLI** là công cụ dòng lệnh (CLI) giúp tự động hóa việc tạo nội dung affiliate marketing. Sử dụng AI (Ollama local hoặc Google Gemini cloud), công cụ có thể:

- 🔍 **Quét trend tự động**: Nghiên cứu xu hướng thị trường, tìm sản phẩm hot
- 🎬 **Tạo kịch bản video**: Kịch bản 30-60 giây tối ưu cho TikTok/YouTube Shorts
- ✍️ **Tạo caption bài đăng**: Mô tả hấp dẫn với hashtags, CTA, social proof
- 🎨 **Tạo brief ảnh ads**: Creative brief + image prompts cho AI Image Generator
- 🎤 **Chuyển giọng nói AI**: Text-to-Speech tiếng Việt tự nhiên
- 📦 **Quản lý thông minh**: Lưu sản phẩm, lịch sử, tái sử dụng

## 🚀 Cài đặt nhanh

```bash
# Clone hoặc tải project về
cd affiliate-bot-cli

# Cài đặt dependencies
npm install

# Tạo file cấu hình
cp .env.example .env

# Chạy bot
npm run dev
```

## ⚙️ Cấu hình .env

```env
# Ollama Configuration (Local AI - Miễn phí)
OLLAMA_MODEL=llama3.2
OLLAMA_BASE_URL=http://localhost:11434

# Google Gemini API (Cloud AI - Fallback)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Default AI Provider (ollama | gemini)
AI_PROVIDER=ollama

# Supabase Configuration (Optional - Cloud Database)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 **Lưu ý:**
>
> - **Supabase** là optional. Không cấu hình → bot tự động dùng JSON local.
> - **Ollama** được ưu tiên trước → fallback sang **Gemini** tự động.
> - `AI_PROVIDER` chỉ mang tính thông tin, routing thực tế do kiểm tra kết nối runtime.

### 🔑 Lấy Gemini API Key

1. Truy cập https://aistudio.google.com/apikey
2. Tạo API key mới
3. Paste vào `GEMINI_API_KEY` trong file `.env`

## 📖 Sử dụng

```bash
npm run dev        # Development mode
npm run build      # Build TypeScript
npm start          # Production mode
npm run migrate    # Migration JSON → Supabase
```

## ✨ Tính năng chi tiết

### 🎯 Menu chính — 8 chức năng

```
╔══════════════════════════════════════════════════╗
║       🤖  AFFILIATE MARKETING BOT - AI POWERED      ║
║           Tự động hóa nội dung Affiliate            ║
╚══════════════════════════════════════════════════╝

📌 TÍNH NĂNG CHÍNH:

🔍 Nghiên cứu & Phân tích xu hướng ─────────────
  1. [Trend Researcher] - Quét trend, tìm sản phẩm hot theo ngách

✍️ Tạo nội dung với AI ──────────────────────────
  2. [Video Creator] - Tạo kịch bản video TikTok/YouTube
  3. [Marketing Writer] - Tạo caption & hashtags bài đăng
  4. [Image Creator] - Tạo brief ảnh ads (prompt AI)

🎨 Tiện ích & Quản lý ───────────────────────────
  5. [TTS Voice] - Chuyển kịch bản thành giọng nói AI
  6. [History] - Xem & quản lý nội dung đã tạo
  7. [Products] - Xem & quản lý sản phẩm

⚙️ Hệ thống ─────────────────────────────────────
  8. [System] - Kiểm tra kết nối AI providers

  ❌  Thoát chương trình
```

---

### 1. 🔍 Trend Researcher — Nghiên cứu xu hướng

**Mục đích:** Tự động research web để tìm sản phẩm HOT theo ngách thị trường.

**Quy trình:**

1. Chọn chế độ: Tự động (AI chọn niche) hoặc Thủ công (chọn từ 12 niches)
2. AI research web → tìm sản phẩm trending thực tế tại Việt Nam
3. Tạo **Trend Brief**: tên SP, giá, rating, lượt bán, trend %, hook, hashtags
4. Tự động lưu sản phẩm để tái sử dụng
5. Hỏi user muốn làm gì tiếp:
   - 🎬 Tạo kịch bản video từ sản phẩm này
   - ✍️ Tạo mô tả bài đăng
   - 🔍 Scan niche khác
   - ⏭️ Quay lại menu

**Đầu ra:** Trend Brief hoàn chỉnh + Product đã lưu

---

### 2. 🎬 Video Creator — Tạo kịch bản video

**Mục đích:** Tạo kịch bản video bán hàng 30-60 giây cho TikTok/YouTube Shorts.

**Quy trình:**

1. Chọn sản phẩm (từ library hoặc nhập mới)
2. Chọn nền tảng: TikTok hoặc YouTube Shorts
3. AI tạo kịch bản 80-120 từ (45-60 giây)
4. Validate + auto-retry nếu chưa đạt chuẩn

**Cấu trúc kịch bản:**

- **Hook** (3-5s): Mở đầu gây chú ý
- **Body** (30-45s): Lợi ích + social proof
- **CTA** (5s): Kêu gọi hành động

**Post-actions:** Copy / Export / Chỉnh sửa / Tạo lại / Menu

---

### 3. ✍️ Marketing Writer — Tạo mô tả bài đăng

**Mục đích:** Tạo caption bài đăng tối ưu cho TikTok/YouTube.

**Quy trình:**

1. Chọn sản phẩm
2. Chọn nền tảng
3. Nhập tóm tắt nội dung video (hoặc paste kịch bản)
4. AI tạo caption 150-250 từ với hashtags

**Cấu trúc caption:**

- Hook line → Sản phẩm + lợi ích + social proof → Urgency → CTA + Hashtags

**Post-actions:** Copy / Export / Chỉnh sửa / Tạo lại / Menu

---

### 4. 🎨 Image Creator — Creative brief ảnh ads

**Mục đích:** Tạo creative brief + image prompts để dùng với AI Image Generator (Midjourney, DALL-E, Stable Diffusion, v.v.)

**Quy trình:**

1. Chọn sản phẩm
2. Chọn nền tảng ads: Facebook/Instagram, TikTok, Shopee, Lazada
3. Chọn tỷ lệ ảnh: 1:1 (vuông), 9:16 (dọc), 16:9 (ngang)
4. AI phân tích → tạo creative brief

**Brief bao gồm:**

- 🎬 Ad format (feed-square / story-vertical / banner-horizontal)
- 🎨 Visual style + bảng màu đề xuất (3 hex colors)
- 📝 3 Image Prompts: **Safe** / **Bold** / **Lifestyle**
- 🚫 Negative prompt
- 📸 Shooting notes (gợi ý chụp ảnh thật)

**Post-actions:** Copy prompts / Export brief / Tạo lại / Menu

---

### 5. 🎤 TTS Voice — Chuyển kịch bản thành giọng nói

**Mục đích:** Chuyển kịch bản video thành file audio tiếng Việt.

**Tính năng:**

- 2 giọng đọc: macOS Linh (tự nhiên) và Google TTS Vietnamese
- Tạo file audio từ script (Hook + Body + CTA)
- Tự động tính thời lượng
- Lưu file vào `/output/audio/`

---

### 6. 📜 History — Xem & quản lý nội dung

**Tính năng:**

- Xem 10 entry gần nhất (tối đa 100 entries)
- Xem chi tiết: sản phẩm, workflow, thời gian, nội dung
- **Post-actions:** Copy / Export / Xóa entry / Tạo lại / ⏮️ Back / Menu
- 🗑️ **Xóa toàn bộ lịch sử** (có xác nhận, hoạt động trên Supabase + JSON)

---

### 7. 📦 Products — Quản lý sản phẩm

**Tính năng:**

- Xem tất cả sản phẩm đã lưu + thống kê số lần dùng
- Xem chi tiết: tên, giá, rating, đã bán, mô tả
- Xóa sản phẩm individually
- 🗑️ **Xóa toàn bộ sản phẩm** (có xác nhận, hoạt động trên Supabase + JSON)
- **Navigation:** ⏮️ Back → danh sách sản phẩm, Menu → menu chính
- Sản phẩm sắp xếp theo số lần dùng (giảm dần)

---

### 8. ⚙️ System Check — Kiểm tra AI providers

**Hiển thị:**

- Trạng thái Ollama (Local AI) — ✅ hoặc ❌
- Trạng thái Gemini (Cloud AI) — ✅ hoặc ❌
- Tên model đang cấu hình (từ `.env`)

**Cơ chế fallback:** Ollama → Gemini → Báo lỗi

---

## 🧩 4 AI Agents

| Agent                      | File                         | Vai trò              | Đầu ra               |
| -------------------------- | ---------------------------- | -------------------- | -------------------- |
| **AutonomousTrendScanner** | `agents/trend-scanner.ts`    | Research trend web   | TrendBrief + Product |
| **VideoCreatorAgent**      | `agents/video-creator.ts`    | Tạo kịch bản video   | VideoScript          |
| **MarketingWriterAgent**   | `agents/marketing-writer.ts` | Tạo caption bài đăng | PostDescription      |
| **ImageCreatorAgent**      | `agents/image-creator.ts`    | Tạo brief ảnh ads    | ImagePromptOutput    |

**Nguyên tắc:** Mỗi agent chỉ **1 trách nhiệm duy nhất**, không gọi agent khác.

---

## 🎨 12 Niches (Ngách sản phẩm)

| #   | ID               | Tên                  | Keywords mẫu                 |
| --- | ---------------- | -------------------- | ---------------------------- |
| 1   | `gia-dung`       | Gia dụng thông minh  | đồ gia dụng, nhà bếp         |
| 2   | `thoi-trang-nu`  | Thời trang nữ        | quần áo nữ, váy              |
| 3   | `thoi-trang-nam` | Thời trang nam       | quần áo nam, áo sơ mi        |
| 4   | `cong-nghe`      | Công nghệ & phụ kiện | đồ công nghệ, gadget         |
| 5   | `my-pham`        | Mỹ phẩm & skincare   | kem dưỡng, son, phấn         |
| 6   | `suc-khoe`       | Sức khỏe & TPCN      | vitamin, thực phẩm chức năng |
| 7   | `me-va-be`       | Mẹ & bé              | đồ cho bé, sữa               |
| 8   | `nha-cua`        | Nhà cửa & decor      | nội thất, trang trí          |
| 9   | `the-thao`       | Thể thao & outdoor   | đồ thể thao, gym             |
| 10  | `thu-cung`       | Thú cưng             | đồ cho chó mèo               |
| 11  | `oto-xe-may`     | Ô tô & xe máy        | phụ kiện xe                  |
| 12  | `do-an`          | Đồ ăn & snack        | snack, thực phẩm             |

Mỗi niche có: keywords, hashtags, pain points, content angles.

---

## 🏗️ Cấu trúc project

```
affiliate-bot-cli/
├── src/
│   ├── prompts/                    # System prompts
│   │   ├── trend-researcher.ts    # Prompt research trend
│   │   ├── video-creator.ts       # Prompt tạo kịch bản video
│   │   ├── marketing-writer.ts    # Prompt tạo caption
│   │   └── image-creator.ts       # Prompt tạo brief ảnh ads
│   │
│   ├── agents/                     # AI Agents
│   │   ├── trend-scanner.ts       # 🔍 AutonomousTrendScanner
│   │   ├── video-creator.ts       # 🎬 VideoCreatorAgent
│   │   ├── marketing-writer.ts    # ✍️ MarketingWriterAgent
│   │   └── image-creator.ts       # 🎨 ImageCreatorAgent
│   │
│   ├── services/                   # Hạ tầng & services
│   │   ├── ai-orchestrator.ts     # Điều phối AI + Fallback
│   │   ├── ollama-client.ts       # Client Ollama (local)
│   │   ├── gemini-client.ts       # Client Gemini (cloud)
│   │   ├── supabase-client.ts     # Client Supabase
│   │   ├── tts-service.ts         # Text-to-Speech
│   │   └── trends-api.ts          # Trend source helpers
│   │
│   ├── data/
│   │   └── storage.ts             # Data persistence (Supabase + JSON)
│   │
│   ├── config/
│   │   ├── niches.ts              # 12 niches cấu hình
│   │   └── paths.ts               # Đường dẫn thư mục
│   │
│   ├── types/
│   │   ├── content.ts             # TypeScript interfaces
│   │   └── gtts.d.ts              # Type declaration cho gtts
│   │
│   ├── utils/
│   │   ├── formatter.ts           # Format output + clipboard
│   │   └── validator.ts           # Validate chất lượng AI
│   │
│   ├── index.ts                   # Main CLI + workflows
│   └── migrate.ts                 # Script migration Supabase
│
├── data/                          # JSON data (auto tạo)
│   ├── products.json
│   └── history.json
│
├── output/audio/                  # File TTS
├── exports/                       # File txt export
├── bgm/                           # Nhạc nền (user tự thêm)
│
├── .env / .env.example
├── package.json
├── tsconfig.json
├── supabase-schema.sql
│
└── Documentation/
    ├── README.md
    ├── MIGRATION-GUIDE.md
    └── SYSTEM-SUMMARY.md
```

---

## 📊 Luồng dữ liệu

```
User Input (inquirer)
       │
       ├── Chọn sản phẩm → saveProduct() → Supabase/JSON
       ├── Chọn nền tảng (TikTok/YouTube)
       │
       ▼
Agent tương ứng
       │
       ├── TrendScanner → AI research → TrendBrief → Product
       ├── VideoCreator → AI script → VideoScript
       ├── MarketingWriter → AI caption → PostDescription
       └── ImageCreator → AI brief → ImagePromptOutput
       │
       ▼
AI Orchestrator (callAI)
       ├── Ollama (ưu tiên) → ollama.chat()
       └── Gemini (fallback) → ai.models.generateContent()
       │
       ▼
Validation (retry tối đa 2 lần)
       │
       ▼
Formatting → Display → saveToHistory()
       │
       ▼
Post-Actions: Copy / Export / Edit / Regenerate / ⏮️ Back / Menu
```

---

## 🛡️ Xóa dữ liệu

### Xóa toàn bộ sản phẩm

- Vào **Products** → Chọn `🗑️ Xóa TOÀN BỘ sản phẩm`
- Có xác nhận trước khi xóa
- Hoạt động trên cả Supabase và JSON mode

### Xóa toàn bộ lịch sử

- Vào **History** → Chọn `🗑️ Xóa TOÀN BỘ lịch sử`
- Có xác nhận trước khi xóa
- Hoạt động trên cả Supabase và JSON mode

### Xóa từng entry

- **Products:** Xem chi tiết → Xóa sản phẩm này
- **History:** Xem entry → Xóa entry này

---

## 🔐 Configuration

| Biến                | Mặc định                 | Mô tả                         |
| ------------------- | ------------------------ | ----------------------------- |
| `OLLAMA_MODEL`      | `llama3.2`               | Model Ollama                  |
| `OLLAMA_BASE_URL`   | `http://localhost:11434` | URL Ollama server             |
| `GEMINI_API_KEY`    | (bắt buộc cho Gemini)    | API key Google AI Studio      |
| `GEMINI_MODEL`      | `gemini-2.0-flash`       | Model Gemini                  |
| `AI_PROVIDER`       | `ollama`                 | Provider ưa thích (thông tin) |
| `SUPABASE_URL`      | (optional)               | Supabase project URL          |
| `SUPABASE_ANON_KEY` | (optional)               | Supabase anon public key      |

---

## 🌐 Nền tảng hỗ trợ

- ✅ **TikTok**: Video ngắn, trend, viral hooks
- ✅ **YouTube Shorts**: Mô tả chi tiết hơn
- ✅ **Facebook/Instagram Ads**: Ảnh ads (brief)
- ✅ **Shopee / Lazada**: Banner ads (brief)

---

## 🗺️ Roadmap

- [x] Module 1: Tạo nội dung AI (kịch bản + mô tả)
- [x] Module 2: Tạo voice từ kịch bản (TTS)
- [x] Module 2.5: Trend Researcher (research trend web)
- [x] Module 2.6: Image Creator (creative brief ảnh ads)
- [ ] Module 3: Tạo video từ script + voice (FFmpeg)
- [ ] Module 4: Auto tạo ảnh từ brief (AI Image API)
- [ ] Module 5: Auto đăng bài TikTok/YouTube
- [ ] Module 6: Thống kê & analytics

---

**Made with ❤️ for Affiliate Marketers**

_Cập nhật lần cuối: 2026-04-08_

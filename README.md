# 🤖 Affiliate Bot CLI

Công cụ tạo nội dung affiliate marketing tự động sử dụng AI (Ollama / Gemini).

## Cài đặt

```bash
npm install
cp .env.example .env
```

## Cấu hình .env

```env
# Ollama Configuration
OLLAMA_MODEL=llama3.2
OLLAMA_BASE_URL=http://localhost:11434

# Google Gemini API (Fallback)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Default AI Provider (ollama | gemini)
AI_PROVIDER=ollama

# Supabase (Optional - Cloud Database)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 **Supabase** là optional. Nếu không cấu hình, bot tự động dùng JSON files local.

**Lấy Gemini API Key:**

1. Truy cập https://aistudio.google.com/apikey
2. Tạo API key mới
3. Paste vào `GEMINI_API_KEY` trong file `.env`

## Sử dụng

### Chạy bot (menu interactive)

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Tính năng

### ✅ Module 1: Generate Content

| Chức năng           | Mô tả                                                               |
| ------------------- | ------------------------------------------------------------------- |
| 🎬 Video Creator    | Tạo kịch bản video 30-60s (hook, body, voiceover CTA)               |
| ✍️ Marketing Writer | Tạo caption bài đăng (caption, hashtags, CTA)                       |
| 🚀 Full Workflow    | Chạy cả 2 agent tự động, output gộp chung                           |
| 🎤 TTS Voice        | Chuyển kịch bản thành giọng nói AI (macOS Linh / Google TTS)        |
| 📜 Lịch sử          | Xem, copy, export, xóa 100 entry gần nhất                           |
| 📦 Quản lý SP       | Xem, xóa sản phẩm đã lưu, re-use nhanh                              |
| 📋 Copy clipboard   | Copy kết quả vào clipboard 1 click                                  |
| 💾 Export file txt  | Xuất kết quả ra file txt đẹp, dễ đọc                                |
| ✏️ Edit output      | Chỉnh sửa hook/body/caption trước khi dùng                          |
| 🔄 Regenerate       | Tạo lại nếu output chưa ưng                                         |
| ✅ Validate         | Tự động kiểm tra word count, CTA, hashtags —不达 chuẩn → auto retry |

### AI Providers

- **Ollama** (Local AI) — ưu tiên, nhanh, miễn phí
- **Gemini** (Cloud AI) — fallback tự động nếu Ollama không có

### Menu chính

```
1. 🎬  Video Creator - Tạo kịch bản video
2. ✍️  Marketing Writer - Tạo mô tả bài đăng
3. 🚀  Full Workflow - Kịch bản + Mô tả (tự động)
4. 🎤  Tạo voice từ kịch bản (AI Text-to-Speech)
5. 📜  Xem lịch sử đã tạo
6. 📦  Quản lý sản phẩm đã lưu
7. 🔄  Kiểm tra kết nối AI
8. ❌  Thoát
```

## Yêu cầu

### Ollama (Local AI)

1. **Ollama** — Tải tại https://ollama.com
2. **Pull model AI**:
   ```bash
   ollama pull llama3.2
   ollama pull mistral
   ```
3. **Chạy Ollama server**:
   ```bash
   ollama serve
   ```

### Gemini (Cloud AI - Fallback)

1. Lấy API key tại https://aistudio.google.com/apikey
2. Cấu hình vào `.env`
3. Không cần cài thêm gì, có internet là dùng được

### Supabase (Cloud Database - Optional)

1. Tạo project tại https://supabase.com (miễn phí)
2. Chạy SQL schema trong Supabase SQL Editor (file `supabase-schema.sql`)
3. Copy **Project URL** và **anon public key** vào `.env`
4. Migration dữ liệu cũ (nếu có): `npm run migrate`

> 📖 Chi tiết: Xem [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)

## Cấu trúc project

```
affiliate-bot-cli/
├── src/
│   ├── prompts/              # System + User prompts
│   │   ├── video-creator.ts  # Prompt cho Video Creator
│   │   └── marketing-writer.ts # Prompt cho Marketing Writer
│   ├── agents/               # AI agents (nhân viên)
│   │   ├── video-creator.ts  # 🎬 Tạo kịch bản video
│   │   └── marketing-writer.ts # ✍️ Tạo mô tả bài đăng
│   ├── services/             # Hạ tầng AI & services
│   │   ├── ollama-client.ts  # Client gọi Ollama
│   │   ├── gemini-client.ts  # Client gọi Gemini
│   │   ├── supabase-client.ts # Client Supabase
│   │   ├── ai-orchestrator.ts # Điều phối AI + Fallback
│   │   └── tts-service.ts    # Text-to-speech (macOS say / gTTS)
│   ├── data/
│   │   └── storage.ts        # Supabase + JSON fallback
│   ├── config/
│   │   └── paths.ts          # Đường dẫn thư mục
│   ├── types/
│   │   └── content.ts        # TypeScript interfaces
│   ├── utils/
│   │   ├── formatter.ts      # Format output + clipboard
│   │   └── validator.ts      # Validate chất lượng AI
│   ├── index.ts              # Main CLI + workflows
│   └── migrate.ts            # Script migration lên Supabase
├── data/                     # Dữ liệu (auto tạo khi chạy)
│   ├── products.json         # Sản phẩm đã lưu (JSON fallback)
│   └── history.json          # Lịch sử đã tạo (JSON fallback)
├── output/                   # Video & audio tạm (auto cleanup)
│   ├── videos/               # Final MP4 videos
│   ├── audio/                # TTS voice files
│   └── temp/                 # Background, subtitles - auto xóa
├── exports/                  # File txt đã export (auto tạo)
├── bgm/                      # Nhạc nền người dùng tự thêm (.mp3)
├── .env                      # Environment variables
├── .env.example              # Environment template
├── .gitignore
├── MIGRATION-GUIDE.md        # Hướng dẫn setup Supabase
├── supabase-schema.sql       # SQL schema cho Supabase
├── package.json
└── tsconfig.json
```

## Module tiếp theo

- [x] Module 1: Tạo nội dung AI (kịch bản + mô tả)
- [x] Module 2: Tạo voice từ kịch bản (AI Text-to-Speech)
- [ ] Module 3: Tạo video từ script + voice (FFmpeg)
- [ ] Module 4: Auto đăng bài lên TikTok/YouTube
- [ ] Module 5: Thống kê & analytics

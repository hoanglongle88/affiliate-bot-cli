# 🤖 Affiliate Bot CLI

Công cụ tạo nội dung affiliate marketing tự động sử dụng AI (Ollama / Gemini) cho TikTok và YouTube Shorts.

## 📋 Tổng quan

**Affiliate Bot CLI** là công cụ dòng lệnh (CLI) giúp tự động hóa việc tạo nội dung affiliate marketing. Sử dụng sức mạnh của AI (Ollama local hoặc Google Gemini cloud), công cụ có thể:

- 🔍 **Quét trend tự động**: Nghiên cứu xu hướng thị trường, tìm sản phẩm hot
- 🎬 **Tạo kịch bản video**: Kịch bản 30-60 giây tối ưu cho TikTok/YouTube Shorts
- ✍️ **Tạo caption bài đăng**: Mô tả hấp dẫn với hashtags, CTA, social proof
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

> 💡 **Lưu ý quan trọng:**
>
> - **Supabase** là optional. Nếu không cấu hình, bot tự động dùng JSON files local.
> - **Ollama** được ưu tiên trước, nếu không có sẽ tự động fallback sang **Gemini**.
> - Biến `AI_PROVIDER` chỉ mang tính thông tin, routing thực tế được xác định bởi kiểm tra kết nối runtime.

### 🔑 Lấy Gemini API Key

1. Truy cập https://aistudio.google.com/apikey
2. Tạo API key mới
3. Paste vào `GEMINI_API_KEY` trong file `.env`

## 📖 Sử dụng

### Chạy bot (chế độ development)

```bash
npm run dev
```

### Build sang production

```bash
npm run build
npm start
```

### Migration dữ liệu lên Supabase

```bash
npm run migrate
```

### Các NPM scripts

| Lệnh              | Mô tả                                           |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Chạy bot chế độ development (ts-node)           |
| `npm run build`   | Build TypeScript sang JavaScript                |
| `npm start`       | Chạy bot chế độ production (node dist/index.js) |
| `npm run migrate` | Migration dữ liệu từ JSON lên Supabase          |

## ✨ Tính năng chi tiết

### 🎯 7 Chức năng chính

#### 1. 🔍 Trend Researcher - Nghiên cứu xu hướng

**Tự động quét trend, research sản phẩm hot theo niche**

**Quy trình:**

1. Chọn chế độ: Tự động hoàn toàn (AI chọn niche) hoặc Chọn niche cụ thể
2. AI research web để tìm sản phẩm HOT nhất trong niche
3. Tạo **Trend Brief**: Thông tin sản phẩm, giá, rating, trend %, hook, hashtags
4. Tự động lưu sản phẩm để tái sử dụng
5. **Hỏi user muốn làm gì tiếp:**
   - 🎬 Tạo kịch bản video từ sản phẩm này
   - ✍️ Tạo mô tả bài đăng
   - 🔍 Scan niche khác
   - ⏭️ Quay lại menu chính

**Đầu vào:**

- Nguồn scan (TikTok/YouTube/Shopee) - chọn ngẫu nhiên
- Niche (ngách sản phẩm) - 12 niches có sẵn hoặc AI chọn

**Đầu ra:**

- ✅ Trend Brief hoàn chỉnh
- ✅ Sản phẩm được lưu tự động
- ✅ User tự quyết định workflow tiếp theo

#### 2. 🎬 Video Creator - Tạo kịch bản video

**Tạo kịch bản video bán hàng 30-60 giây**

**Quy trình:**

1. Chọn sản phẩm (từ danh sách đã lưu hoặc nhập mới)
2. Chọn nền tảng: TikTok hoặc YouTube Shorts
3. AI tạo kịch bản 80-120 từ (45-60 giây đọc)
4. Validate chất lượng, tự retry nếu chưa đạt

**Cấu trúc kịch bản:**

- **Hook** (3-5 giây): Câu mở đầu gây chú ý ngay lập tức
- **Body** (30-45 giây): Giới thiệu lợi ích + social proof (đã bán, đánh giá)
- **CTA** (5 giây): Kêu gọi hành động (mua ngay, nhấn giỏ hàng)

**Tùy chọn sau khi tạo:**

- 📋 Copy vào clipboard
- 💾 Xuất ra file txt
- ✏️ Chỉnh sửa (hook/body/CTA)
- 🔄 Tạo lại (regenerate)
- ⏭️ Quay lại menu chính

#### 3. ✍️ Marketing Writer - Tạo mô tả bài đăng

**Tạo caption tối ưu cho TikTok/YouTube**

**Quy trình:**

1. Chọn sản phẩm
2. Chọn nền tảng
3. Nhập tóm tắt nội dung video (hoặc paste kịch bản)
4. AI tạo caption 150-250 từ

**Cấu trúc caption:**

- **Hook line**: Mở đầu gây chú ý (câu hỏi hoặc statement shock)
- **Body**: Sản phẩm + lợi ích + social proof + urgency
- **CTA + Hashtags**: Hành động rõ ràng + 5-7 hashtags tối ưu

**Tùy chọn:** Copy, Export, Chỉnh sửa, Tạo lại, Quay lại

#### 4. 🎤 Tạo voice từ kịch bản (AI Text-to-Speech)

**Chuyển kịch bản thành giọng nói tiếng Việt**

**Tính năng:**

- 2 giọng đọc: macOS Linh (tự nhiên) và Google TTS Vietnamese
- Tạo file audio từ kịch bản (Hook + Body + CTA)
- Tự động tính thời lượng audio
- Lưu file vào `/output/audio/`

**Yêu cầu:**

- **macOS Linh**: Chỉ hoạt động trên macOS (dùng `say -v "Linh"`)
- **Google TTS**: Hoạt động trên mọi hệ điều hành, cần internet

#### 5. 📜 Xem lịch sử đã tạo

**Quản lý 100 nội dung gần nhất**

**Chức năng:**

- Xem 10 entry gần nhất (trong UI)
- Xem chi tiết: sản phẩm, workflow, thời gian, nội dung
- **Tùy chọn:**
  - 📋 Copy vào clipboard
  - 💾 Xuất ra file txt
  - 🗑️ Xóa entry
  - 🔄 Tạo lại với sản phẩm này
  - ⏭️ Quay lại

**Giới hạn:** Tối đa 100 entries (cả Supabase và JSON)

#### 6. 📦 Quản lý sản phẩm đã lưu

**Xem, xóa sản phẩm đã lưu**

**Thông tin hiển thị:**

- Tên sản phẩm
- Giá, đánh giá, số lượt bán
- Mô tả
- Số lần đã dùng (usage count)

**Chức năng:**

- Xem chi tiết sản phẩm
- Xóa sản phẩm không còn dùng
- Sản phẩm được sắp xếp theo số lần dùng (giảm dần)

#### 7. 🔄 Kiểm tra kết nối AI

**Test kết nối đến các AI providers**

**Hiển thị:**

- Trạng thái Ollama (Local AI) - ✅ hoặc ❌
- Trạng thái Gemini (Cloud AI) - ✅ hoặc ❌
- Tên model đang cấu hình (từ `.env`)

**Cơ chế fallback:**

```
1. Thử Ollama trước
2. Nếu Ollama lỗi → Chuyển sang Gemini
3. Nếu Gemini cũng lỗi → Báo lỗi
```

## 🧩 3 AI Agents (Nhân viên AI)

### 1. AutonomousTrendScanner

**File:** `src/agents/trend-scanner.ts`

**Mục đích:** Tự động nghiên cứu trend và tạo content hoàn chỉnh

**Chức năng chính:**

- `scanAndGenerate()`: Điểm vào chính - chọn nguồn + niche → research → tạo content
- `researchTrend()`: Dùng AI search web để tìm sản phẩm trending
- `parseResponse()`: Parse JSON response từ AI thành cấu trúc dữ liệu
- `displayBrief()`: Hiển thị trend brief dạng gọn trên console

**Quy trình hoạt động:**

```
Nguồn + Niche → AI Research Web → Trend Brief → Product
  → Video Script + Post Description → History
```

**Đặc điểm nổi bật:**

- Chọn nguồn ngẫu nhiên (TikTok/YouTube/Shopee)
- Dùng khả năng search web của AI để tìm data thực tế
- Tạo Trend Brief với thông tin: giá, rating, trend %, hook, hashtags
- Tự động lưu sản phẩm để tái sử dụng

### 2. VideoCreatorAgent

**File:** `src/agents/video-creator.ts`

**Mục đích:** Tạo kịch bản video bán hàng hấp dẫn

**Chức năng chính:**

- `generateScript(product, platform)`: Tạo kịch bản video
- `parseResponse(text, platform, productName)`: Parse response thành cấu trúc

**Cấu trúc kịch bản:**

- **Hook** (3-5s): Mở đầu gây chú ý (câu hỏi, shock, bất ngờ)
- **Body** (30-45s): Lợi ích sản phẩm + social proof
- **CTA** (5s): Kêu gọi hành động (mua ngay, nhấn giỏ hàng)

**Tối ưu hóa:**

- 80-120 từ (45-60 giây đọc)
- Theo nền tảng (TikTok vs YouTube Shorts)
- Tiếng Việt, giọng điệu thân thiện
- Trigger cảm xúc và urgency

**Prompt đặc trưng:**

- Mở đầu PHẢI gây chú ý trong 3 giây
- Nêu LỢI ÍCH, không chỉ liệt kê tính năng
- Dùng từ ngữ gợi cảm xúc: "siêu", "đỉnh", "không thể bỏ lỡ"
- Tạo khan hiếm: "số lượng có hạn", "giá tốt nhất hôm nay"

### 3. MarketingWriterAgent

**File:** `src/agents/marketing-writer.ts`

**Mục đích:** Tạo mô tả/caption bài đăng tối ưu

**Chức năng chính:**

- `generateDescription(product, scriptSummary, platform)`: Tạo caption
- `parseResponse(text, platform)`: Parse response thành cấu trúc

**Cấu trúc caption:**

- **Hook line**: Câu hỏi hoặc statement shock
- **Body**: Sản phẩm + lợi ích + social proof + urgency
- **CTA + Hashtags**: Hành động + 5-7 hashtags

**Tối ưu hóa:**

- 150-250 từ
- Hashtags trending Việt Nam (#fyp, #xuhuong)
- Tránh lặp lại nguyên văn script video
- Giọng điệu thân thiện, tự nhiên

## 🎨 12 Niches (Ngách sản phẩm)

Hệ thống có sẵn 12 niches được cấu hình:

| #   | ID               | Tên niche                      | Keywords mẫu                     |
| --- | ---------------- | ------------------------------ | -------------------------------- |
| 1   | `gia-dung`       | Gia dụng thông minh            | đồ gia dụng, nhà bếp, tiện ích   |
| 2   | `thoi-trang-nu`  | Thời trang nữ                  | quần áo nữ, váy, áo thun         |
| 3   | `thoi-trang-nam` | Thời trang nam                 | quần áo nam, áo sơ mi, quần      |
| 4   | `cong-nghe`      | Công nghệ & phụ kiện           | đồ công nghệ, phụ kiện, gadget   |
| 5   | `my-pham`        | Mỹ phẩm & skincare             | kem dưỡng, son, phấn             |
| 6   | `suc-khoe`       | Sức khỏe & thực phẩm chức năng | vitamin, thực phẩm chức năng     |
| 7   | `me-va-be`       | Mẹ và bé                       | đồ cho bé, sữa, quần áo trẻ em   |
| 8   | `nha-cua`        | Nhà cửa & đồ nội thất          | decor, nội thất, đồ gia dụng     |
| 9   | `the-thao`       | Thể thao & dã ngoại            | đồ thể thao, outdoor, gym        |
| 10  | `thu-cung`       | Thú cưng                       | đồ cho chó mèo, thức ăn thú cưng |
| 11  | `oto-xe-may`     | Ô tô & xe máy                  | phụ kiện xe, đồ chơi xe          |
| 12  | `do-an`          | Đồ ăn & snack                  | snack, thực phẩm, đồ ăn vặt      |

Mỗi niche có:

- **Keywords**: Từ khóa để search
- **Hashtags**: Hashtags liên quan
- **Pain Points**: Nỗi đau/insight khách hàng
- **Content Angles**: Góc độ content marketing

## 🔧 Yêu cầu hệ thống

### Ollama (Local AI - Khuyến nghị)

1. **Cài đặt Ollama**: Tải tại https://ollama.com
2. **Pull model**:
   ```bash
   ollama pull llama3.2
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
4. Migration dữ liệu: `npm run migrate`

> 📖 Chi tiết: Xem [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)

## 🏗️ Cấu trúc project

```
affiliate-bot-cli/
├── src/
│   ├── prompts/                    # System prompts cho AI
│   │   ├── trend-researcher.ts    # Prompt nghiên cứu trend
│   │   ├── video-creator.ts       # Prompt tạo kịch bản video
│   │   └── marketing-writer.ts    # Prompt tạo caption
│   │
│   ├── agents/                     # AI Agents (nhân viên)
│   │   ├── trend-scanner.ts       # 🤖 AutonomousTrendScanner
│   │   ├── video-creator.ts       # 🎬 VideoCreatorAgent
│   │   └── marketing-writer.ts    # ✍️ MarketingWriterAgent
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
│   ├── index.ts                   # Main CLI + workflows (937 dòng)
│   └── migrate.ts                 # Script migration lên Supabase
│
├── data/                          # Dữ liệu JSON (auto tạo)
│   ├── products.json              # Sản phẩm đã lưu
│   └── history.json               # Lịch sử tạo nội dung
│
├── output/                        # Output files
│   └── audio/                     # File TTS (.mp3/.aiff)
│
├── exports/                       # File txt đã export
├── bgm/                           # Nhạc nền (người dùng tự thêm)
│
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore
├── package.json                   # Dependencies & scripts
├── package-lock.json
├── tsconfig.json                  # TypeScript config
├── supabase-schema.sql            # Database schema
│
└── Documentation/
    ├── README.md                  # File này
    ├── MIGRATION-GUIDE.md         # Hướng dẫn Supabase
    └── SYSTEM-SUMMARY.md          # Tóm tắt hệ thống chi tiết
```

## 📊 Luồng dữ liệu

```
User Input (inquirer prompts)
       │
       ├── Chọn sản phẩm (selectOrEnterProduct)
       │      ├── saveProduct() → Supabase hoặc products.json
       │      └── Trả về ProductInfo
       │
       ├── Chọn nền tảng (TikTok/YouTube)
       │
       ▼
Chọn Agent (theo menu)
       │
       ├── TrendScanner → researchTrend() → callAI() → parseResponse()
       │                    → VideoCreatorAgent.generateScript()
       │                    → MarketingWriterAgent.generateDescription()
       │
       ├── VideoCreatorAgent → buildUserPrompt() → callAI() → parseResponse()
       │
       ├── MarketingWriterAgent → buildUserPrompt() → callAI() → parseResponse()
       │
       ▼
AI Orchestrator (callAI)
       │
       ├── checkOllamaConnection() → callOllama() [ưu tiên]
       │        └── ollama.chat({ model, messages })
       │
       └── checkGeminiConnection() → callGemini() [fallback]
                └── ai.models.generateContent()
       │
       ▼
Validation (validateScript / validateDescription)
       │
       ├── Nếu đạt chuẩn → tiếp tục
       └── Nếu chưa → retry tối đa 2 lần → vẫn hiển thị cảnh báo
       │
       ▼
Formatting (formatScriptOutput / formatDescriptionOutput)
       │
       ▼
Persistence (saveToHistory)
       │
       ├── Supabase → INSERT vào history table
       └── JSON → unshift vào history.json (giới hạn 100)
       │
       ▼
Post-Actions (handlePostActions)
       │
       ├── Copy vào clipboard (clipboardy)
       ├── Export ra file .txt (exportToTextFile → exports/)
       ├── Chỉnh sửa trong editor (inquirer editor)
       ├── Tạo lại (gọi lại workflow)
       └── Quay lại menu chính
```

## 🔐 Bảo mật & Configuration

### Biến môi trường (.env)

| Biến                | Giá trị mặc định         | Mô tả                         |
| ------------------- | ------------------------ | ----------------------------- |
| `OLLAMA_MODEL`      | `llama3.2`               | Model Ollama sử dụng          |
| `OLLAMA_BASE_URL`   | `http://localhost:11434` | URL Ollama server             |
| `GEMINI_API_KEY`    | (bắt buộc cho Gemini)    | API key Google AI Studio      |
| `GEMINI_MODEL`      | `gemini-2.0-flash`       | Model Gemini sử dụng          |
| `AI_PROVIDER`       | `ollama`                 | Provider ưa thích (thông tin) |
| `SUPABASE_URL`      | (optional)               | Supabase project URL          |
| `SUPABASE_ANON_KEY` | (optional)               | Supabase anon public key      |

### Cơ chế fallback tự động

**AI Providers:**

```
1. Thử Ollama (kiểm tra kết nối)
2. Nếu Ollama lỗi → Gemini (kiểm tra API key)
3. Nếu Gemini lỗi → Báo lỗi
```

**Storage:**

```
1. Thử Supabase (nếu đã cấu hình)
2. Nếu Supabase lỗi → JSON files
3. Vẫn hoạt động bình thường
```

## ✅ Validation nội dung

### Video Script

- Số từ: 80-150 từ
- Hook: tối thiểu 10 ký tự
- Body: tối thiểu 50 ký tự
- Voiceover CTA: tối thiểu 5 ký tự

### Post Description

- Số từ: 100-300 từ
- Hashtags: tối thiểu 3
- CTA: tối thiểu 5 ký tự

**Cơ chế retry:**

- Tự động validate output
- Retry tối đa 2 lần nếu chưa đạt chuẩn
- Vẫn hiển thị output kèm cảnh báo nếu hết retry

## 🌐 Nền tảng hỗ trợ

- ✅ **TikTok**: Tối ưu cho video ngắn, trend, viral hooks
- ✅ **YouTube Shorts**: Tối ưu cho mô tả chi tiết hơn

## 📝 Các tính năng nổi bật

### ✏️ Chỉnh sửa nội dung

- Chỉnh sửa script/description trong text editor
- Chỉnh từng phần: hook, body, CTA, caption
- Cập nhật ngay lập tức

### 💾 Export & Copy

- Copy vào clipboard 1 click
- Export ra file `.txt` có timestamp
- File lưu trong `/exports/` với format: `{ten-san-pham}_{timestamp}.txt`

### 🔄 Tái sử dụng

- Sản phẩm lưu tự động
- Theo dõi số lần sử dụng (usage count)
- Chọn nhanh từ danh sách đã lưu
- Tạo lại content với sản phẩm cũ

### 📋 Hiển thị thông minh

- Màu sắc đẹp với chalk
- Format output dễ đọc
- Hiển thị model AI đang dùng (đã fix bug)

## 🗺️ Roadmap

- [x] Module 1: Tạo nội dung AI (kịch bản + mô tả)
- [x] Module 2: Tạo voice từ kịch bản (AI Text-to-Speech)
- [x] Module 2.5: Auto Scan & Generate (Trend Research)
- [ ] Module 3: Tạo video từ script + voice (FFmpeg)
- [ ] Module 4: Auto đăng bài lên TikTok/YouTube
- [ ] Module 5: Thống kê & analytics
- [ ] Hỗ trợ thêm nền tảng (Facebook Reels, Instagram)
- [ ] Template prompts tùy chỉnh
- [ ] Batch processing (tạo hàng loạt)

## 🐛 Troubleshooting

### Ollama không kết nối

```bash
# Kiểm tra Ollama có chạy không
ollama list

# Khởi động Ollama server
ollama serve

# Test model
ollama run llama3.2
```

### Gemini không kết nối

- Kiểm tra `GEMINI_API_KEY` trong `.env`
- Đảm bảo có kết nối internet
- Test API key tại https://aistudio.google.com/apikey

### Lỗi model không hiển thị đúng

- Đã fix trong phiên bản hiện tại
- Model được đọc từ `.env` và hiển thị chính xác

### Supabase lỗi

- Kiểm tra `SUPABASE_URL` và `SUPABASE_ANON_KEY`
- Đảm bảo đã chạy SQL schema
- Bot sẽ tự động fallback sang JSON nếu có lỗi

### Migration thất bại

- Kiểm tra kết nối internet
- Đảm bảo Supabase project đang hoạt động
- Xem logs để biết chi tiết lỗi

## 📚 Tài liệu liên quan

- [SYSTEM-SUMMARY.md](./SYSTEM-SUMMARY.md) - Tóm tắt hệ thống chi tiết
- [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) - Hướng dẫn setup Supabase
- [supabase-schema.sql](./supabase-schema.sql) - Database schema

## 📄 License

ISC

---

**Made with ❤️ for Affiliate Marketers**

_Cập nhật lần cuối: 2026-04-07_

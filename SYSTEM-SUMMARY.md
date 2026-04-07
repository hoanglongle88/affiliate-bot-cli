# 🤖 Affiliate Bot CLI - Tóm tắt hệ thống

## 📋 Tổng quan

**Affiliate Bot CLI** là công cụ tự động tạo nội dung affiliate marketing sử dụng AI (Ollama local hoặc Google Gemini cloud) để tạo kịch bản video, mô tả bài đăng, creative brief ảnh ads và giọng nói AI cho TikTok và YouTube Shorts.

---

## 🎯 8 Chức năng chính

### 1. 🔍 Trend Researcher — Nghiên cứu xu hướng

**Workflow:** `trendscan`

- Tự động quét sản phẩm trending bằng AI research web
- Chọn niche: Tự động (AI chọn) hoặc Thủ công (12 niches có sẵn)
- Tạo **Trend Brief**: tên SP, giá, rating, lượt bán, trend %, hook, hashtags, pain point
- Tự động lưu sản phẩm để tái sử dụng
- **Sau research, user tự chọn:**
  - 🎬 Tạo kịch bản video
  - ✍️ Tạo mô tả bài đăng
  - 🔍 Scan niche khác
  - ⏭️ Quay lại menu

### 2. 🎬 Video Creator — Tạo kịch bản video

**Workflow:** `script`

- Chọn/nhập sản phẩm → Chọn nền tảng (TikTok/YouTube)
- AI tạo kịch bản 80-120 từ (45-60 giây)
- Cấu trúc: Hook (3-5s) + Body (30-45s) + CTA (5s)
- Validate + auto-retry tối đa 2 lần
- Post-actions: Copy / Export / Chỉnh sửa / Tạo lại / Menu

### 3. ✍️ Marketing Writer — Tạo mô tả bài đăng

**Workflow:** `description`

- Chọn/nhập sản phẩm → Chọn nền tảng → Nhập tóm tắt video
- AI tạo caption 150-250 từ với hashtags
- Cấu trúc: Hook → Sản phẩm + lợi ích → Urgency → CTA + Hashtags
- Post-actions: Copy / Export / Chỉnh sửa / Tạo lại / Menu

### 4. 🎨 Image Creator — Creative brief ảnh ads

**Workflow:** `imagebrief`

- Chọn sản phẩm → Chọn nền tảng ads → Chọn tỷ lệ ảnh
- AI tạo creative brief:
  - Ad format (feed-square / story-vertical / banner-horizontal)
  - Visual style + bảng màu (3 hex colors)
  - 3 Image Prompts: Safe / Bold / Lifestyle
  - Negative prompt + Shooting notes
- Post-actions: Copy prompts / Export brief / Tạo lại / Menu

### 5. 🎤 TTS Voice — Chuyển kịch bản thành giọng nói

**Workflow:** `tts`

- Chọn script từ history hoặc tạo mới
- Chọn giọng: macOS Linh hoặc Google TTS Vietnamese
- Tạo file audio từ Hook + Body + CTA
- Lưu vào `/output/audio/`
- Post-actions: Mở file / Tạo giọng khác / Menu

### 6. 📜 History — Quản lý nội dung đã tạo

**Workflow:** `history`

- Xem 10 entry gần nhất (tối đa 100)
- Xem chi tiết + post-actions: Copy / Export / Xóa / Tạo lại / ⏮️ Back / Menu
- 🗑️ **Xóa toàn bộ lịch sử** (có xác nhận, Supabase + JSON)

### 7. 📦 Products — Quản lý sản phẩm

**Workflow:** `products`

- Xem sản phẩm đã lưu + số lần dùng
- Xóa sản phẩm individually
- 🗑️ **Xóa toàn bộ sản phẩm** (có xác nhận, Supabase + JSON)
- Navigation: ⏮️ Back → danh sách, Menu → menu chính
- Sắp xếp theo usage count (giảm dần)

### 8. ⚙️ System Check — Kiểm tra AI providers

**Workflow:** `check`

- Test kết nối Ollama + Gemini
- Hiển thị model đang cấu hình từ `.env`
- Fallback tự động: Ollama → Gemini

---

## 🧩 4 AI Agents

### 1. AutonomousTrendScanner (`agents/trend-scanner.ts`)

**Vai trò:** Research trend web → tìm sản phẩm HOT theo niche.

**Methods:**

- `scanAndGenerate(niche?)` → `{ brief: TrendBrief; product: ProductInfo }`
- `researchTrend(source, niche)` → Gọi AI research web
- `parseResponse(text, source, nicheId)` → Parse JSON → TrendBrief
- `displayBrief(brief)` → Hiển thị console

**Flow:**

```
Nguồn + Niche → AI Research Web → TrendBrief → Product → Lưu → User chọn tiếp
```

### 2. VideoCreatorAgent (`agents/video-creator.ts`)

**Vai trò:** Tạo kịch bản video bán hàng 30-60 giây.

**Methods:**

- `generateScript(product, platform)` → `VideoScript`
- `parseResponse(text, platform, productName)` → Parse → Hook/Body/CTA

**Cấu trúc output:**

```typescript
{
  platform: "tiktok" | "youtube",
  title: string,
  hook: string,        // 3-5 giây
  body: string,        // 30-45 giây
  voiceoverCTA: string,// 5 giây
  wordCount: number,
  estimatedDuration: string
}
```

### 3. MarketingWriterAgent (`agents/marketing-writer.ts`)

**Vai trò:** Tạo caption bài đăng tối ưu cho social media.

**Methods:**

- `generateDescription(product, scriptSummary, platform)` → `PostDescription`
- `parseResponse(text, platform)` → Parse → Caption + Hashtags + CTA

**Cấu trúc output:**

```typescript
{
  platform: "tiktok" | "youtube",
  caption: string,
  hashtags: string[],
  cta: string,
  wordCount: number
}
```

### 4. ImageCreatorAgent (`agents/image-creator.ts`)

**Vai trò:** Tạo creative brief + image prompts cho AI Image Generator.

**Methods:**

- `generateBrief(input: ImagePromptInput)` → `ImagePromptOutput`
- `displayBrief(brief)` → Hiển thị console đẹp

**Input:**

```typescript
{
  name: string,
  category: string,
  adPlatform: "facebook" | "tiktok" | "shopee" | "lazada",
  aspectRatio: "1:1" | "9:16" | "16:9",
  mainMessage: string,
  price?: string
}
```

**Output:**

```typescript
{
  adFormat: string,
  visualStyle: string,
  colorPalette: string[],
  prompts: { safe: string; bold: string; lifestyle: string },
  negativePrompt: string,
  shootingNotes: string
}
```

**Nguyên tắc:** Mỗi agent chỉ **1 trách nhiệm duy nhất**, không gọi agent khác.

---

## 🔄 Services

### AI Orchestrator (`services/ai-orchestrator.ts`)

- `callAI(systemPrompt, userPrompt)` → Thử Ollama trước → Fallback Gemini
- `checkProvidersStatus()` → Test + hiển thị trạng thái cả 2 providers
- Hiển thị đúng model name từ `.env`

### Ollama Client (`services/ollama-client.ts`)

- `callOllama(systemPrompt, userPrompt, model?)` → Gọi local AI
- `checkOllamaConnection()` → Test connectivity
- Model từ `OLLAMA_MODEL` env (default: `llama3.2`)

### Gemini Client (`services/gemini-client.ts`)

- `callGemini(systemPrompt, userPrompt, model?)` → Gọi cloud AI
- `checkGeminiConnection()` → Test connectivity
- Model từ `GEMINI_MODEL` env (default: `gemini-2.0-flash`)
- Yêu cầu `GEMINI_API_KEY`

### TTS Service (`services/tts-service.ts`)

- 2 giọng: `macos-linh` (macOS only) và `gtts-vi` (Google TTS)
- `generateScriptAudio(hook, body, cta, voice)` → File MP3
- Tự động tính thời lượng

### Trends API (`services/trends-api.ts`)

- `getSourceLabel(source)` → Nhãn đọc được
- `getRandomSource()` → Random: tiktok/youtube/shopee

### Supabase Client (`services/supabase-client.ts`)

- Tạo Supabase client từ env vars
- `isSupabaseConfigured()` → Check credentials

---

## 📊 Data Layer (`data/storage.ts`)

**Dual-mode:** Supabase (primary) → JSON (fallback)

| Function               | Mode Supabase              | Mode JSON            |
| ---------------------- | -------------------------- | -------------------- |
| `saveProduct()`        | Upsert by name             | Append products.json |
| `getProducts()`        | Query ORDER BY usage_count | Read + sort JSON     |
| `deleteProduct()`      | Delete by id               | Filter + rewrite     |
| `saveToHistory()`      | INSERT, cap 100            | Unshift, cap 100     |
| `getHistory()`         | Query DESC, limit 100      | Read JSON            |
| `deleteHistoryEntry()` | Delete by id               | Filter + rewrite     |
| `exportToTextFile()`   | Filesystem only            | Filesystem only      |

---

## 🎨 12 Niches

`config/niches.ts` — Mỗi niche có: id, name, keywords[], hashtags[], painPoints[], contentAngles[]

1. `gia-dung` — Gia dụng thông minh
2. `thoi-trang-nu` — Thời trang nữ
3. `thoi-trang-nam` — Thời trang nam
4. `cong-nghe` — Công nghệ & Phụ kiện
5. `my-pham` — Mỹ phẩm & Skincare
6. `suc-khoe` — Sức khỏe & TPCN
7. `me-va-be` — Mẹ & Bé
8. `nha-cua` — Nhà cửa & Decor
9. `the-thao` — Thể thao & Outdoor
10. `thu-cung` — Thú cưng
11. `oto-xe-may` — Ô tô & Xe máy
12. `do-an` — Đồ ăn & Snack

---

## 📝 AI Prompts

### Video Creator (`prompts/video-creator.ts`)

- **`VIDEO_CREATOR_SYSTEM_PROMPT`**: AI là copywriter performance marketing 5 năm kinh nghiệm. Output JSON: hook, body, cta, wordCount, angle, script. 80-120 từ, giọng thân thiện.
- **`buildVideoCreatorUserPrompt(product, platform)`**: Product info + smart truncation (350 chars đầu + 100 chars cuối).

### Marketing Writer (`prompts/marketing-writer.ts`)

- **`MARKETING_WRITER_SYSTEM_PROMPT`**: AI là TikTok marketing expert. 150-250 từ, cấu trúc: hook → benefits → social proof → urgency → CTA + hashtags.
- **`buildMarketingWriterUserPrompt(productName, scriptSummary)`**: Context từ script.

### Trend Researcher (`prompts/trend-researcher.ts`)

- **`TREND_RESEARCHER_SYSTEM_PROMPT`**: AI là chuyên gia nghiên cứu xu hướng VN. Dùng web search tìm data THỰC TẾ. Output JSON: productName, price, rating, sold, views, trendPercent, description, angle, hook, hashtags, painPoint, ctaAngle.
- **`buildTrendResearcherUserPrompt(sourceLabel, niche)`**: Source + niche info.

### Image Creator (`prompts/image-creator.ts`)

- **`IMAGE_PROMPT_SYSTEM`**: AI là Art Director cho ads. Visual guidelines theo ngành (beauty, food, tech, fashion, home, sports). Quy tắc ads: product 60-70% frame, text-safe zone 15-20%. Output JSON: adFormat, visualStyle, colorPalette, prompts (safe/bold/lifestyle), negativePrompt, shootingNotes.
- **`ImagePromptInput`**: Input interface
- **`ImagePromptOutput`**: Output interface
- **`buildImagePromptUserPrompt(input)`**: Product + platform context mapping.

---

## ✅ Validation

### Video Script

- Word count: 80-150 từ
- Hook: tối thiểu 10 ký tự
- Body: tối thiểu 50 ký tự
- Voiceover CTA: tối thiểu 5 ký tự

### Post Description

- Word count: 100-300 từ
- Hashtags: tối thiểu 3
- CTA: tối thiểu 5 ký tự

**Cơ chế:** Auto-validate → Retry tối đa 2 lần → Vẫn hiển thị kèm cảnh báo nếu hết retry.

---

## 📁 Luồng dữ liệu tổng quát

```
User Input → Chọn Agent → AI Orchestrator → Ollama/Gemini
                  ↓
           Parse Response
                  ↓
        Validation & Retry
                  ↓
   Formatting + Display + Save History
                  ↓
  Post-Actions: Copy / Export / Edit / Regenerate / ⏮️ Back / Menu
```

---

## 🗑️ Xóa dữ liệu

**Xóa toàn bộ sản phẩm:** `deleteAllProducts()` → Supabase `DELETE FROM products` hoặc JSON `writeJSON([])`

**Xóa toàn bộ lịch sử:** `clearHistory()` → Supabase `DELETE FROM history` hoặc JSON `writeJSON([])`

**Xóa từng entry:** `deleteProduct(id)`, `deleteHistoryEntry(id)`

Tất cả có xác nhận trước khi thực thi.

---

## 🔐 Fallback Mechanisms

**AI Providers:**

```
1. Thử Ollama (check connection)
2. Nếu lỗi → Gemini (check API key)
3. Nếu lỗi → Báo lỗi
```

**Storage:**

```
1. Thử Supabase (nếu đã cấu hình)
2. Nếu lỗi → JSON files
3. Vẫn hoạt động bình thường
```

---

## 🛠️ Tính năng nổi bật

- ✏️ **Chỉnh sửa:** Edit hook/body/CTA/caption trong text editor
- 💾 **Export:** Copy clipboard 1 click hoặc export file `.txt`
- 🔄 **Tái sử dụng:** Products lưu tự động, theo dõi usage count
- ⏮️ **Back navigation:** Quay lại bước trước hoặc về menu chính
- 🗑️ **Xóa toàn bộ:** Xóa hết products hoặc history (có xác nhận)
- 📋 **UI/UX:** Menu phân nhóm, header chi tiết per feature, empty state hints
- 🎨 **Color output:** Chalk colors cho console đẹp
- 📊 **History cap:** Tối đa 100 entries

---

_Cập nhật lần cuối: 2026-04-08_

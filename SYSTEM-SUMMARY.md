# 🤖 Affiliate Bot CLI - Tóm tắt chức năng hệ thống

## 📋 Tổng quan

**Affiliate Bot CLI** là công cụ tự động tạo nội dung affiliate marketing sử dụng AI (Ollama local hoặc Google Gemini cloud) để tạo kịch bản video và mô tả bài đăng cho tiếp thị liên kết trên TikTok và YouTube Shorts.

---

## 🎯 7 Chức năng chính của hệ thống

### 1. **Trend Researcher (Nghiên cứu xu hướng)** 🔍

**Workflow:** `trendscan`

- Tự động quét sản phẩm trending bằng nghiên cứu web AI
- Chọn niche (tự động hoặc chọn thủ công từ 12 niches có sẵn)
- Nghiên cứu sản phẩm thực tế đang hot trên các sàn thương mại điện tử Việt Nam
- Tạo Trend Brief hoàn chỉnh với thông tin sản phẩm, hook, hashtags, CTA
- Tự động lưu sản phẩm để tái sử dụng
- **Hỏi user muốn làm gì tiếp:**
  - 🎬 Tạo kịch bản video từ sản phẩm này
  - ✍️ Tạo mô tả bài đăng
  - 🔍 Scan niche khác
  - ⏭️ Quay lại menu chính

### 2. **Video Creator (Tạo kịch bản video)** 🎬

**Workflow:** `script`

- Người dùng chọn/nhập sản phẩm
- Chọn nền tảng (TikTok hoặc YouTube Shorts)
- AI tạo kịch bản video hấp dẫn 30-60 giây
- Bao gồm: Hook (3s), Body (30-45s), và CTA (5s)
- Có cơ chế validate và tự thử lại nếu output chưa đạt chuẩn
- Tùy chọn: Copy, Export, Chỉnh sửa, hoặc Tạo lại

### 3. **Marketing Writer (Tạo mô tả bài đăng)** ✍️

**Workflow:** `description`

- Người dùng chọn/nhập sản phẩm
- Cung cấp tóm tắt nội dung video hoặc kịch bản
- AI tạo caption bài đăng tối ưu (150-250 từ)
- Bao gồm: Câu hook, lợi ích nổi bật, social proof, urgency, CTA và 5-7 hashtags
- Tối ưu cho thuật toán TikTok/YouTube

### 4. **Text-to-Speech (Tạo giọng nói AI)** 🎤

**Workflow:** `tts`

- Chuyển đổi kịch bản thành giọng nói AI
- Nhiều giọng đọc tiếng Việt (gTTS)
- Tạo file audio từ kịch bản (Hook + Body + CTA)
- Lưu file audio vào thư mục `/output/audio/`
- Có thể phát lại giọng nói vừa tạo

### 5. **Quản lý History** 📜

**Workflow:** `history`

- Xem 10 lần tạo nội dung gần nhất
- Hiển thị: tên sản phẩm, loại workflow, thời gian tạo
- Tùy chọn: Copy vào clipboard, Export ra file .txt, Xóa entry, Tạo lại với sản phẩm này
- Lưu trữ: scripts, descriptions, timestamps, thông tin sản phẩm

### 6. **Quản lý sản phẩm** 📦

**Workflow:** `products`

- Xem tất cả sản phẩm đã lưu với thống kê số lần dùng
- Hiển thị: Tên, giá, rating, số lượt bán, mô tả, số lần sử dụng
- Xóa sản phẩm không còn dùng
- Sản phẩm được tự động lưu trong quá trình tạo nội dung

### 7. **Kiểm tra trạng thái AI** 🔄

**Workflow:** `check`

- Test kết nối đến Ollama (AI local)
- Test kết nối đến Google Gemini (AI cloud)
- Hiển thị model đang cấu hình
- Hiển thị trạng thái kết nối (✅ đã kết nối / ❌ không kết nối)

---

## 🧩 Chi tiết 3 AI Agents

### 1. **AutonomousTrendScanner** (`trend-scanner.ts`)

**Mục đích:** Tự động nghiên cứu trend và tạo content hoàn chỉnh

**Các chức năng chính:**

#### `scanAndGenerate()` - Điểm vào chính để quét trend

- Chọn nguồn (TikTok/YouTube/Shopee) và niche
- Gọi AI để nghiên cứu trend từ web
- Tạo Trend Brief
- Tạo video script thông qua VideoCreatorAgent
- Tạo description thông qua MarketingWriterAgent
- Lưu toàn bộ nội dung vào history

#### `researchTrend()` - Nghiên cứu trend bằng AI

- Dùng khả năng search web của AI để tìm sản phẩm trending
- Phân tích data thị trường thực (giá, rating, số bán, lượt xem, tăng trưởng)
- Trả về đối tượng TrendBrief có cấu trúc

#### `parseResponse()` - Parse phản hồi từ AI

- Trích xuất JSON từ output của AI
- Xử lý cleanup markdown/code block
- Fallback sang parsing text thô nếu JSON bị lỗi

#### `displayBrief()` - Hiển thị trend brief dạng gọn

- Tên sản phẩm, lượt xem, % trend, giá
- Hook, angle, pain point
- Hashtags và CTA angle

**Quy trình hoạt động:**

```
Nguồn + Niche → AI Nghiên cứu Web → Trend Brief → Product → Script + Description → History
```

**Đầu vào:**

- Nguồn scan (TikTok/YouTube/Shopee)
- Niche (ngách sản phẩm) - có thể chọn hoặc để AI chọn ngẫu nhiên

**Đầu ra:**

- Trend Brief hoàn chỉnh với thông tin sản phẩm thực tế
- Video script tối ưu cho nền tảng
- Post description với hashtags
- Toàn bộ được lưu vào history

---

### 2. **VideoCreatorAgent** (`video-creator.ts`)

**Mục đích:** Tạo kịch bản video bán hàng hấp dẫn cho TikTok/YouTube Shorts

**Các chức năng chính:**

#### `generateScript()` - Tạo kịch bản video

- Nhận thông tin sản phẩm và nền tảng
- Gọi AI với prompt chuyên biệt
- Trả về đối tượng VideoScript có cấu trúc

#### `parseResponse()` - Parse phản hồi thành format script

- Tính số từ và thời lượng ước tính
- Trích xuất hook (câu đầu tiên)
- Tìm câu CTA (câu cuối có từ khóa hành động)
- Cấu trúc thành Hook / Body / VoiceoverCTA

**Cấu trúc kịch bản:**

- **Hook** (3-5 giây): Mở đầu gây chú ý ngay lập tức
- **Body** (30-45 giây): Giới thiệu lợi ích sản phẩm + social proof (đã bán, đánh giá)
- **CTA** (5 giây): Kêu gọi hành động (mua ngay, nhấn giỏ hàng, v.v.)

**Tối ưu hóa:**

- Theo nền tảng (TikTok vs YouTube Shorts)
- 80-120 từ (thời gian đọc 45-60 giây)
- Tiếng Việt, giọng điệu thân thiện như nói chuyện
- Dùng trigger cảm xúc và urgency

**Prompt đặc trưng:**

- Mở đầu PHẢI gây chú ý trong 3 giây đầu (câu hỏi, shock, bất ngờ)
- Nêu LỢI ÍCH cho người dùng, không chỉ liệt kê tính năng
- Dùng từ ngữ gợi cảm xúc: "siêu", "đỉnh", "không thể bỏ lỡ"
- Tạo cảm giác khan hiếm: "số lượng có hạn", "giá tốt nhất hôm nay"
- Kết thúc bằng CTA rõ ràng

**Quy trình hoạt động:**

```
Product + Platform → AI tạo kịch bản → Parse & Cấu trúc → VideoScript
```

**Đầu vào:**

- Thông tin sản phẩm (tên, giá, rating, đã bán, mô tả)
- Nền tảng mục tiêu (TikTok hoặc YouTube Shorts)

**Đầu ra:**

- VideoScript với hook, body, CTA đã được cấu trúc
- Số từ và thời lượng ước tính

---

### 3. **MarketingWriterAgent** (`marketing-writer.ts`)

**Mục đích:** Tạo mô tả/caption bài đăng tối ưu cho social media

**Các chức năng chính:**

#### `generateDescription()` - Tạo caption bài đăng

- Nhận tên sản phẩm và tóm tắt script
- Gọi AI với prompt tập trung vào marketing
- Trả về đối tượng PostDescription có cấu trúc

#### `parseResponse()` - Parse phản hồi thành format caption

- Trích xuất hashtags bằng regex
- Tìm câu CTA (có từ khóa hành động)
- Loại bỏ hashtags khỏi text caption
- Tính số từ

**Cấu trúc caption:**

- **Dòng hook**: Mở đầu gây chú ý (câu hỏi hoặc statement shock)
- **Body**: Giới thiệu sản phẩm + lợi ích nổi bật + social proof (đã bán, review)
- **Urgency**: Ưu đãi có thời hạn, kích thích khan hiếm
- **CTA + Hashtags**: Hành động rõ ràng + 5-7 hashtags tối ưu

**Tối ưu hóa:**

- 150-250 từ tổng cộng
- Tối ưu cho nền tảng (TikTok/YouTube)
- Bao gồm hashtags trending Việt Nam (#fyp, #xuhuong)
- Tránh lặp lại nguyên văn nội dung script video

**Prompt đặc trưng:**

- Viết tiếng Việt tự nhiên, thân thiện như tâm sự với bạn bè
- Dòng đầu: Hook gây chú ý
- Đoạn giữa: Sản phẩm + lợi ích + social proof
- Tạo urgency: "giá tốt", "có hạn", "nhanh tay"
- Dòng cuối: CTA rõ ràng + hashtags

**Quy trình hoạt động:**

```
Product + Script Summary → AI tạo caption → Parse & Trích xuất → PostDescription
```

**Đầu vào:**

- Tên sản phẩm
- Tóm tắt nội dung video (tối đa 200 ký tự)
- Nền tảng mục tiêu

**Đầu ra:**

- PostDescription với caption, hashtags, CTA
- Số từ của caption

---

## 🔄 Các Service hỗ trợ

### AI Orchestrator (`ai-orchestrator.ts`)

**Chức năng:**

- Quản lý chọn AI provider (Ollama → Gemini fallback)
- Hiển thị đúng tên model từ cấu hình `.env` (đã fix bug)
- Test kết nối provider
- Điều phối mọi gọi AI qua interface thống nhất

**Cơ chế fallback:**

1. Thử Ollama trước (AI local)
2. Nếu Ollama lỗi → Chuyển sang Gemini
3. Nếu Gemini cũng lỗi → Báo lỗi

---

### Ollama Client (`ollama-client.ts`)

**Chức năng:**

- Kết nối đến Ollama AI instance local
- Dùng model từ biến môi trường `OLLAMA_MODEL`
- Model mặc định: `llama3.2`
- Có thể kiểm tra kết nối bằng `ollama.list()`

---

### Gemini Client (`gemini-client.ts`)

**Chức năng:**

- Kết nối đến Google Gemini API (cloud)
- Dùng model từ biến môi trường `GEMINI_MODEL`
- Model mặc định: `gemini-2.0-flash`
- Yêu cầu `GEMINI_API_KEY` trong `.env`
- Có thể kiểm tra kết nối bằng `ai.models.list()`

---

### TTS Service (`tts-service.ts`)

**Chức năng:**

- Chuyển text thành giọng nói bằng gTTS (Google Text-to-Speech)
- Nhiều giọng đọc tiếng Việt khác nhau
- Tạo file audio và tính thời lượng
- Lưu file vào `/output/audio/`

---

### Trends API (`trends-api.ts`)

**Chức năng:**

- Cung cấp nhãn nguồn scan (TikTok/YouTube/Shopee)
- Chọn nguồn ngẫu nhiên cho trend scanning

---

### Data Storage (`data/storage.ts`)

**Chức năng:**

- Lưu trữ local bằng JSON
- Products: `/data/products.json`
- History: `/data/history.json`
- Export ra file text trong `/exports/`
- Quản lý: thêm, sửa, xóa, lấy danh sách

---

## 🎨 Hệ thống Niches (`config/niches.ts`)

10+ niche sản phẩm được định nghĩa sẵn, mỗi niche có:

- **Keywords:** Từ khóa để search
- **Hashtags:** Hashtags liên quan
- **Pain Points:** Nỗi đau/insight khách hàng
- **Content Angles:** Góc độ content để marketing

**Ví dụ:**

- Đồ gia dụng nhà bếp
- Mỹ phẩm & làm đẹp
- Đồ công nghệ
- Thời trang & phụ kiện
- Chăm sóc nhà cửa
- Sức khỏe & fitness
- Và nhiều hơn nữa...

---

## 📊 Validation nội dung

- Tự động validate chất lượng output từ AI
- Cơ chế retry (tối đa 3 lần) nếu output không đạt chuẩn
- Graceful degradation: vẫn hiển thị output dù chưa hoàn hảo sau khi retry hết

---

## 🛠️ Tính năng nổi bật

### Chỉnh sửa & Tạo lại

- Chỉnh sửa script/description trong text editor
- Tạo lại content với cùng sản phẩm
- Thử lại với AI model khác nếu cần

### Tùy chọn Export

- Copy vào clipboard
- Export ra file `.txt` có timestamp
- File lưu trong `/exports/`

### Tái sử dụng sản phẩm

- Sản phẩm được lưu tự động
- Theo dõi số lần sử dụng
- Chọn nhanh từ sản phẩm đã lưu

### Tối ưu theo nền tảng

- **TikTok:** Nhịp nhanh, tập trung trend, hook viral
- **YouTube Shorts:** Mô tả chi tiết hơn một chút

---

## 🔐 Cấu hình (`.env`)

```bash
# AI Providers
OLLAMA_MODEL=llama3.2
OLLAMA_BASE_URL=http://localhost:11434
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash
AI_PROVIDER=ollama

# Database (tùy chọn)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

---

## 📁 Luồng dữ liệu

```
Input người dùng → Chọn Agent → AI Orchestrator → Ollama/Gemini
                        ↓
                 Parse phản hồi
                        ↓
          Validation & Retry
                        ↓
     Hiển thị + Lưu vào History
                        ↓
   Export/Copy/Chỉnh sửa/Tạo lại
```

---

## 🎯 Các trường hợp sử dụng

1. **Content nhanh:** Nhập sản phẩm → Có script trong 30 giây
2. **Nghiên cứu trend:** Auto-scan sản phẩm trending → Tạo campaign hoàn chỉnh
3. **Sản xuất hàng loạt:** Tạo nhiều script cho nhiều nền tảng khác nhau
4. **Content giọng nói:** Chuyển script thành audio cho voiceover TikTok
5. **Quản lý campaign:** Theo dõi history, tái sử dụng sản phẩm效果好 nhất

---

_Cập nhật lần cuối: 2026-04-07_

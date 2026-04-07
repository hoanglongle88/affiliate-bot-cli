# Hướng dẫn Migration lên Supabase

## 📋 Tổng quan

Bot đã được cập nhật để hỗ trợ **Supabase** làm storage chính, với fallback JSON tự động.

### Cơ chế hoạt động

| Trạng thái                 | Behavior                                                                |
| -------------------------- | ----------------------------------------------------------------------- |
| **Chưa cấu hình Supabase** | Bot tự động dùng JSON files (`data/products.json`, `data/history.json`) |
| **Đã cấu hình Supabase**   | Bot dùng PostgreSQL database, JSON làm fallback khi có lỗi              |
| **Supabase gặp lỗi**       | Tự động fallback về JSON files → Vẫn hoạt động bình thường              |

### Ưu điểm của Supabase

✅ **Đa thiết bị**: Dữ liệu đồng bộ across machines  
✅ **Backup tự động**: Supabase tự backup hàng ngày  
✅ **Query mạnh mẽ**: PostgreSQL queries, filters, pagination  
✅ **Scalable**: Không giới hạn file size như JSON  
✅ **An toàn**: Row Level Security, encrypted at rest  
✅ **Miễn phí**: Free tier đủ dùng cho cá nhân

## 🚀 Các bước setup Supabase

### Bước 1: Tạo Supabase Project

1. Truy cập https://supabase.com
2. Đăng nhập/đăng ký tài khoản (dùng GitHub, Google, email)
3. Click **"New Project"**
4. Điền thông tin:
   - **Organization**: Chọn hoặc tạo mới
   - **Project name**: Đặt tên (VD: `affiliate-bot-db`)
   - **Database Password**: Tạo mật khẩu mạnh (lưu lại!)
   - **Region**: Chọn gần nhất (Singapore hoặc Tokyo cho VN)
5. Click **"Create new project"**
6. Đợi 1-2 phút để project được tạo

### Bước 2: Lấy thông tin kết nối

1. Vào Supabase Dashboard → Project của bạn
2. Click **"Project Settings"** (biểu tượng bánh răng ⚙️)
3. Scroll xuống phần **"API"**
4. Copy 2 thông tin:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Chuỗi dài bắt đầu bằng `eyJ...`

### Bước 3: Chạy SQL Schema

1. Trong Supabase Dashboard, click **"SQL Editor"** (thanh bên trái)
2. Click **"New query"**
3. Mở file `supabase-schema.sql` trong project của bạn
4. Copy toàn bộ nội dung file
5. Paste vào SQL Editor
6. Click **"Run"** (hoặc Ctrl+Enter)
7. Đợi thông báo **"Success. No rows returned"**

> ✅ **Đã tạo xong:** 2 tables (`products`, `history`) với indexes và policies

### Bước 4: Cấu hình .env

Mở file `.env` trong project và cập nhật:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Ví dụ thực tế:**

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.abcdefghijklmnopqrstuvwxyz123456
```

### Bước 5: Migration dữ liệu (nếu có dữ liệu cũ)

Nếu bạn đã có dữ liệu trong JSON files (`data/products.json`, `data/history.json`):

```bash
npm run migrate
```

**Script sẽ tự động:**

1. ✅ Kiểm tra kết nối Supabase
2. ✅ Đọc `data/products.json`
3. ✅ Upload từng sản phẩm lên Supabase
4. ✅ Đọc `data/history.json`
5. ✅ Upload từng history entry lên Supabase
6. ✅ Báo cáo kết quả (thành công/thất bại)

**Ví dụ output:**

```
🚀 Bắt đầu migration lên Supabase...
✅ Đã kết nối Supabase

📦 Migrating products...
✅ Đã migrate 5 products

📜 Migrating history...
✅ Đã migrate 20 history entries

🎉 Migration hoàn tất!
💡 Bạn có thể xóa files JSON cũ nếu muốn
```

### Bước 6: Chạy bot và kiểm tra

```bash
npm run dev
```

Bot sẽ tự động dùng Supabase!

**Kiểm tra:**

1. Tạo 1 nội dung mới
2. Vào Supabase Dashboard → **Table Editor**
3. Kiểm tra tables `products` và `history`
4. Xem dữ liệu đã được insert

## 📊 Database Schema chi tiết

### Bảng `products`

Lưu trữ thông tin sản phẩm đã được sử dụng.

| Cột           | Kiểu        | Ràng buộc         | Mô tả                         |
| ------------- | ----------- | ----------------- | ----------------------------- |
| `id`          | TEXT        | PRIMARY KEY       | ID unique (VD: `prod_abc123`) |
| `name`        | TEXT        | NOT NULL          | Tên sản phẩm                  |
| `description` | TEXT        | NOT NULL          | Mô tả sản phẩm                |
| `price`       | TEXT        | DEFAULT "Chưa có" | Giá tiền                      |
| `rating`      | TEXT        | DEFAULT "Chưa có" | Đánh giá (VD: "4.8/5")        |
| `sold`        | TEXT        | DEFAULT "Chưa có" | Số lượng đã bán (VD: "10k+")  |
| `usage_count` | INTEGER     | DEFAULT 1         | Số lần đã sử dụng tạo content |
| `created_at`  | TIMESTAMPTZ | DEFAULT NOW()     | Thời gian tạo                 |

**Indexes:**

- `idx_products name`: Tìm kiếm theo tên nhanh
- `idx products usage_count DESC`: Sắp xếp theo mức độ sử dụng

**Ví dụ dữ liệu:**

```json
{
  "id": "prod_abc123",
  "name": "Máy hút bụi Deerma CM800",
  "description": "Máy hút bụi cầm tay diệt khuẩn UV...",
  "price": "299.000đ",
  "rating": "4.8/5",
  "sold": "15k+",
  "usage_count": 5,
  "created_at": "2026-04-07T10:30:00Z"
}
```

### Bảng `history`

Lưu trữ lịch sử tạo nội dung (scripts, descriptions).

| Cột            | Kiểu        | Ràng buộc                       | Mô tả                                    |
| -------------- | ----------- | ------------------------------- | ---------------------------------------- |
| `id`           | TEXT        | PRIMARY KEY                     | ID unique (VD: `hist_xyz789`)            |
| `product_id`   | TEXT        | FK → products.id (optional)     | Link đến products table                  |
| `product_data` | JSONB       | NOT NULL                        | Snapshot thông tin sản phẩm              |
| `content_data` | JSONB       | NOT NULL                        | Nội dung AI đã tạo (script, description) |
| `workflow`     | TEXT        | CHECK (script/description/full) | Loại workflow đã dùng                    |
| `created_at`   | TIMESTAMPTZ | DEFAULT NOW()                   | Thời gian tạo                            |

**Indexes:**

- `idx history created_at DESC`: Sắp xếp theo thời gian
- `idx history workflow`: Lọc theo loại workflow

**JSONB Structure - `product_data`:**

```json
{
  "name": "Máy hút bụi Deerma CM800",
  "description": "Máy hút bụi cầm tay...",
  "price": "299.000đ",
  "rating": "4.8/5",
  "sold": "15k+"
}
```

**JSONB Structure - `content_data`:**

```json
{
  "script": {
    "platform": "tiktok",
    "title": "Review Máy hút bụi Deerma CM800",
    "hook": "Bạn có biết 80% bụi trong nhà đến từ đâu?",
    "body": "Nội dung chính của video...",
    "voiceoverCTA": "Nhấn giỏ hàng bên trái để mua ngay!",
    "wordCount": 95,
    "estimatedDuration": "38 giây"
  },
  "description": {
    "platform": "tiktok",
    "caption": "Sản phẩm này quá đỉnh luôn mn ơi!...",
    "hashtags": ["#fyp", "#xuhuong", "#review", "#mayhutbui"],
    "cta": "Mua ngay tại giỏ hàng nhé!",
    "wordCount": 180
  }
}
```

**Ví dụ dữ liệu:**

```json
{
  "id": "hist_xyz789",
  "product_id": "prod_abc123",
  "product_data": {...},
  "content_data": {...},
  "workflow": "full",
  "created_at": "2026-04-07T11:00:00Z"
}
```

## 🔧 API Changes (Breaking Changes)

### Trước đây (synchronous)

```typescript
// Old code - sync
const products = getProducts();
saveToHistory(product, content, "script");
const history = getHistory();
```

### Bây giờ (asynchronous)

```typescript
// New code - async
const products = await getProducts();
await saveToHistory(product, content, "script");
const history = await getHistory();
```

> ✅ **Tất cả functions trong `src/index.ts` đã được update để dùng `await`**

### Các functions đã chuyển sang async

| Function             | Trước | Giờ   | Ghi chú                            |
| -------------------- | ----- | ----- | ---------------------------------- |
| `saveProduct`        | sync  | async | Trả về SavedProduct                |
| `getProducts`        | sync  | async | Trả về `SavedProduct[]`            |
| `getProductById`     | sync  | async | Trả về `SavedProduct \| undefined` |
| `deleteProduct`      | sync  | async | Trả về boolean                     |
| `saveToHistory`      | sync  | async | Trả về HistoryEntry                |
| `getHistory`         | sync  | async | Trả về `HistoryEntry[]`            |
| `getHistoryEntry`    | sync  | async | Trả về `HistoryEntry \| undefined` |
| `clearHistory`       | sync  | async | Void                               |
| `deleteHistoryEntry` | sync  | async | Trả về boolean                     |

### Migration guide cho code của bạn

Nếu bạn có code custom gọi các functions này:

1. **Thêm `await` trước mọi calls:**

   ```typescript
   // ❌ Sai
   const products = getProducts();

   // ✅ Đúng
   const products = await getProducts();
   ```

2. **Functions chứa calls async cũng phải thành async:**

   ```typescript
   // ❌ Sai
   function myWorkflow() {
     const products = getProducts(); // Error!
   }

   // ✅ Đúng
   async function myWorkflow() {
     const products = await getProducts();
   }
   ```

## 🛡️ Fallback Mechanism chi tiết

### Cách hoạt động

```
┌─────────────────────────────────────┐
│  Bot cần đọc/ghi dữ liệu            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Kiểm tra: Đã cấu hình Supabase?    │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
       ✅ Có         ❌ Không
        │             │
        ▼             ▼
┌───────────┐   ┌──────────┐
│ Thử       │   │ Dùng     │
│ Supabase  │   │ JSON     │
└─────┬─────┘   └──────────┘
      │
      ├──────┐
      │      │
     ✅     ❌ Lỗi
      │      │
      ▼      ▼
┌─────────┐ ┌──────────────┐
│ Thành   │ │ Fallback     │
│ công!   │ │ về JSON      │
└─────────┘ └──────────────┘
```

### Khi nào fallback xảy ra?

- ❌ Mất kết nối internet
- ❌ Supabase credentials sai
- ❌ Table chưa được tạo
- ❌ Quota vượt giới hạn (free tier)
- ❌ Lỗi database bất kỳ

### Behavior khi fallback

```
[WARNING] Supabase error: connection timeout
[INFO] Falling back to JSON storage...
[SUCCESS] Data saved to data/history.json
```

Bot vẫn hoạt động bình thường, chỉ khác là dùng JSON thay vì PostgreSQL.

## ❓ Troubleshooting

### Lỗi "Supabase credentials not configured"

**Nguyên nhân:** `.env` chưa có thông tin Supabase hoặc giá trị là placeholder.

**Cách sửa:**

1. Mở file `.env`
2. Kiểm tra `SUPABASE_URL` và `SUPABASE_ANON_KEY`
3. Đảm bảo không phải giá trị mẫu (`your_supabase_project_url`, `your_supabase_anon_key`)
4. Nếu chưa có, quay lại **Bước 1-4** ở trên

### Lỗi "relation 'products' does not exist"

**Nguyên nhân:** Chưa chạy SQL schema trong Supabase.

**Cách sửa:**

1. Vào Supabase Dashboard → **SQL Editor**
2. Copy nội dung file `supabase-schema.sql`
3. Paste và **Run**
4. Kiểm tra lại trong **Table Editor** xem tables đã có chưa

### Lỗi "duplicate key value violates unique constraint"

**Nguyên nhân:** Product với tên đó đã tồn tại trong database.

**Cách sửa:**

- Đây là behavior bình thường - code sẽ tự động **upsert** (update nếu tồn tại)
- Nếu vẫn lỗi, kiểm tra logic `saveProduct()` trong `src/data/storage.ts`

### Migration thất bại

**Kiểm tra:**

1. ✅ Kết nối internet ổn định
2. ✅ Supabase project đang hoạt động (vào Dashboard kiểm tra)
3. ✅ Credentials đúng trong `.env`
4. ✅ SQL schema đã được chạy
5. ✅ JSON files có dữ liệu hợp lệ

**Debug:**

```bash
# Xem JSON files có dữ liệu không
cat data/products.json
cat data/history.json

# Test kết nối Supabase
npm run dev
# Chọn option 8: Kiểm tra kết nối AI
```

### Bot vẫn dùng JSON dù đã cấu hình Supabase

**Kiểm tra:**

1. Restart bot sau khi sửa `.env`
2. Kiểm tra console logs khi khởi động
3. Xem có message nào về Supabase errors không

### Data không đồng bộ giữa các máy

**Nguyên nhân:** Một trong các máy đang dùng JSON thay vì Supabase.

**Cách sửa:**

- Đảm bảo TẤT CẢ máy đều có cùng `.env` với Supabase credentials
- Chạy `npm run dev` trên mỗi máy để kiểm tra

## 🎯 So sánh: JSON vs Supabase

| Tính năng       | JSON Files           | Supabase                   |
| --------------- | -------------------- | -------------------------- |
| **Tốc độ**      | ⚡ Nhanh hơn (local) | 🐢 Chậm hơn chút (network) |
| **Đa thiết bị** | ❌ Không             | ✅ Có                      |
| **Backup**      | ❌ Tự quản lý        | ✅ Tự động                 |
| **Giới hạn**    | File size            | Free tier: 500MB           |
| **Query**       | Đơn giản             | PostgreSQL mạnh mẽ         |
| **Setup**       | Không cần            | Cần 5 phút                 |
| **Offline**     | ✅ Hoạt động         | ❌ Cần internet            |
| **Scalable**    | ❌ Không             | ✅ Có                      |

## 💡 Best Practices

### Khi nào nên dùng Supabase?

✅ Làm việc trên nhiều máy  
✅ Muốn backup tự động  
✅ Sắp vượt quá giới hạn JSON  
✅ Cần query phức tạp  
✅ Làm việc nhóm

### Khi nào nên dùng JSON?

✅ Chỉ làm trên 1 máy  
✅ Không muốn phụ thuộc internet  
✅ Prototype nhanh  
✅ Không cần backup

### Hybrid Approach (Khuyến nghị)

Cấu hình Supabase nhưng để fallback JSON:

- Bình thường dùng Supabase
- Khi mất mạng → tự động sang JSON
- Khi có mạng lại → sync thủ công nếu cần

## 📝 Các lệnh hữu ích

```bash
# Migration dữ liệu lên Supabase
npm run migrate

# Chạy bot (sẽ dùng Supabase nếu đã cấu hình)
npm run dev

# Build và chạy production
npm run build
npm start

# Xem JSON files (để backup thủ công)
cat data/products.json
cat data/history.json

# Xóa JSON files (sau khi migration thành công)
rm data/products.json data/history.json
```

## 📚 Tài liệu tham khảo

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)

---

**Cập nhật lần cuối:** 2026-04-07  
**Version:** 1.0.0

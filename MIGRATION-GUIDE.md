# Hướng dẫn Migration lên Supabase

## 📋 Tổng quan

Bot đã được cập nhật để hỗ trợ **Supabase** làm storage chính, với fallback JSON tự động.

### Cơ chế hoạt động

- **Khi chưa cấu hình Supabase**: Bot tự động dùng JSON files (`data/products.json`, `data/history.json`)
- **Khi đã cấu hình Supabase**: Bot dùng PostgreSQL database, JSON làm fallback khi có lỗi

## 🚀 Các bước setup

### Bước 1: Tạo Supabase Project

1. Truy cập https://supabase.com
2. Tạo project mới (miễn phí)
3. Copy **Project URL** và **anon public key**

### Bước 2: Chạy SQL Schema

1. Mở Supabase Dashboard → SQL Editor
2. Copy paste nội dung file `supabase-schema.sql`
3. Run để tạo tables và policies

### Bước 3: Cấu hình .env

Mở file `.env` và cập nhật:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Bước 4: Migration dữ liệu (nếu có dữ liệu cũ)

Nếu đã có dữ liệu trong JSON files:

```bash
npm run migrate
```

Script sẽ:
- ✅ Đọc `data/products.json` và `data/history.json`
- ✅ Upload toàn bộ lên Supabase
- ✅ Báo cáo kết quả

### Bước 5: Chạy bot

```bash
npm run dev
```

Bot sẽ tự động dùng Supabase!

## 📊 Database Schema

### Bảng `products`

| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | TEXT | Primary key (ID unique) |
| name | TEXT | Tên sản phẩm |
| description | TEXT | Mô tả sản phẩm |
| price | TEXT | Giá |
| rating | TEXT | Đánh giá |
| sold | TEXT | Số lượng đã bán |
| usage_count | INTEGER | Số lần sử dụng |
| created_at | TIMESTAMPTZ | Thời gian tạo |

### Bảng `history`

| Cột | Kiểu | Mô tả |
|-----|------|--------|
| id | TEXT | Primary key |
| product_id | TEXT | FK → products.id (optional) |
| product_data | JSONB | Thông tin sản phẩm (snapshot) |
| content_data | JSONB | Nội dung AI đã tạo |
| workflow | TEXT | script/description/full |
| created_at | TIMESTAMPTZ | Thời gian tạo |

## 🔄 API Changes

### Trước đây (sync)
```typescript
const products = getProducts();
saveToHistory(product, content, "script");
```

### Bây giờ (async)
```typescript
const products = await getProducts();
await saveToHistory(product, content, "script");
```

> ✅ Tất cả functions trong `src/index.ts` đã được update để dùng `await`

## 📝 Các functions đã update

| Function | Trước | Giờ |
|----------|-------|-----|
| `saveProduct` | sync | async |
| `getProducts` | sync | async |
| `getProductById` | sync | async |
| `deleteProduct` | sync | async |
| `saveToHistory` | sync | async |
| `getHistory` | sync | async |
| `getHistoryEntry` | sync | async |
| `clearHistory` | sync | async |
| `deleteHistoryEntry` | sync | async |

## 🛡️ Fallback Mechanism

Nếu Supabase có lỗi (mạng, quota, ...), bot tự động fallback về JSON:

```
Supabase error → JSON fallback → Vẫn hoạt động bình thường
```

## ❓ Troubleshooting

### Lỗi "Supabase credentials not configured"
- Kiểm tra lại `.env` đã có `SUPABASE_URL` và `SUPABASE_ANON_KEY`
- Đảm bảo giá trị không phải placeholder

### Lỗi "relation 'products' does not exist"
- Bạn chưa chạy SQL schema
- Mở Supabase SQL Editor và chạy `supabase-schema.sql`

### Migration thất bại
- Kiểm tra kết nối internet
- Đảm bảo Supabase project đang hoạt động
- Xem logs để biết chi tiết lỗi

## 🎯 Lợi ích

✅ **Đa thiết bị**: Dữ liệu đồng bộ across machines  
✅ **Backup tự động**: Supabase tự backup hàng ngày  
✅ **Query mạnh mẽ**: PostgreSQL queries, filters, pagination  
✅ **Scalable**: Không giới hạn file size như JSON  
✅ **An toàn**: Row Level Security, encrypted at rest

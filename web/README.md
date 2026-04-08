# 🌐 Affiliate Bot — Web Dashboard

React + TypeScript + Vite web dashboard cho Affiliate Bot CLI.

## 🚀 Setup

```bash
cd web
npm install
npm run dev        # Development server (Vite proxy → localhost:3000/api)
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

## 📁 Cấu trúc `src/core/`

```
web/src/core/
├── components/     # Reusable UI (ErrorBoundary, Tooltip)
├── config/         # Axios instance (baseURL, timeout, interceptors)
├── constants/      # App constants (PAGE_SIZE, PLATFORMS, etc.)
├── helper/         # Validation helpers (isValidPrice, isValidRating, isValidSold)
├── hooks/          # Custom hooks per module
│   ├── useProducts.ts    # Products pagination, search, sort, debounce
│   ├── useScripts.ts     # Scripts CRUD, bulk ops, regenerate, warnings
│   └── useDashboard.ts   # Dashboard stats
├── interfaces/     # TypeScript interfaces per module
└── services/       # API clients per module (axios-based)
```

## 🔧 Axios Configuration

- **Base URL:** `/api` (proxied to backend server)
- **Timeout:** 60s (cho AI calls)
- **Interceptors:**
  - Request: placeholder cho auth token
  - Response: centralized error handling (401, 403, 404, 429, 500, 502, 503)

## 📊 Modules

### Products (`/products`)

- Server-side pagination + search (400ms debounce) + sort
- Bulk delete với checkbox selection
- CSV import/export (formula injection protected)
- USP field trong form + badge trên table
- Delete all confirmation modal

### Scripts (`/scripts`)

- Server-side pagination + platform filter
- Product selector với autocomplete + auto-fill
- Bulk select/delete/export
- Regenerate script (giữ nguyên ID)
- Copy riêng từng phần (Hook/Body/CTA)
- Validation warnings (không chặn, vẫn lưu)
- Debounce generate button (3s cooldown)

### Dashboard (`/`)

- Stats cards (products, scripts, captions, trends)
- API health check

---

**Updated:** 2026-04-09

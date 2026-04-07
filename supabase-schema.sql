-- Affiliate Bot CLI - Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL DEFAULT 'Chưa có',
  rating TEXT NOT NULL DEFAULT 'Chưa có',
  sold TEXT NOT NULL DEFAULT 'Chưa có',
  usage_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- History table
CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  product_data JSONB NOT NULL,
  content_data JSONB NOT NULL,
  workflow TEXT NOT NULL CHECK (workflow IN ('script', 'description', 'full')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_usage_count ON products(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_workflow ON history(workflow);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since this is a CLI tool, not multi-tenant)
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on history" ON history FOR ALL USING (true) WITH CHECK (true);

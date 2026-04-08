-- Affiliate Bot CLI - Supabase Schema v2
-- Run this SQL in your Supabase SQL Editor
-- Updated: 2026-04-08 — Added separate tables for each content type

-- ── Products table ──
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

-- ── Video Scripts table ──
CREATE TABLE IF NOT EXISTS video_scripts (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT NOT NULL,
  hook TEXT NOT NULL,
  body TEXT NOT NULL,
  voiceover_cta TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  estimated_duration TEXT NOT NULL,
  raw_ai_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Post Descriptions table ──
CREATE TABLE IF NOT EXISTS post_descriptions (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  script_id TEXT REFERENCES video_scripts(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  headline TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  offer TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  cta TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Trend Briefs table ──
CREATE TABLE IF NOT EXISTS trend_briefs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  niche TEXT NOT NULL,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  angle TEXT NOT NULL,
  hook TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  pain_point TEXT NOT NULL,
  cta_angle TEXT NOT NULL,
  raw_ai_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Image Briefs table ──
CREATE TABLE IF NOT EXISTS image_briefs (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  ad_platform TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  ad_format TEXT NOT NULL,
  visual_style TEXT NOT NULL,
  color_palette TEXT[] NOT NULL DEFAULT '{}',
  prompt_safe TEXT NOT NULL,
  prompt_bold TEXT NOT NULL,
  prompt_lifestyle TEXT NOT NULL,
  negative_prompt TEXT NOT NULL,
  shooting_notes TEXT NOT NULL,
  raw_ai_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── History table (lightweight, references content tables) ──
CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  script_id TEXT REFERENCES video_scripts(id) ON DELETE SET NULL,
  description_id TEXT REFERENCES post_descriptions(id) ON DELETE SET NULL,
  workflow TEXT NOT NULL CHECK (workflow IN ('script', 'description', 'full', 'trend', 'image_brief')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_usage_count ON products(usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_video_scripts_product_id ON video_scripts(product_id);
CREATE INDEX IF NOT EXISTS idx_video_scripts_platform ON video_scripts(platform);
CREATE INDEX IF NOT EXISTS idx_video_scripts_created_at ON video_scripts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_descriptions_product_id ON post_descriptions(product_id);
CREATE INDEX IF NOT EXISTS idx_post_descriptions_platform ON post_descriptions(platform);
CREATE INDEX IF NOT EXISTS idx_post_descriptions_created_at ON post_descriptions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trend_briefs_product_id ON trend_briefs(product_id);
CREATE INDEX IF NOT EXISTS idx_trend_briefs_niche ON trend_briefs(niche);
CREATE INDEX IF NOT EXISTS idx_trend_briefs_created_at ON trend_briefs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_image_briefs_product_id ON image_briefs(product_id);
CREATE INDEX IF NOT EXISTS idx_image_briefs_created_at ON image_briefs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_workflow ON history(workflow);
CREATE INDEX IF NOT EXISTS idx_history_product_id ON history(product_id);

-- ── Row Level Security ──
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- ── Policies (CLI tool, not multi-tenant) ──
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on video_scripts" ON video_scripts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on post_descriptions" ON post_descriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on trend_briefs" ON trend_briefs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on image_briefs" ON image_briefs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on history" ON history FOR ALL USING (true) WITH CHECK (true);

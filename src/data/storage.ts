import fs from "fs";
import path from "path";
import {
  ProductInfo,
  GeneratedContent,
  VideoScript,
  PostDescription,
  TrendBrief,
} from "../types/content";
import {
  SavedVideoScript,
  SavedPostDescription,
  SavedTrendBrief,
  SavedImageBrief,
  PersistedHistoryEntry,
} from "../types/content";
import { supabase } from "../services/supabase-client";

const EXPORTS_DIR = "exports";

// ── Types (legacy compatibility) ──

export interface SavedProduct extends ProductInfo {
  id: string;
  createdAt: string;
  usageCount: number;
}

export interface HistoryEntry {
  id: string;
  product: ProductInfo;
  content: GeneratedContent;
  createdAt: string;
  workflow: "script" | "description" | "full";
}

// ── ID Generator ──

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ═══════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════

export async function saveProduct(product: ProductInfo): Promise<SavedProduct> {
  const { data: existing } = await supabase
    .from("products")
    .select("*")
    .ilike("name", product.name)
    .single();

  if (existing) {
    const { data: updated } = await supabase
      .from("products")
      .update({
        description: product.description,
        price: product.price,
        rating: product.rating,
        sold: product.sold,
        usage_count: existing.usage_count + 1,
      })
      .eq("id", existing.id)
      .select()
      .single();

    return {
      id: updated!.id,
      name: updated!.name,
      description: updated!.description,
      price: updated!.price,
      rating: updated!.rating,
      sold: updated!.sold,
      createdAt: updated!.created_at,
      usageCount: updated!.usage_count,
    };
  }

  const saved: SavedProduct = {
    ...product,
    id: generateId(),
    createdAt: new Date().toISOString(),
    usageCount: 1,
  };

  await supabase.from("products").insert({
    id: saved.id,
    name: saved.name,
    description: saved.description,
    price: saved.price,
    rating: saved.rating,
    sold: saved.sold,
    usage_count: saved.usageCount,
    created_at: saved.createdAt,
  });

  return saved;
}

export async function getProducts(): Promise<SavedProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("usage_count", { ascending: false });

  if (error || !data) {
    console.error("⚠️  Supabase error:", error?.message);
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    rating: p.rating,
    sold: p.sold,
    createdAt: p.created_at,
    usageCount: p.usage_count,
  }));
}

export async function getProductById(
  id: string,
): Promise<SavedProduct | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    rating: data.rating,
    sold: data.sold,
    createdAt: data.created_at,
    usageCount: data.usage_count,
  };
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return !error;
}

export async function deleteAllProducts(): Promise<number> {
  const { error } = await supabase.from("products").delete().neq("id", "");
  return error ? 0 : 1;
}

// ═══════════════════════════════════════════════════════════
// VIDEO SCRIPTS
// ═══════════════════════════════════════════════════════════

export async function saveVideoScript(
  script: VideoScript,
  productId: string | null,
  rawAiResponse?: Record<string, unknown>,
): Promise<SavedVideoScript> {
  const saved: SavedVideoScript = {
    id: generateId(),
    productId,
    platform: script.platform,
    title: script.title,
    hook: script.hook,
    body: script.body,
    voiceoverCta: script.voiceoverCTA,
    wordCount: script.wordCount,
    estimatedDuration: script.estimatedDuration,
    rawAiResponse,
    createdAt: new Date().toISOString(),
  };

  await supabase.from("video_scripts").insert({
    id: saved.id,
    product_id: saved.productId,
    platform: saved.platform,
    title: saved.title,
    hook: saved.hook,
    body: saved.body,
    voiceover_cta: saved.voiceoverCta,
    word_count: saved.wordCount,
    estimated_duration: saved.estimatedDuration,
    raw_ai_response: saved.rawAiResponse,
    created_at: saved.createdAt,
  });

  return saved;
}

export async function getVideoScripts(
  limit: number = 50,
): Promise<SavedVideoScript[]> {
  const { data, error } = await supabase
    .from("video_scripts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("⚠️  Supabase error:", error?.message);
    return [];
  }

  return data.map((s: any) => ({
    id: s.id,
    productId: s.product_id,
    platform: s.platform,
    title: s.title,
    hook: s.hook,
    body: s.body,
    voiceoverCta: s.voiceover_cta,
    wordCount: s.word_count,
    estimatedDuration: s.estimated_duration,
    rawAiResponse: s.raw_ai_response,
    createdAt: s.created_at,
  }));
}

export async function getVideoScriptById(
  id: string,
): Promise<SavedVideoScript | undefined> {
  const { data, error } = await supabase
    .from("video_scripts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    productId: data.product_id,
    platform: data.platform,
    title: data.title,
    hook: data.hook,
    body: data.body,
    voiceoverCta: data.voiceover_cta,
    wordCount: data.word_count,
    estimatedDuration: data.estimated_duration,
    rawAiResponse: data.raw_ai_response,
    createdAt: data.created_at,
  };
}

export async function getVideoScriptsByProductId(
  productId: string,
  limit: number = 20,
): Promise<SavedVideoScript[]> {
  const { data, error } = await supabase
    .from("video_scripts")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((s: any) => ({
    id: s.id,
    productId: s.product_id,
    platform: s.platform,
    title: s.title,
    hook: s.hook,
    body: s.body,
    voiceoverCta: s.voiceover_cta,
    wordCount: s.word_count,
    estimatedDuration: s.estimated_duration,
    rawAiResponse: s.raw_ai_response,
    createdAt: s.created_at,
  }));
}

export async function deleteVideoScript(id: string): Promise<boolean> {
  const { error } = await supabase.from("video_scripts").delete().eq("id", id);
  return !error;
}

export async function deleteAllVideoScripts(): Promise<void> {
  await supabase.from("video_scripts").delete().neq("id", "");
}

// ═══════════════════════════════════════════════════════════
// POST DESCRIPTIONS
// ═══════════════════════════════════════════════════════════

export async function savePostDescription(
  description: PostDescription,
  productId: string | null,
  scriptId: string | null,
): Promise<SavedPostDescription> {
  // Auto-build caption from components
  const hashTags = description.hashtags.map((t) => `#${t}`).join(" ");
  const caption = [
    description.headline ? `🔥 ${description.headline}` : "",
    "",
    description.content,
    "",
    description.offer ? `⚡ ${description.offer}` : "",
    "",
    description.cta ? `👉 ${description.cta}` : "",
    "",
    hashTags,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const saved: SavedPostDescription = {
    id: generateId(),
    productId,
    scriptId,
    platform: description.platform,
    headline: description.headline,
    content: description.content,
    offer: description.offer,
    cta: description.cta,
    hashtags: description.hashtags,
    caption,
    wordCount: description.wordCount || caption.split(/\s+/).length,
    createdAt: new Date().toISOString(),
  };

  await supabase.from("post_descriptions").insert({
    id: saved.id,
    product_id: saved.productId,
    script_id: saved.scriptId,
    platform: saved.platform,
    headline: saved.headline,
    content: saved.content,
    offer: saved.offer,
    cta: saved.cta,
    hashtags: saved.hashtags,
    caption: saved.caption,
    word_count: saved.wordCount,
    created_at: saved.createdAt,
  });

  return saved;
}

export async function getPostDescriptions(
  limit: number = 50,
): Promise<SavedPostDescription[]> {
  const { data, error } = await supabase
    .from("post_descriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("⚠️  Supabase error:", error?.message);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    productId: d.product_id,
    scriptId: d.script_id,
    platform: d.platform,
    headline: d.headline || "",
    content: d.content || "",
    offer: d.offer || "",
    cta: d.cta,
    hashtags: d.hashtags,
    caption: d.caption,
    wordCount: d.word_count,
    createdAt: d.created_at,
  }));
}

export async function getPostDescriptionById(
  id: string,
): Promise<SavedPostDescription | undefined> {
  const { data, error } = await supabase
    .from("post_descriptions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    productId: data.product_id,
    scriptId: data.script_id,
    platform: data.platform,
    headline: data.headline || "",
    content: data.content || "",
    offer: data.offer || "",
    cta: data.cta,
    hashtags: data.hashtags,
    caption: data.caption,
    wordCount: data.word_count,
    createdAt: data.created_at,
  };
}

export async function getPostDescriptionsByProductId(
  productId: string,
  limit: number = 20,
): Promise<SavedPostDescription[]> {
  const { data, error } = await supabase
    .from("post_descriptions")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    productId: d.product_id,
    scriptId: d.script_id,
    platform: d.platform,
    headline: d.headline || "",
    content: d.content || "",
    offer: d.offer || "",
    cta: d.cta,
    hashtags: d.hashtags,
    caption: d.caption,
    wordCount: d.word_count,
    createdAt: d.created_at,
  }));
}

export async function deletePostDescription(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("post_descriptions")
    .delete()
    .eq("id", id);
  return !error;
}

export async function deleteAllPostDescriptions(): Promise<void> {
  await supabase.from("post_descriptions").delete().neq("id", "");
}

// ═══════════════════════════════════════════════════════════
// TREND BRIEFS
// ═══════════════════════════════════════════════════════════

export async function saveTrendBrief(
  brief: TrendBrief,
  productId: string | null,
): Promise<SavedTrendBrief> {
  const saved: SavedTrendBrief = {
    id: generateId(),
    source: brief.platform,
    niche: brief.niche,
    productId,
    angle: brief.angle,
    hook: brief.hook,
    hashtags: brief.hashtags,
    painPoint: brief.painPoint,
    ctaAngle: brief.ctaAngle,
    createdAt: brief.cachedAt,
  };

  await supabase.from("trend_briefs").insert({
    id: saved.id,
    source: saved.source,
    niche: saved.niche,
    product_id: saved.productId,
    angle: saved.angle,
    hook: saved.hook,
    hashtags: saved.hashtags,
    pain_point: saved.painPoint,
    cta_angle: saved.ctaAngle,
    created_at: saved.createdAt,
  });

  return saved;
}

export async function getTrendBriefs(
  limit: number = 30,
): Promise<SavedTrendBrief[]> {
  const { data, error } = await supabase
    .from("trend_briefs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("⚠️  Supabase error:", error?.message);
    return [];
  }

  return data.map((b: any) => ({
    id: b.id,
    source: b.source,
    niche: b.niche,
    productId: b.product_id,
    angle: b.angle,
    hook: b.hook,
    hashtags: b.hashtags,
    painPoint: b.pain_point,
    ctaAngle: b.cta_angle,
    createdAt: b.created_at,
  }));
}

export async function getTrendBriefById(
  id: string,
): Promise<SavedTrendBrief | undefined> {
  const { data, error } = await supabase
    .from("trend_briefs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    source: data.source,
    niche: data.niche,
    productId: data.product_id,
    angle: data.angle,
    hook: data.hook,
    hashtags: data.hashtags,
    painPoint: data.pain_point,
    ctaAngle: data.cta_angle,
    createdAt: data.created_at,
  };
}

export async function deleteTrendBrief(id: string): Promise<boolean> {
  const { error } = await supabase.from("trend_briefs").delete().eq("id", id);
  return !error;
}

export async function deleteAllTrendBriefs(): Promise<void> {
  await supabase.from("trend_briefs").delete().neq("id", "");
}

// ═══════════════════════════════════════════════════════════
// IMAGE BRIEFS
// ═══════════════════════════════════════════════════════════

export async function saveImageBrief(
  brief: SavedImageBrief,
): Promise<SavedImageBrief> {
  const saved = {
    ...brief,
    createdAt: brief.createdAt || new Date().toISOString(),
  };

  await supabase.from("image_briefs").insert({
    id: saved.id,
    product_id: saved.productId,
    ad_platform: saved.adPlatform,
    aspect_ratio: saved.aspectRatio,
    ad_format: saved.adFormat,
    visual_style: saved.visualStyle,
    color_palette: saved.colorPalette,
    prompt_safe: saved.promptSafe,
    prompt_bold: saved.promptBold,
    prompt_lifestyle: saved.promptLifestyle,
    negative_prompt: saved.negativePrompt,
    shooting_notes: saved.shootingNotes,
    raw_ai_response: saved.rawAiResponse,
    created_at: saved.createdAt,
  });

  return saved;
}

export async function getImageBriefs(
  limit: number = 30,
): Promise<SavedImageBrief[]> {
  const { data, error } = await supabase
    .from("image_briefs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("⚠️  Supabase error:", error?.message);
    return [];
  }

  return data.map((b: any) => ({
    id: b.id,
    productId: b.product_id,
    adPlatform: b.ad_platform,
    aspectRatio: b.aspect_ratio,
    adFormat: b.ad_format,
    visualStyle: b.visual_style,
    colorPalette: b.color_palette,
    promptSafe: b.prompt_safe,
    promptBold: b.prompt_bold,
    promptLifestyle: b.prompt_lifestyle,
    negativePrompt: b.negative_prompt,
    shootingNotes: b.shooting_notes,
    rawAiResponse: b.raw_ai_response,
    createdAt: b.created_at,
  }));
}

export async function getImageBriefById(
  id: string,
): Promise<SavedImageBrief | undefined> {
  const { data, error } = await supabase
    .from("image_briefs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    productId: data.product_id,
    adPlatform: data.ad_platform,
    aspectRatio: data.aspect_ratio,
    adFormat: data.ad_format,
    visualStyle: data.visual_style,
    colorPalette: data.color_palette,
    promptSafe: data.prompt_safe,
    promptBold: data.prompt_bold,
    promptLifestyle: data.prompt_lifestyle,
    negativePrompt: data.negative_prompt,
    shootingNotes: data.shooting_notes,
    rawAiResponse: data.raw_ai_response,
    createdAt: data.created_at,
  };
}

export async function deleteImageBrief(id: string): Promise<boolean> {
  const { error } = await supabase.from("image_briefs").delete().eq("id", id);
  return !error;
}

export async function deleteAllImageBriefs(): Promise<void> {
  await supabase.from("image_briefs").delete().neq("id", "");
}

// ═══════════════════════════════════════════════════════════
// HISTORY (references content tables by ID)
// ═══════════════════════════════════════════════════════════

export async function saveToHistory(
  product: ProductInfo,
  content: GeneratedContent,
  workflow: "script" | "description" | "full",
): Promise<HistoryEntry> {
  const entry: HistoryEntry = {
    id: generateId(),
    product,
    content,
    createdAt: new Date().toISOString(),
    workflow,
  };

  await supabase.from("history").insert({
    id: entry.id,
    product_data: entry.product,
    content_data: entry.content,
    workflow: entry.workflow,
    created_at: entry.createdAt,
  });

  // Keep only last 100 entries
  const { data: allHistory } = await supabase
    .from("history")
    .select("id")
    .order("created_at", { ascending: false });

  if (allHistory && allHistory.length > 100) {
    const toDelete = allHistory.slice(100).map((h: any) => h.id);
    await supabase.from("history").delete().in("id", toDelete);
  }

  return entry;
}

/**
 * Save history with content references (new method)
 */
export async function saveToHistoryWithRefs(
  productId: string | null,
  scriptId: string | null,
  descriptionId: string | null,
  workflow: "script" | "description" | "full" | "trend" | "image_brief",
): Promise<PersistedHistoryEntry> {
  const entry: PersistedHistoryEntry = {
    id: generateId(),
    productId,
    scriptId,
    descriptionId,
    workflow,
    createdAt: new Date().toISOString(),
  };

  await supabase.from("history").insert({
    id: entry.id,
    product_id: entry.productId,
    script_id: entry.scriptId,
    description_id: entry.descriptionId,
    workflow: entry.workflow,
    created_at: entry.createdAt,
  });

  // Keep only last 100 entries
  const { data: allHistory } = await supabase
    .from("history")
    .select("id")
    .order("created_at", { ascending: false });

  if (allHistory && allHistory.length > 100) {
    const toDelete = allHistory.slice(100).map((h: any) => h.id);
    await supabase.from("history").delete().in("id", toDelete);
  }

  return entry;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    console.error("⚠️  Supabase error:", error?.message);
    return [];
  }

  return data.map((h: any) => ({
    id: h.id,
    product: h.product_data,
    content: h.content_data,
    createdAt: h.created_at,
    workflow: h.workflow,
  }));
}

export async function getHistoryWithRefs(
  limit: number = 50,
): Promise<PersistedHistoryEntry[]> {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("⚠️  Supabase error:", error?.message);
    return [];
  }

  return data.map((h: any) => ({
    id: h.id,
    productId: h.product_id,
    scriptId: h.script_id,
    descriptionId: h.description_id,
    workflow: h.workflow,
    createdAt: h.created_at,
  }));
}

export async function getHistoryEntry(
  id: string,
): Promise<HistoryEntry | undefined> {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;

  return {
    id: data.id,
    product: data.product_data,
    content: data.content_data,
    createdAt: data.created_at,
    workflow: data.workflow,
  };
}

export async function getHistoryEntryWithRefs(id: string): Promise<{
  history: PersistedHistoryEntry;
  product: SavedProduct | null;
  script: SavedVideoScript | null;
  description: SavedPostDescription | null;
} | null> {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const historyEntry: PersistedHistoryEntry = {
    id: data.id,
    productId: data.product_id,
    scriptId: data.script_id,
    descriptionId: data.description_id,
    workflow: data.workflow,
    createdAt: data.created_at,
  };

  // Load referenced content
  const product = historyEntry.productId
    ? await getProductById(historyEntry.productId)
    : null;

  const script = historyEntry.scriptId
    ? await getVideoScriptById(historyEntry.scriptId)
    : null;

  const description = historyEntry.descriptionId
    ? await getPostDescriptionById(historyEntry.descriptionId)
    : null;

  return {
    history: historyEntry,
    product: product || null,
    script: script || null,
    description: description || null,
  };
}

export async function clearHistory(): Promise<void> {
  await supabase.from("history").delete().neq("id", "");
}

export async function deleteHistoryEntry(id: string): Promise<boolean> {
  const { error } = await supabase.from("history").delete().eq("id", id);
  return !error;
}

export async function deleteHistoryEntryById(id: string): Promise<boolean> {
  const { error } = await supabase.from("history").delete().eq("id", id);
  return !error;
}

// ── Export (filesystem only) ──

export function exportToTextFile(
  content: GeneratedContent,
  label: string,
): string {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }

  const lines: string[] = [];
  lines.push("═".repeat(50));
  lines.push(`  AFFILIATE BOT - ${label.toUpperCase()}`);
  lines.push(`  Ngày: ${new Date().toLocaleString("vi-VN")}`);
  lines.push("═".repeat(50));
  lines.push("");
  lines.push(`📦 Sản phẩm: ${content.product.name}`);
  lines.push(`💰 Giá: ${content.product.price}`);
  lines.push(`⭐ Đánh giá: ${content.product.rating}`);
  lines.push(`🔥 Đã bán: ${content.product.sold}`);
  lines.push("");

  if (content.script) {
    lines.push("─".repeat(40));
    lines.push(`📱 ${content.script.platform.toUpperCase()} SCRIPT`);
    lines.push("─".repeat(40));
    lines.push(`🎬 Tiêu đề: ${content.script.title}`);
    lines.push(`🎣 Hook: ${content.script.hook}`);
    lines.push("");
    lines.push(`📝 Nội dung:`);
    lines.push(content.script.body);
    lines.push("");
    lines.push(`📢 Voiceover CTA: ${content.script.voiceoverCTA}`);
    lines.push(
      `📊 Độ dài: ~${content.script.wordCount} từ | ⏱️ ${content.script.estimatedDuration}`,
    );
    lines.push("");
  }

  if (content.description) {
    lines.push("─".repeat(40));
    lines.push(
      `📱 ${content.description.platform.toUpperCase()} POST DESCRIPTION`,
    );
    lines.push("─".repeat(40));
    lines.push(`📝 Caption:`);
    lines.push(content.description.caption);
    lines.push("");
    lines.push(`🏷️ Hashtags: ${content.description.hashtags.join(" ")}`);
    lines.push(`📊 Độ dài: ~${content.description.wordCount} từ`);
    lines.push("");
  }

  lines.push("═".repeat(50));

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const safeName = content.product.name
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .substring(0, 60);

  const filename = `${safeName}_${timestamp}.txt`;
  const filepath = path.join(EXPORTS_DIR, filename);

  fs.writeFileSync(filepath, lines.join("\n"), "utf-8");

  return filepath;
}

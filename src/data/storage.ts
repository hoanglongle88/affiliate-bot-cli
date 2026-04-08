import fs from "fs";
import path from "path";
import {
  ProductInfo,
  GeneratedContent,
  VideoScript,
  PostDescription,
  TrendBrief,
  ShortVideoPrompt,
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
  workflow:
    | "script"
    | "description"
    | "full"
    | "trend"
    | "image_brief"
    | "short_video",
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

  const entries: HistoryEntry[] = [];

  for (const h of data) {
    // Handle both old format (product_data embedded) and new format (product_id reference)
    let productData = h.product_data;
    let contentData = h.content_data;

    // If no product_data, try to load from product_id reference
    if (!productData && h.product_id) {
      const prod = await getProductById(h.product_id);
      if (prod) {
        productData = {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          rating: prod.rating,
          sold: prod.sold,
        };
      }
    }

    // If no content_data, try to load from script_id/description_id references
    if (!contentData) {
      contentData = {};
      if (h.script_id) {
        const script = await getVideoScriptById(h.script_id);
        if (script) {
          contentData.script = {
            platform: script.platform,
            title: script.title,
            hook: script.hook,
            body: script.body,
            voiceoverCTA: script.voiceoverCta,
            wordCount: script.wordCount,
            estimatedDuration: script.estimatedDuration,
          };
        }
      }
      if (h.description_id) {
        const desc = await getPostDescriptionById(h.description_id);
        if (desc) {
          contentData.description = {
            platform: desc.platform,
            caption: desc.caption,
            hashtags: desc.hashtags,
            cta: desc.cta,
            wordCount: desc.wordCount,
          };
        }
      }
    }

    // Skip if no data could be loaded
    if (!productData) {
      productData = {
        name: "Unknown",
        description: "",
        price: "",
        rating: "",
        sold: "",
      };
    }

    entries.push({
      id: h.id,
      product: productData,
      content: contentData,
      createdAt: h.created_at,
      workflow: h.workflow,
    });
  }

  return entries;
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

// ═══════════════════════════════════════════════════════════
// SHORT VIDEO PROMPTS
// ═══════════════════════════════════════════════════════════

export async function saveShortVideoPrompt(
  prompt: ShortVideoPrompt,
  productId: string | null,
  scriptId: string | null,
): Promise<void> {
  await supabase.from("short_video_prompts").insert({
    id: generateId(),
    product_id: productId,
    script_id: scriptId,
    style_analysis: prompt.styleAnalysis,
    video_prompt: prompt.videoPrompt,
    aspect_ratio: prompt.aspectRatio,
    visual_quality: prompt.visualQuality,
    created_at: new Date().toISOString(),
  });
}

export async function getShortVideoPrompts(
  limit: number = 50,
): Promise<ShortVideoPrompt[]> {
  const { data, error } = await supabase
    .from("short_video_prompts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((p: any) => ({
    styleAnalysis: p.style_analysis,
    videoPrompt: p.video_prompt,
    aspectRatio: p.aspect_ratio,
    visualQuality: p.visual_quality,
  }));
}

// ── Export (filesystem only) ──

/**
 * Get the export file path for a product
 */
function getExportFilePath(productName: string): string {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }
  const safeName = productName
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .toLowerCase()
    .substring(0, 60);
  return path.join(EXPORTS_DIR, `${safeName}.txt`);
}

/**
 * Build image brief section text
 */
function buildImageBriefSection(
  brief: {
    adFormat: string;
    visualStyle: string;
    colorPalette: string[];
    prompts: { safe: string; bold: string; lifestyle: string };
    negativePrompt: string;
    shootingNotes: string;
  },
  adPlatform: string,
  aspectRatio: string,
): string {
  const lines: string[] = [];
  lines.push("─".repeat(40));
  lines.push("🖼️ IMAGE BRIEF");
  lines.push("─".repeat(40));
  lines.push(
    `Format: ${brief.adFormat} | Platform: ${adPlatform} | Ratio: ${aspectRatio}`,
  );
  lines.push("");
  lines.push(`🎨 Visual: ${brief.visualStyle}`);
  lines.push(`🎨 Colors: ${brief.colorPalette.join(", ")}`);
  lines.push("");
  lines.push("📝 SAFE:");
  lines.push(brief.prompts.safe);
  lines.push("");
  lines.push("📝 BOLD:");
  lines.push(brief.prompts.bold);
  lines.push("");
  lines.push("📝 LIFESTYLE:");
  lines.push(brief.prompts.lifestyle);
  lines.push("");
  lines.push(`🚫 Negative: ${brief.negativePrompt}`);
  lines.push(`📸 Notes: ${brief.shootingNotes}`);
  lines.push("");
  return lines.join("\n");
}

/**
 * Build post description section text
 */
function buildPostDescriptionSection(description: {
  headline: string;
  content: string;
  offer: string;
  cta: string;
  hashtags: string[];
  wordCount: number;
}): string {
  const lines: string[] = [];
  lines.push("─".repeat(40));
  lines.push("📝 POST DESCRIPTION");
  lines.push("─".repeat(40));
  if (description.headline) lines.push(`🔥 Headline: ${description.headline}`);
  if (description.content) lines.push(`📝 Content: ${description.content}`);
  if (description.offer) lines.push(`⚡ Offer: ${description.offer}`);
  if (description.cta) lines.push(`👉 CTA: ${description.cta}`);
  if (description.hashtags.length > 0) {
    const hashTags = description.hashtags.map((t) => `#${t}`).join(" ");
    lines.push(`🏷️ Hashtags: ${hashTags}`);
  }
  lines.push(`📊 Độ dài: ~${description.wordCount} từ`);
  lines.push("");
  return lines.join("\n");
}

/**
 * Export image brief to file (creates new file OR updates existing)
 */
export function exportImageBrief(
  productName: string,
  productInfo: { price: string; rating: string; sold: string },
  brief: {
    adFormat: string;
    visualStyle: string;
    colorPalette: string[];
    prompts: { safe: string; bold: string; lifestyle: string };
    negativePrompt: string;
    shootingNotes: string;
  },
  adPlatform: string,
  aspectRatio: string,
): string {
  const baseFilepath = getExportFilePath(productName);
  const imageBriefText = buildImageBriefSection(brief, adPlatform, aspectRatio);

  // Try to find existing export file for this product (check both new and old formats)
  let filepath = baseFilepath;
  if (fs.existsSync(baseFilepath)) {
    filepath = baseFilepath;
  } else {
    // Check for timestamped files matching this product name
    if (fs.existsSync(EXPORTS_DIR)) {
      const files = fs.readdirSync(EXPORTS_DIR);
      const safeBase = productName
        .replace(/[\/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .substring(0, 60);
      const match = files.find(
        (f) => f.startsWith(safeBase) && f.endsWith(".txt"),
      );
      if (match) {
        filepath = path.join(EXPORTS_DIR, match);
      }
    }
  }

  // If file exists, update it
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, "utf-8");

    // Check if IMAGE BRIEF section exists
    const imageBriefIndex = content.indexOf("🖼️ IMAGE BRIEF");
    if (imageBriefIndex !== -1) {
      // Replace existing image brief section
      const dividerBefore = content.lastIndexOf(
        "─".repeat(40),
        imageBriefIndex,
      );
      const postDescIndex = content.indexOf("📝 POST DESCRIPTION");

      if (
        dividerBefore !== -1 &&
        postDescIndex !== -1 &&
        postDescIndex > imageBriefIndex
      ) {
        // Replace between dividers
        const before = content.substring(0, dividerBefore);
        const after = content.substring(postDescIndex);
        content = before + imageBriefText + "\n" + after;
      } else if (dividerBefore !== -1) {
        // No post description yet — replace to end of file
        content = content.substring(0, dividerBefore) + imageBriefText;
        // Add placeholder for post description
        content += "\n─".repeat(40) + "\n📝 POST DESCRIPTION\n";
        content +=
          "─".repeat(40) +
          "\n\n  [Chưa có — sẽ được cập nhật sau khi tạo caption]\n";
        content += "═".repeat(50);
      }
    } else {
      // No image brief section — prepend before post description or at end
      const postDescIndex = content.indexOf("📝 POST DESCRIPTION");
      if (postDescIndex !== -1) {
        const before = content.substring(0, postDescIndex);
        const after = content.substring(postDescIndex);
        content = before.trimEnd() + "\n\n" + imageBriefText + "\n" + after;
      } else {
        // Append at end, remove footer first
        content = content.replace(/\n═{50}$/, "").trimEnd();
        content += "\n\n" + imageBriefText;
        content += "\n─".repeat(40) + "\n📝 POST DESCRIPTION\n";
        content +=
          "─".repeat(40) +
          "\n\n  [Chưa có — sẽ được cập nhật sau khi tạo caption]\n";
        content += "═".repeat(50);
      }
    }

    fs.writeFileSync(filepath, content, "utf-8");
    return filepath;
  }

  // File doesn't exist — create new
  const date = new Date().toLocaleString("vi-VN");
  const lines: string[] = [];
  lines.push("═".repeat(50));
  lines.push(`  AFFILIATE BOT - ${productName.toUpperCase()}`);
  lines.push(`  Ngày: ${date}`);
  lines.push("═".repeat(50));
  lines.push("");
  lines.push(`📦 Sản phẩm: ${productName}`);
  lines.push(`💰 Giá: ${productInfo.price}`);
  lines.push(`⭐ Đánh giá: ${productInfo.rating}`);
  lines.push(`🔥 Đã bán: ${productInfo.sold}`);
  lines.push("");
  lines.push(imageBriefText);
  lines.push("─".repeat(40));
  lines.push("📝 POST DESCRIPTION");
  lines.push("─".repeat(40));
  lines.push("");
  lines.push("  [Chưa có — sẽ được cập nhật sau khi tạo caption]");
  lines.push("");
  lines.push("═".repeat(50));

  fs.writeFileSync(baseFilepath, lines.join("\n"), "utf-8");
  return baseFilepath;
}

/**
 * Append post description to existing export file
 */
export function appendPostDescription(
  productName: string,
  description: {
    headline: string;
    content: string;
    offer: string;
    cta: string;
    hashtags: string[];
    wordCount: number;
  },
): string {
  const baseFilepath = getExportFilePath(productName);

  // Try to find existing export file (check both new and old timestamped formats)
  let filepath = baseFilepath;
  if (fs.existsSync(baseFilepath)) {
    filepath = baseFilepath;
  } else {
    // Check for timestamped files matching this product name
    if (fs.existsSync(EXPORTS_DIR)) {
      const files = fs.readdirSync(EXPORTS_DIR);
      const safeBase = productName
        .replace(/[\/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "_")
        .toLowerCase()
        .substring(0, 60);
      const match = files.find(
        (f) => f.startsWith(safeBase) && f.endsWith(".txt"),
      );
      if (match) {
        filepath = path.join(EXPORTS_DIR, match);
      }
    }
  }

  // If file doesn't exist, create it with post description only
  if (!fs.existsSync(filepath)) {
    const date = new Date().toLocaleString("vi-VN");
    const lines: string[] = [];
    lines.push("═".repeat(50));
    lines.push(`  AFFILIATE BOT - ${productName.toUpperCase()}`);
    lines.push(`  Ngày: ${date}`);
    lines.push("═".repeat(50));
    lines.push("");
    lines.push(`📦 Sản phẩm: ${productName}`);
    lines.push("");
    lines.push("─".repeat(40));
    lines.push("🖼️ IMAGE BRIEF");
    lines.push("─".repeat(40));
    lines.push("");
    lines.push("  [Chưa có — chưa tạo image brief]");
    lines.push("");
    // Fall through to add post description
  } else {
    // Read existing content and remove old post description section
    let content = fs.readFileSync(filepath, "utf-8");

    // Remove old POST DESCRIPTION section (from header to end of file)
    const postDescIndex = content.indexOf("📝 POST DESCRIPTION");
    if (postDescIndex !== -1) {
      // Find the start of the section (the divider line before it)
      const dividerBefore = content.lastIndexOf("─".repeat(40), postDescIndex);
      if (dividerBefore !== -1) {
        content = content.substring(0, dividerBefore);
      } else {
        content = content.substring(0, postDescIndex);
      }
      // Remove trailing whitespace
      content = content.trimEnd() + "\n";
    }

    fs.writeFileSync(filepath, content, "utf-8");
  }

  // Append post description
  const postLines: string[] = [];
  postLines.push("─".repeat(40));
  postLines.push("📝 POST DESCRIPTION");
  postLines.push("─".repeat(40));

  if (description.headline) {
    postLines.push(`🔥 Headline: ${description.headline}`);
  }
  if (description.content) {
    postLines.push(`📝 Content: ${description.content}`);
  }
  if (description.offer) {
    postLines.push(`⚡ Offer: ${description.offer}`);
  }
  if (description.cta) {
    postLines.push(`👉 CTA: ${description.cta}`);
  }
  if (description.hashtags.length > 0) {
    const hashTags = description.hashtags.map((t) => `#${t}`).join(" ");
    postLines.push(`🏷️ Hashtags: ${hashTags}`);
  }
  postLines.push(`📊 Độ dài: ~${description.wordCount} từ`);
  postLines.push("");
  postLines.push("═".repeat(50));

  fs.appendFileSync(filepath, postLines.join("\n"), "utf-8");
  return filepath;
}

/**
 * Legacy: Export full content (script + description) for backward compatibility
 */
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

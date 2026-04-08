#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import { checkProvidersStatus } from "./services/ai-orchestrator";
import {
  ProductInfo,
  Platform,
  GeneratedContent,
  VideoScript,
  PostDescription,
  SavedVideoScript,
} from "./types/content";
import { VideoCreatorAgent } from "./agents/video-creator";
import { MarketingWriterAgent } from "./agents/marketing-writer";
import { AutonomousTrendScanner } from "./agents/trend-scanner";
import { ImageCreatorAgent } from "./agents/image-creator";
import { ShortCreatorAgent } from "./agents/short-creator";
import { ImagePromptInput } from "./prompts/image-creator";
import {
  formatScriptOutput,
  formatDescriptionOutput,
  copyToClipboard,
  getScriptText,
  getDescriptionText,
  getFullText,
} from "./utils/formatter";
import { validateScript, validateDescription } from "./utils/validator";
import {
  saveProduct,
  getProducts,
  saveToHistory,
  saveToHistoryWithRefs,
  getHistory,
  deleteHistoryEntry,
  clearHistory,
  HistoryEntry,
  deleteProduct,
  deleteAllProducts,
  exportToTextFile,
  exportImageBrief,
  appendPostDescription,
  getVideoScripts,
  getVideoScriptById,
  getVideoScriptsByProductId,
  getPostDescriptions,
  getPostDescriptionById,
  getPostDescriptionsByProductId,
  getImageBriefs,
  getImageBriefById,
  saveVideoScript,
  savePostDescription,
  saveTrendBrief,
  saveImageBrief,
  saveShortVideoPrompt,
} from "./data/storage";
import { TTSService } from "./services/tts-service";
import { getUsage, resetUsage } from "./services/usage-tracker";
import { NICHES, getNicheById, getRandomNiche } from "./config/niches";
import fs from "fs";

// ── Product Input ──

async function selectOrEnterProduct(): Promise<{
  product: ProductInfo;
  productId: string | null;
}> {
  const products = await getProducts();

  if (products.length === 0) {
    const newProduct = await enterProduct();
    // Look up the saved product to get ID
    const allProducts = await getProducts();
    const found = allProducts.find((p) => p.name === newProduct.name);
    return { product: newProduct, productId: found ? found.id : null };
  }

  const { action } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "action",
      message: "📦 Chọn sản phẩm:",
      choices: [
        ...products.slice(0, 5).map((p, i) => ({
          name: `${i + 1}. ${p.name} (đã dùng ${p.usageCount} lần)`,
          value: `use_${p.id}`,
        })),
        ...(products.length > 5
          ? [{ name: "6. ... Xem thêm", value: "more" }]
          : []),
        {
          name: `${products.length > 5 ? 6 : products.length + 1}. 🆕 Nhập sản phẩm mới`,
          value: "new",
        },
      ],
    },
  ]);

  if (action === "new" || action === "more") {
    const newProduct = await enterProduct();
    const allProducts = await getProducts();
    const found = allProducts.find((p) => p.name === newProduct.name);
    return { product: newProduct, productId: found ? found.id : null };
  }

  const productId = action.replace("use_", "");
  const product = products.find((p) => p.id === productId);

  if (product) {
    console.log(chalk.green(`\n✅ Đã chọn: ${product.name}\n`));
    return {
      product: {
        name: product.name,
        description: product.description,
        price: product.price,
        rating: product.rating,
        sold: product.sold,
      },
      productId: product.id,
    };
  }

  const newProduct = await enterProduct();
  const allProducts = await getProducts();
  const found = allProducts.find((p) => p.name === newProduct.name);
  return { product: newProduct, productId: found ? found.id : null };
}

async function enterProduct(): Promise<ProductInfo> {
  console.log(chalk.bold.cyan("\n📝 NHẬP SẢN PHẨM MỚI\n"));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "📦 Tên sản phẩm:",
      validate: (input: string) =>
        input.trim().length > 0 ? true : "Vui lòng nhập tên sản phẩm",
    },
    {
      type: "input",
      name: "price",
      message: "💰 Giá (VD: 299.000đ, để trống nếu không có):",
      default: "",
    },
    {
      type: "input",
      name: "rating",
      message: "⭐ Đánh giá (VD: 4.8/5 - 1.2k, để trống nếu không có):",
      default: "",
    },
    {
      type: "input",
      name: "sold",
      message: "🔥 Đã bán (VD: 10k+, để trống nếu không có):",
      default: "",
    },
    {
      type: "input",
      name: "description",
      message: "📝 Mô tả sản phẩm:",
      validate: (input: string) =>
        input.trim().length > 0 ? true : "Vui lòng nhập mô tả sản phẩm",
    },
  ]);

  const product: ProductInfo = {
    name: answers.name,
    price: answers.price || "Chưa có",
    rating: answers.rating || "Chưa có",
    sold: answers.sold || "Chưa có",
    description: answers.description,
  };

  await saveProduct(product);
  console.log(
    chalk.green(`\n💾 Đã lưu sản phẩm "${product.name}" để dùng lại!\n`),
  );

  return product;
}

// ── Platform Select ──

async function selectPlatform(): Promise<Platform> {
  const { platform } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "platform",
      message: "🎯 Chọn nền tảng:",
      choices: [
        { name: "📱  TikTok", value: "tiktok" },
        { name: "▶️  YouTube Shorts", value: "youtube" },
        { name: "📘  Facebook Reels", value: "facebook_reels" },
        { name: "📸  Instagram Reels", value: "instagram_reels" },
        { name: "📢  Facebook Ads (Bài viết)", value: "facebook_ads" },
      ],
    },
  ]);
  return platform as Platform;
}

// ── Validation + Retry ──

async function generateWithRetry<T>(
  generator: () => Promise<T>,
  validator: (result: T) => { isValid: boolean; issues: string[] },
  maxRetries: number = 2,
): Promise<T> {
  let result = await generator();
  let validation = validator(result);

  if (validation.isValid) return result;

  for (let i = 0; i < maxRetries; i++) {
    console.log(
      chalk.yellow(
        `\n⚠️  Output chưa đạt chuẩn (${validation.issues.join(", ")}) — đang tạo lại lần ${i + 2}/${maxRetries + 1}...\n`,
      ),
    );

    result = await generator();
    validation = validator(result);

    if (validation.isValid) return result;
  }

  console.log(
    chalk.yellow(
      `\n⚠️  Output sau ${maxRetries + 1} lần vẫn chưa đạt chuẩn, nhưng vẫn hiển thị:\n`,
    ),
  );
  console.log(chalk.gray(`   Lỗi: ${validation.issues.join(" | ")}\n`));

  return result;
}

// ── Edit Helper ──

async function editText(currentText: string, label: string): Promise<string> {
  const { edit } = await inquirer.prompt([
    {
      type: "editor",
      name: "edit",
      message: `✏️  Chỉnh sửa ${label} (mở editor, Ctrl+D hoặc Esc để thoát):`,
      default: currentText,
    },
  ]);

  return edit || currentText;
}

// ── Script Context Selector ──

interface ScriptContextResult {
  source: "selected" | "manual" | "ai-generated";
  text: string;
  scriptId: string | null;
}

async function selectScriptContext(
  productId?: string | null,
): Promise<ScriptContextResult> {
  const { contextSource } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "contextSource",
      message: "📝 Ngữ cảnh cho caption:",
      choices: [
        ...(productId
          ? [
              {
                name: "📋 Chọn script đã lưu (của sản phẩm này)",
                value: "this-product",
              },
            ]
          : []),
        {
          name: "📋 Chọn script đã lưu (tất cả scripts)",
          value: "all-scripts",
        },
        { name: "✏️ Tự nhập tóm tắt", value: "manual" },
        { name: "🤖 AI tự tạo kịch bản nhanh", value: "ai-gen" },
      ],
    },
  ]);

  // Option 1: Scripts of current product
  if (contextSource === "this-product" && productId) {
    const scripts = await getVideoScripts(50);
    const productScripts = scripts.filter((s) => s.productId === productId);

    if (productScripts.length === 0) {
      console.log(chalk.yellow("\n📭 Chưa có script nào cho sản phẩm này.\n"));
      return selectScriptContext(productId);
    }

    return pickScriptFromList(productScripts, "của sản phẩm này");
  }

  // Option 2: All scripts
  if (contextSource === "all-script") {
    const scripts = await getVideoScripts(50);

    if (scripts.length === 0) {
      console.log(chalk.yellow("\n📭 Chưa có script nào được lưu.\n"));
      return selectScriptContext(productId);
    }

    return pickScriptFromList(scripts, "tất cả");
  }

  // Option 3: Manual input
  if (contextSource === "manual") {
    const { manualText } = await inquirer.prompt([
      {
        type: "input",
        name: "manualText",
        message: "✏️ Nhập tóm tắt nội dung video:",
        validate: (input: string) =>
          input.trim().length > 0 ? true : "Vui lòng nhập tóm tắt",
      },
    ]);
    return { source: "manual", text: manualText.trim(), scriptId: null };
  }

  // Option 4: AI generate
  return { source: "ai-generated", text: "", scriptId: null };
}

async function pickScriptFromList(
  scripts: SavedVideoScript[],
  label: string,
): Promise<ScriptContextResult> {
  const choices = scripts.slice(0, 15).map((s, i) => {
    const hookPreview =
      s.hook.length > 50 ? s.hook.substring(0, 50) + "..." : s.hook;
    const bodyPreview =
      s.body.length > 60 ? s.body.substring(0, 60) + "..." : s.body;
    const date = new Date(s.createdAt).toLocaleDateString("vi-VN");
    return {
      name: `${i + 1}. [${s.platform}] ${s.title} (${date})\n     Hook: "${hookPreview}"`,
      value: s.id,
    };
  });

  choices.push({ name: "⏮️ Quay lại chọn nguồn", value: "back" });

  const { selectedScript } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "selectedScript",
      message: `📋 Chọn script từ danh sách ${label}:`,
      choices,
    },
  ]);

  if (selectedScript === "back") {
    return selectScriptContext();
  }

  const script = scripts.find((s) => s.id === selectedScript);
  if (!script) {
    console.log(chalk.yellow("\n⚠️ Không tìm thấy script.\n"));
    return selectScriptContext();
  }

  console.log(chalk.green(`\n✅ Đã chọn script: "${script.title}"\n`));
  console.log(chalk.gray(`   Hook: "${script.hook}"\n`));
  console.log(
    chalk.gray(`   Body preview: "${script.body.substring(0, 150)}..."\n`),
  );

  return { source: "selected", text: script.body, scriptId: script.id };
}

// ── Post-Action Handler ──

async function handlePostActions(
  type: "script" | "description",
  content: GeneratedContent,
): Promise<"back" | "menu"> {
  while (true) {
    const choices = [
      { name: "📋  Copy vào clipboard", value: "copy" },
      { name: "💾  Xuất ra file txt", value: "export" },
      { name: "✏️  Chỉnh sửa nội dung", value: "edit" },
      { name: "🔄  Tạo lại (regenerate)", value: "regenerate" },
      { name: "⏮️  Quay lại bước trước", value: "back" },
      { name: "⏭️  Về menu chính", value: "menu" },
    ];

    const { action } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "action",
        message: "Làm gì tiếp theo?",
        choices,
      },
    ]);

    if (action === "menu") return "menu";
    if (action === "back") return "back";

    if (action === "copy") {
      const text =
        type === "script"
          ? getScriptText(content.script!)
          : getDescriptionText(content.description!);
      const label = type === "script" ? "kịch bản" : "mô tả";
      await copyToClipboard(text, label);
      continue;
    }

    if (action === "export") {
      const label = type === "script" ? "Kịch bản" : "Mô tả";
      const filepath = exportToTextFile(content, label);
      console.log(chalk.green(`\n💾 Đã xuất ra file: ${filepath}\n`));
      continue;
    }

    if (action === "edit") {
      if (type === "script" && content.script) {
        const { scriptType } = await inquirer.prompt([
          {
            type: "rawlist",
            name: "scriptType",
            message: "Chỉnh sửa phần nào?",
            choices: [
              { name: "📝 Nội dung chính (body)", value: "body" },
              { name: "📢 Voiceover CTA", value: "cta" },
              { name: "🎣 Hook", value: "hook" },
            ],
          },
        ]);

        if (scriptType === "body") {
          content.script.body = await editText(
            content.script.body,
            "nội dung chính",
          );
        } else if (scriptType === "cta") {
          content.script.voiceoverCTA = await editText(
            content.script.voiceoverCTA,
            "Voiceover CTA",
          );
        } else {
          content.script.hook = await editText(content.script.hook, "Hook");
        }

        console.log(chalk.green("\n✅ Đã cập nhật!\n"));
        console.log(formatScriptOutput(content.script));
      } else if (type === "description" && content.description) {
        content.description.caption = await editText(
          content.description.caption,
          "caption",
        );
        console.log(chalk.green("\n✅ Đã cập nhật!\n"));
        console.log(formatDescriptionOutput(content.description));
      }
      continue;
    }

    if (action === "regenerate") {
      if (type === "script") {
        await generateScriptFlow();
      } else if (type === "description") {
        await generateDescriptionFlow();
      }
      return "menu";
    }
  }
}

// ── Workflow Functions ──

async function generateScriptFlow() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   🎬  VIDEO CREATOR - Tạo kịch bản video          ║"),
  );
  console.log(
    chalk.bold.cyan("║       Kịch bản TikTok/YouTube - Chuẩn viral        ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  const { product, productId } = await selectOrEnterProduct();
  const platform = await selectPlatform();

  const agent = new VideoCreatorAgent();

  const script = await generateWithRetry(
    () => agent.generateScript(product, platform),
    (s) => validateScript(s),
  );

  console.log(formatScriptOutput(script));

  // Save to DB after validation passes
  const savedScript = await saveVideoScript(script, productId);
  await saveToHistoryWithRefs(productId, savedScript.id, null, "script");

  const content: GeneratedContent = { product, script };
  const result = await handlePostActions("script", content);
  if (result === "back") {
    await generateScriptFlow();
  }
}

async function generateDescriptionFlow() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   ✍️  MARKETING WRITER - Tạo mô tả bài đăng       ║"),
  );
  console.log(
    chalk.bold.cyan("║       Caption chuẩn SEO - Hashtags trending        ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  const { product, productId } = await selectOrEnterProduct();
  const platform = await selectPlatform();

  // User chọn nguồn context cho caption
  const ctxResult = await selectScriptContext(productId);

  let scriptContext: string;
  let scriptDbId: string | null = null;

  if (ctxResult.source === "ai-generated") {
    // AI tự tạo kịch bản nhanh
    console.log(chalk.yellow("\n🎬 AI đang tự tạo kịch bản video nhanh...\n"));

    const videoCreator = new VideoCreatorAgent();
    const autoScript = await generateWithRetry(
      () => videoCreator.generateScript(product, platform),
      (s) => validateScript(s),
    );

    scriptContext = autoScript.body.substring(0, 200);
    console.log(
      chalk.green(
        "✅ Đã tạo kịch bản nhanh. Đang dùng làm ngữ cảnh cho caption...\n",
      ),
    );
    console.log(chalk.gray(`   Tóm tắt: "${scriptContext}..."\n`));

    // Save script after validation
    const savedScript = await saveVideoScript(autoScript, productId);
    scriptDbId = savedScript.id;
    await saveToHistoryWithRefs(productId, savedScript.id, null, "script");
  } else {
    // Selected từ DB hoặc manual input
    scriptContext = ctxResult.text;
    scriptDbId = ctxResult.scriptId;

    if (ctxResult.source === "selected") {
      console.log(chalk.green("✅ Đang dùng script đã lưu làm ngữ cảnh...\n"));
    }
  }

  console.log(chalk.yellow("\n⚙️ Đang tạo mô tả bài đăng...\n"));

  const agent = new MarketingWriterAgent();

  const description = await generateWithRetry(
    () => agent.generateDescription(product, scriptContext, platform),
    (d) => validateDescription(d),
  );

  console.log(formatDescriptionOutput(description));

  // Save to DB after validation passes
  const savedDesc = await savePostDescription(
    description,
    productId,
    scriptDbId,
  );
  await saveToHistoryWithRefs(productId, null, savedDesc.id, "description");

  // Append to export file
  const exportPath = appendPostDescription(product.name, {
    headline: description.headline,
    content: description.content,
    offer: description.offer,
    cta: description.cta,
    hashtags: description.hashtags,
    wordCount: description.wordCount,
  });
  console.log(chalk.gray(`📄 Đã cập nhật file export: ${exportPath}\n`));

  const content: GeneratedContent = { product, description };
  const result = await handlePostActions("description", content);
  if (result === "back") {
    await generateDescriptionFlow();
  }
}

// ── Image Brief Flow ──

async function generateImageBriefFlow() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   🎨  IMAGE CREATOR - Creative brief ảnh ads      ║"),
  );
  console.log(
    chalk.bold.cyan("║       Tạo prompt cho AI Image Generator            ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  const { product, productId } = await selectOrEnterProduct();

  const { adPlatform } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "adPlatform",
      message: "📱 Nền tảng quảng cáo:",
      choices: [
        { name: "📘 Facebook / Instagram", value: "facebook" },
        { name: "🎵 TikTok", value: "tiktok" },
        { name: "🛒 Shopee", value: "shopee" },
        { name: "🛍️ Lazada", value: "lazada" },
      ],
    },
  ]);

  const { aspectRatio } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "aspectRatio",
      message: "📐 Tỷ lệ ảnh:",
      choices: [
        { name: "1:1 — Vuông (Feed, Shopee)", value: "1:1" },
        { name: "9:16 — Dọc (Stories, Reels, TikTok)", value: "9:16" },
        { name: "16:9 — Ngang (YouTube, Banner)", value: "16:9" },
      ],
      default: "1:1",
    },
  ]);

  const input: ImagePromptInput = {
    name: product.name,
    category: "Đa ngành hàng",
    adPlatform: adPlatform,
    aspectRatio: aspectRatio,
    mainMessage: product.description.substring(0, 200),
    price: product.price,
  };

  const agent = new ImageCreatorAgent();
  const brief = await agent.generateBrief(input);
  agent.displayBrief(brief);

  // Save image brief to DB
  const briefToSave = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    productId,
    adPlatform: input.adPlatform,
    aspectRatio: input.aspectRatio,
    adFormat: brief.adFormat,
    visualStyle: brief.visualStyle,
    colorPalette: brief.colorPalette,
    promptSafe: brief.prompts.safe,
    promptBold: brief.prompts.bold,
    promptLifestyle: brief.prompts.lifestyle,
    negativePrompt: brief.negativePrompt,
    shootingNotes: brief.shootingNotes,
    createdAt: new Date().toISOString(),
  };
  await saveImageBrief(briefToSave);
  await saveToHistoryWithRefs(productId, null, null, "image_brief");
  console.log(chalk.green("💾 Đã lưu image brief vào database!\n"));

  // Auto-export to file
  const exportPath = exportImageBrief(
    product.name,
    { price: product.price, rating: product.rating, sold: product.sold },
    brief,
    adPlatform,
    aspectRatio,
  );
  console.log(chalk.gray(`📄 Đã xuất file: ${exportPath}\n`));

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "action",
        message: "Làm gì tiếp theo?",
        choices: [
          { name: "📋  Copy prompts vào clipboard", value: "copy" },
          { name: "💾  Xuất brief ra file txt", value: "export" },
          { name: "🔄  Tạo lại brief khác", value: "regenerate" },
          { name: "⏭️  Về menu chính", value: "menu" },
        ],
      },
    ]);

    if (action === "menu") return;

    if (action === "copy") {
      const text = `IMAGE BRIEF — ${product.name}
Format: ${brief.adFormat} | Platform: ${adPlatform} | Ratio: ${aspectRatio}

🎨 Visual: ${brief.visualStyle}
🎨 Colors: ${brief.colorPalette.join(", ")}

📝 SAFE:
${brief.prompts.safe}

📝 BOLD:
${brief.prompts.bold}

📝 LIFESTYLE:
${brief.prompts.lifestyle}

🚫 Negative: ${brief.negativePrompt}
📸 Notes: ${brief.shootingNotes}`;
      await copyToClipboard(text, "image brief");
      continue;
    }

    if (action === "export") {
      const filepath = exportToTextFile(
        { product, brief } as any,
        `Image Brief — ${product.name}`,
      );
      console.log(chalk.green(`\n💾 Đã xuất file: ${filepath}\n`));
      continue;
    }

    if (action === "regenerate") {
      await generateImageBriefFlow();
      return;
    }
  }
}

// ── Short Video Prompt Flow ──

async function generateShortVideoFlow() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   🎬  SHORT CREATOR - Video Prompt cho AI Veo      ║"),
  );
  console.log(
    chalk.bold.cyan("║       Tạo mô tả video chi tiết từ kịch bản         ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  const { product, productId } = await selectOrEnterProduct();
  const platform = await selectPlatform();

  // Get visual cues from existing script or enter manually
  const { source } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "source",
      message: "📋 Nguồn cảnh quay:",
      choices: [
        {
          name: "🎬 Lấy từ script đã lưu của sản phẩm này",
          value: "from-script",
        },
        { name: "✏️ Nhập thủ công", value: "manual" },
      ],
    },
  ]);

  let visualCues: string[] = [];
  let angle = "product-showcase";
  let scriptDbId: string | null = null;

  if (source === "from-script") {
    const scripts = await getVideoScriptsByProductId(productId!, 10);
    if (scripts.length === 0) {
      console.log(chalk.yellow("\n📭 Chưa có script nào cho sản phẩm này.\n"));
      return;
    }

    const scriptChoices = scripts.map((s) => ({
      name: `[${s.platform}] ${s.title}`,
      value: s.id,
    }));

    const { selectedScript } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "selectedScript",
        message: "🎬 Chọn script:",
        choices: scriptChoices,
      },
    ]);

    const script = await getVideoScriptById(selectedScript);
    if (script) {
      visualCues = script.body.split("\n").filter((l) => l.trim().length > 0);
      angle = script.title.split(":")[0] || "product-showcase";
      scriptDbId = selectedScript;
    }
  } else {
    const { cues } = await inquirer.prompt([
      {
        type: "input",
        name: "cues",
        message: "🎬 Nhập cảnh quay (cách nhau bởi dấu |):",
        validate: (input: string) =>
          input.trim().length > 0 ? true : "Vui lòng nhập ít nhất 1 cảnh",
      },
    ]);
    visualCues = cues
      .split("|")
      .map((c: string) => c.trim())
      .filter(Boolean);
  }

  // Get angle
  const { selectedAngle } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "selectedAngle",
      message: "💡 Góc tiếp cận:",
      choices: [
        { name: "Pain point — Đánh vào nỗi đau", value: "pain-point" },
        { name: "Price shock — Giá bất ngờ", value: "price-shock" },
        { name: "Social proof — Bằng chứng xã hội", value: "social-proof" },
        { name: "Curiosity — Gây tò mò", value: "curiosity" },
        {
          name: "Product showcase — Trưng bày sản phẩm",
          value: "product-showcase",
        },
      ],
    },
  ]);
  angle = selectedAngle;

  // Generate prompt
  const agent = new ShortCreatorAgent();
  const prompt = await agent.generatePrompt(
    product.name,
    visualCues,
    angle,
    platform,
  );
  agent.displayPrompt(prompt);

  // Save to DB
  await saveShortVideoPrompt(prompt, productId, scriptDbId);
  await saveToHistoryWithRefs(productId, scriptDbId, null, "short_video");
  console.log(chalk.green("💾 Đã lưu video prompt vào database!\n"));

  // Post-actions
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "action",
        message: "Làm gì tiếp theo?",
        choices: [
          { name: "📋  Copy prompt vào clipboard", value: "copy" },
          { name: "🔄  Tạo lại prompt khác", value: "regenerate" },
          { name: "⏭️  Về menu chính", value: "menu" },
        ],
      },
    ]);

    if (action === "menu") return;

    if (action === "copy") {
      const text = `VIDEO PROMPT (${prompt.aspectRatio}, ${prompt.visualQuality})\n\nStyle: ${prompt.styleAnalysis}\n\n${prompt.videoPrompt}`;
      await copyToClipboard(text, "video prompt");
      continue;
    }

    if (action === "regenerate") {
      await generateShortVideoFlow();
      return;
    }
  }
}

// ── History Viewer (Product-centric) ──

async function viewHistory() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   📜  HISTORY - Lịch sử nội dung đã tạo           ║"),
  );
  console.log(
    chalk.bold.cyan("║       Xem theo sản phẩm → Chi tiết nội dung       ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  // Step 1: Show products with content count
  const products = await getProducts();

  if (products.length === 0) {
    console.log(chalk.yellow("\n📭 Chưa có sản phẩm nào.\n"));
    return;
  }

  const productChoices = products.slice(0, 15).map((p, i) => {
    const counts: string[] = [];
    if (p.usageCount > 0) counts.push(`${p.usageCount}x nội dung`);
    return {
      name: `${i + 1}. ${p.name} | ${p.price} | ${counts.join(", ") || "Chưa có nội dung"}`,
      value: p.id,
    };
  });

  productChoices.push({ name: "─".repeat(50), value: "sep" });
  productChoices.push({ name: "🗑️  Xóa TOÀN BỘ lịch sử", value: "clearAll" });
  productChoices.push({ name: "❌  Quay lại", value: "back" });

  const { selectedProduct } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "selectedProduct",
      message: "📦 Chọn sản phẩm để xem nội dung:",
      choices: productChoices,
    },
  ]);

  if (selectedProduct === "back") return;

  if (selectedProduct === "clearAll") {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `⚠️  Xác nhận xóa TOÀN BỘ lịch sử? (Không thể hoàn tác)`,
        default: false,
      },
    ]);
    if (confirm) {
      await clearHistory();
      console.log(chalk.green("\n🗑️  Đã xóa toàn bộ lịch sử\n"));
    }
    return;
  }

  // Step 2: Load all content for this product
  const product = products.find((p) => p.id === selectedProduct);
  if (!product) return;

  console.log(chalk.bold.cyan(`\n📦 ${product.name}\n`));
  console.log(
    chalk.gray(
      `   💰 Giá: ${product.price} | ⭐ ${product.rating} | 🔥 Đã bán: ${product.sold}\n`,
    ),
  );

  // Fetch scripts, descriptions, image briefs
  const scripts = await getVideoScriptsByProductId(product.id, 20);
  const descriptions = await getPostDescriptionsByProductId(product.id, 20);
  const imageBriefs = await getImageBriefs(50);
  const productImageBriefs = imageBriefs.filter(
    (ib) => ib.productId === product.id,
  );

  if (
    scripts.length === 0 &&
    descriptions.length === 0 &&
    productImageBriefs.length === 0
  ) {
    console.log(chalk.yellow("  📭 Chưa có nội dung nào cho sản phẩm này.\n"));
    console.log(
      chalk.gray("  💡 Mẹo: Hãy tạo nội dung trước để xem ở đây nhé!\n"),
    );
    return;
  }

  // Step 3: Show content options grouped by type
  const contentChoices: any[] = [];

  if (scripts.length > 0) {
    contentChoices.push(new inquirer.Separator(" 🎬 KỊCH BẢN VIDEO "));
    scripts.slice(0, 10).forEach((s, i) => {
      const date = new Date(s.createdAt).toLocaleDateString("vi-VN");
      contentChoices.push({
        name: `  ${i + 1}. [${s.platform}] ${s.title} (${date})`,
        value: `script_${s.id}`,
      });
    });
  }

  if (descriptions.length > 0) {
    contentChoices.push(new inquirer.Separator(" ✍️ POST DESCRIPTION "));
    descriptions.slice(0, 10).forEach((d, i) => {
      const date = new Date(d.createdAt).toLocaleDateString("vi-VN");
      const hashTagCount = d.hashtags.length;
      contentChoices.push({
        name: `  ${i + 1}. [${d.platform}] ${d.headline || d.caption.substring(0, 40)}... (${date}) - ${hashTagCount} hashtags`,
        value: `desc_${d.id}`,
      });
    });
  }

  if (productImageBriefs.length > 0) {
    contentChoices.push(new inquirer.Separator(" 🎨 IMAGE BRIEF "));
    productImageBriefs.slice(0, 10).forEach((ib, i) => {
      const date = new Date(ib.createdAt).toLocaleDateString("vi-VN");
      contentChoices.push({
        name: `  ${i + 1}. [${ib.adPlatform}] ${ib.aspectRatio} (${date})`,
        value: `brief_${ib.id}`,
      });
    });
  }

  contentChoices.push({ name: "─".repeat(50), value: "sep" });
  contentChoices.push({
    name: "🔄  Tạo nội dung mới cho sản phẩm này",
    value: "regenerate",
  });
  contentChoices.push({
    name: "⏮️  Quay lại danh sách sản phẩm",
    value: "back",
  });

  const { selectedContent } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "selectedContent",
      message: "📋 Chọn nội dung để xem chi tiết:",
      choices: contentChoices,
    },
  ]);

  if (selectedContent === "back") {
    await viewHistory();
    return;
  }

  if (selectedContent === "regenerate") {
    const { workflowType } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "workflowType",
        message: "Tạo nội dung gì?",
        choices: [
          { name: "🎬  Kịch bản video", value: "script" },
          { name: "✍️  Caption bài đăng", value: "description" },
          { name: "🎨  Brief ảnh ads", value: "imagebrief" },
          { name: "⏮️  Quay lại", value: "back" },
        ],
      },
    ]);

    if (workflowType === "script") await generateScriptFlow();
    else if (workflowType === "description") await generateDescriptionFlow();
    else if (workflowType === "imagebrief") await generateImageBriefFlow();
    return;
  }

  // Step 4: Show selected content detail
  if (selectedContent.startsWith("script_")) {
    const scriptId = selectedContent.replace("script_", "");
    const script = await getVideoScriptById(scriptId);
    if (script) {
      console.log(
        formatScriptOutput({
          platform: script.platform,
          title: script.title,
          hook: script.hook,
          body: script.body,
          voiceoverCTA: script.voiceoverCta,
          wordCount: script.wordCount,
          estimatedDuration: script.estimatedDuration,
        }),
      );

      const { action } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "action",
          message: "Làm gì tiếp theo?",
          choices: [
            { name: "📋  Copy vào clipboard", value: "copy" },
            { name: "💾  Xuất ra file txt", value: "export" },
            { name: "⏮️  Quay lại", value: "back" },
          ],
        },
      ]);

      if (action === "copy") {
        const text = `[${script.title}]\nHook: ${script.hook}\n${script.body}\nCTA: ${script.voiceoverCta}`;
        await copyToClipboard(text, "script");
      } else if (action === "export") {
        const filepath = exportToTextFile(
          {
            product: {
              name: product.name,
              price: product.price,
              rating: product.rating,
              sold: product.sold,
              description: product.description,
            },
            script: {
              platform: script.platform,
              title: script.title,
              hook: script.hook,
              body: script.body,
              voiceoverCTA: script.voiceoverCta,
              wordCount: script.wordCount,
              estimatedDuration: script.estimatedDuration,
            },
          },
          `Script - ${product.name}`,
        );
        console.log(chalk.green(`\n💾 Đã xuất file: ${filepath}\n`));
      }
    }
  } else if (selectedContent.startsWith("desc_")) {
    const descId = selectedContent.replace("desc_", "");
    const desc = await getPostDescriptionById(descId);
    if (desc) {
      console.log(
        formatDescriptionOutput({
          platform: desc.platform,
          headline: desc.headline,
          content: desc.content,
          offer: desc.offer,
          cta: desc.cta,
          hashtags: desc.hashtags,
          caption: desc.caption,
          wordCount: desc.wordCount,
        }),
      );

      const { action } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "action",
          message: "Làm gì tiếp theo?",
          choices: [
            { name: "📋  Copy vào clipboard", value: "copy" },
            { name: "💾  Xuất ra file txt", value: "export" },
            { name: "⏮️  Quay lại", value: "back" },
          ],
        },
      ]);

      if (action === "copy") {
        await copyToClipboard(desc.caption, "caption");
      } else if (action === "export") {
        const filepath = exportToTextFile(
          {
            product: {
              name: product.name,
              price: product.price,
              rating: product.rating,
              sold: product.sold,
              description: product.description,
            },
            description: {
              platform: desc.platform,
              headline: desc.headline || "",
              content: desc.content || "",
              offer: desc.offer || "",
              caption: desc.caption,
              hashtags: desc.hashtags,
              cta: desc.cta,
              wordCount: desc.wordCount,
            },
          },
          `Caption - ${product.name}`,
        );
        console.log(chalk.green(`\n💾 Đã xuất file: ${filepath}\n`));
      }
    }
  } else if (selectedContent.startsWith("brief_")) {
    const briefId = selectedContent.replace("brief_", "");
    const brief = await getImageBriefById(briefId);
    if (brief) {
      console.log(chalk.bold.cyan("\n📸 CREATIVE BRIEF\n"));
      console.log(
        chalk.bold(
          `Format: ${brief.adFormat} | Platform: ${brief.adPlatform} | Ratio: ${brief.aspectRatio}`,
        ),
      );
      console.log(chalk.bold(`Visual: ${brief.visualStyle}`));
      console.log(chalk.bold(`Colors: ${brief.colorPalette.join(", ")}`));
      console.log(chalk.green("\n📝 SAFE:\n") + brief.promptSafe);
      console.log(chalk.yellow("\n📝 BOLD:\n") + brief.promptBold);
      console.log(chalk.cyan("\n📝 LIFESTYLE:\n") + brief.promptLifestyle);
      console.log(chalk.red("\n🚫 Negative:\n") + brief.negativePrompt);
      console.log(chalk.gray("\n📸 Notes:\n") + brief.shootingNotes);

      const { action } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "action",
          message: "Làm gì tiếp theo?",
          choices: [
            { name: "📋  Copy prompts vào clipboard", value: "copy" },
            { name: "💾  Xuất ra file txt", value: "export" },
            { name: "⏮️  Quay lại", value: "back" },
          ],
        },
      ]);

      if (action === "copy") {
        const text = `IMAGE BRIEF\nFormat: ${brief.adFormat} | Platform: ${brief.adPlatform}\nVisual: ${brief.visualStyle}\nColors: ${brief.colorPalette.join(", ")}\n\nSAFE:\n${brief.promptSafe}\n\nBOLD:\n${brief.promptBold}\n\nLIFESTYLE:\n${brief.promptLifestyle}\n\nNegative: ${brief.negativePrompt}\nNotes: ${brief.shootingNotes}`;
        await copyToClipboard(text, "image brief");
      } else if (action === "export") {
        const filepath = exportImageBrief(
          product.name,
          { price: product.price, rating: product.rating, sold: product.sold },
          {
            adFormat: brief.adFormat,
            visualStyle: brief.visualStyle,
            colorPalette: brief.colorPalette,
            prompts: {
              safe: brief.promptSafe,
              bold: brief.promptBold,
              lifestyle: brief.promptLifestyle,
            },
            negativePrompt: brief.negativePrompt,
            shootingNotes: brief.shootingNotes,
          },
          brief.adPlatform,
          brief.aspectRatio,
        );
        console.log(chalk.green(`\n💾 Đã xuất file: ${filepath}\n`));
      }
    }
  }
}

// ── Manage Products ──

async function manageProducts() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   📦  PRODUCTS - Quản lý sản phẩm đã lưu          ║"),
  );
  console.log(
    chalk.bold.cyan("║       Xem, xóa & tái sử dụng sản phẩm              ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  const products = await getProducts();

  if (products.length === 0) {
    console.log(chalk.yellow("\n📦 Chưa có sản phẩm nào được lưu.\n"));
    console.log(
      chalk.gray("💡 Mẹo: Nhập sản phẩm khi tạo nội dung để lưu tự động!\n"),
    );
    return;
  }

  const choices = products.map((p, i) => ({
    name: `${i + 1}. ${p.name} | 💰 ${p.price} | 🔥 Đã dùng ${p.usageCount} lần`,
    value: p.id,
  }));

  choices.push({ name: "─".repeat(40), value: "sep" });
  choices.push({ name: "🗑️  Xóa TOÀN BỘ sản phẩm", value: "deleteAll" });
  choices.push({ name: "❌  Quay lại", value: "back" });

  const { selected } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "selected",
      message: "📦 Quản lý sản phẩm đã lưu:",
      choices,
    },
  ]);

  if (selected === "back") return;

  if (selected === "deleteAll") {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `⚠️  Xác nhận xóa TOÀN BỘ ${products.length} sản phẩm? (Không thể hoàn tác)`,
        default: false,
      },
    ]);
    if (confirm) {
      const count = await deleteAllProducts();
      console.log(chalk.green(`\n🗑️  Đã xóa ${count} sản phẩm\n`));
    }
    return;
  }

  const product = products.find((p) => p.id === selected);
  if (!product) return;

  console.log(chalk.bold.cyan(`\n📦 ${product.name}\n`));
  console.log(chalk.white(`   💰 Giá: ${product.price}`));
  console.log(chalk.white(`   ⭐ Đánh giá: ${product.rating}`));
  console.log(chalk.white(`   🔥 Đã bán: ${product.sold}`));
  console.log(chalk.white(`   📝 Mô tả: ${product.description}`));
  console.log(chalk.gray(`   📊 Đã dùng: ${product.usageCount} lần\n`));

  const { action } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "action",
      message: "Làm gì tiếp theo?",
      choices: [
        { name: "🗑️  Xóa sản phẩm này", value: "delete" },
        { name: "⏮️  Quay lại danh sách", value: "back" },
        { name: "⏭️  Về menu chính", value: "menu" },
      ],
    },
  ]);

  if (action === "menu") return;
  if (action === "back") {
    await manageProducts();
    return;
  }

  if (action === "delete") {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Xác nhận xóa "${product.name}"?`,
        default: false,
      },
    ]);

    if (confirm) {
      await deleteProduct(product.id);
      console.log(chalk.green(`\n🗑️  Đã xóa "${product.name}"\n`));
    }
  }
}

// ── TTS Voice Generation ──

async function generateTTSFromScript() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   🎤  TTS VOICE - Chuyển kịch bản thành giọng nói  ║"),
  );
  console.log(
    chalk.bold.cyan("║       Google Text-to-Speech (Tiếng Việt)           ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  // Get script: either from history or generate new
  const history = await getHistory();
  const scriptsOnly = history.filter(
    (h: HistoryEntry) => h.content.script && h.content.script.body.length > 0,
  );

  let scriptContent: VideoScript | undefined;

  if (scriptsOnly.length > 0) {
    const { source } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "source",
        message: "📜 Chọn kịch bản:",
        choices: [
          ...scriptsOnly.slice(0, 5).map((h: HistoryEntry, i: number) => ({
            name: `${i + 1}. ${h.product.name} (${new Date(h.createdAt).toLocaleString("vi-VN")})`,
            value: h.id,
          })),
          { name: "🆕  Tạo kịch bản mới", value: "new" },
        ],
      },
    ]);

    if (source === "new") {
      console.log(chalk.yellow("\n🎬 Tạo kịch bản mới trước...\n"));
      const { product, productId } = await selectOrEnterProduct();
      const plat = await selectPlatform();

      const agent = new VideoCreatorAgent();
      const script = await generateWithRetry(
        () => agent.generateScript(product, plat),
        (s) => validateScript(s),
      );

      console.log(formatScriptOutput(script));
      scriptContent = script;

      await saveToHistoryWithRefs(
        productId,
        (await saveVideoScript(script, productId)).id,
        null,
        "script",
      );
    } else {
      const entry = scriptsOnly.find((h: HistoryEntry) => h.id === source);
      if (!entry) return;
      scriptContent = entry.content.script!;
    }
  } else {
    console.log(chalk.yellow("\n📭 Chưa có kịch bản nào. Tạo mới...\n"));
    const { product, productId } = await selectOrEnterProduct();
    const plat = await selectPlatform();

    const agent = new VideoCreatorAgent();
    const script = await generateWithRetry(
      () => agent.generateScript(product, plat),
      (s) => validateScript(s),
    );

    console.log(formatScriptOutput(script));
    scriptContent = script;

    await saveToHistoryWithRefs(
      productId,
      (await saveVideoScript(script, productId)).id,
      null,
      "script",
    );
  }

  if (!scriptContent) return;

  const tts = new TTSService();

  console.log(chalk.yellow("\n🎤 Đang tạo giọng nói AI (Google TTS)...\n"));

  const { audioPath, duration } = await tts.textToSpeech(scriptContent.body);

  console.log(chalk.green(`\n💾 File voice đã tạo: ${audioPath}`));
  console.log(chalk.cyan(`📊 Thời lượng: ~${Math.round(duration)} giây\n`));

  // Post-actions
  const { action } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "action",
      message: "Làm gì tiếp theo?",
      choices: [
        { name: "▶️  Mở file voice vừa tạo", value: "open" },
        { name: "🔄  Tạo voice từ script khác", value: "again" },
        { name: "⏭️  Quay lại menu chính", value: "menu" },
      ],
    },
  ]);

  if (action === "open") {
    const { exec } = require("child_process");
    exec(`open "${audioPath}"`);
  } else if (action === "again") {
    await generateTTSFromScript();
  }
}

// ── Trend Scan Flow ──

async function generateTrendScanFlow() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   🔍  TREND RESEARCHER - Nghiên cứu xu hướng      ║"),
  );
  console.log(
    chalk.bold.cyan("║       Tìm sản phẩm HOT - Phân tích ngách thị trường  ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  // Ask user: auto or pick niche
  const { mode } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "mode",
      message: "🎯 Chọn chế độ scan:",
      choices: [
        { name: "🤖  Tự động hoàn toàn (AI chọn niche)", value: "auto" },
        { name: "🎯  Chọn niche cụ thể", value: "manual" },
      ],
    },
  ]);

  let niche = undefined;
  if (mode === "manual") {
    const { selectedNiche } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "selectedNiche",
        message: "📂 Chọn ngách:",
        choices: NICHES.map((n) => ({
          name: `${n.name}`,
          value: n.id,
        })),
      },
    ]);
    niche = getNicheById(selectedNiche);
  }

  const scanner = new AutonomousTrendScanner();
  const { brief, product } = await scanner.scanAndGenerate(niche);

  // Save product + trend brief to DB
  const savedProduct = await saveProduct(product);
  await saveTrendBrief(brief, savedProduct.id);
  console.log(chalk.green(`\n💾 Đã lưu sản phẩm và trend brief!\n`));

  // Post-actions: hỏi user muốn làm gì tiếp
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "action",
        message: "Làm gì tiếp theo?",
        choices: [
          { name: "🎬  Tạo kịch bản video từ sản phẩm này", value: "script" },
          { name: "✍️  Tạo mô tả bài đăng", value: "description" },
          { name: "🔍  Scan niche khác", value: "rescan" },
          { name: "⏭️  Quay lại menu chính", value: "menu" },
        ],
      },
    ]);

    if (action === "menu") return;

    if (action === "rescan") {
      await generateTrendScanFlow();
      return;
    }

    if (action === "script") {
      const platform = await selectPlatform();
      console.log(
        chalk.yellow("\n⚙️ Đang tạo kịch bản video từ sản phẩm trend...\n"),
      );

      // Get product ID
      const allProducts = await getProducts();
      const foundProduct = allProducts.find((p) => p.name === product.name);
      const productId = foundProduct ? foundProduct.id : null;

      const videoCreator = new VideoCreatorAgent();
      const script = await generateWithRetry(
        () => videoCreator.generateScript(product, platform),
        (s) => validateScript(s),
      );

      console.log(formatScriptOutput(script));

      // Save after validation
      const savedScript = await saveVideoScript(script, productId);
      await saveToHistoryWithRefs(productId, savedScript.id, null, "script");

      const content: GeneratedContent = { product, script };
      const result = await handlePostActions("script", content);
      if (result === "back") continue;
      return;
    }

    if (action === "description") {
      const platform = await selectPlatform();

      // Get product ID first
      const allProducts = await getProducts();
      const foundProduct = allProducts.find((p) => p.name === product.name);
      const trendProductId = foundProduct ? foundProduct.id : null;

      // User chọn nguồn context cho caption
      const ctxResult = await selectScriptContext(trendProductId);

      let scriptContext: string;
      let scriptDbId: string | null = null;

      if (ctxResult.source === "ai-generated") {
        console.log(
          chalk.yellow("\n🎬 AI đang tự tạo kịch bản video nhanh...\n"),
        );

        const videoCreator = new VideoCreatorAgent();
        const autoScript = await generateWithRetry(
          () => videoCreator.generateScript(product, platform),
          (s) => validateScript(s),
        );

        scriptContext = autoScript.body.substring(0, 200);
        console.log(
          chalk.green(
            "✅ Đã tạo kịch bản nhanh. Đang dùng làm ngữ cảnh cho caption...\n",
          ),
        );
        console.log(chalk.gray(`   Tóm tắt: "${scriptContext}..."\n`));

        // Save script after validation
        const savedScript = await saveVideoScript(autoScript, trendProductId);
        scriptDbId = savedScript.id;
        await saveToHistoryWithRefs(
          trendProductId,
          savedScript.id,
          null,
          "script",
        );
      } else {
        scriptContext = ctxResult.text;
        scriptDbId = ctxResult.scriptId;

        if (ctxResult.source === "selected") {
          console.log(
            chalk.green("✅ Đang dùng script đã lưu làm ngữ cảnh...\n"),
          );
        }
      }

      console.log(chalk.yellow("\n⚙️ Đang tạo mô tả bài đăng...\n"));

      const marketingWriter = new MarketingWriterAgent();
      const description = await generateWithRetry(
        () =>
          marketingWriter.generateDescription(product, scriptContext, platform),
        (d) => validateDescription(d),
      );

      console.log(formatDescriptionOutput(description));

      // Save after validation
      const savedDesc = await savePostDescription(
        description,
        trendProductId,
        scriptDbId,
      );
      await saveToHistoryWithRefs(
        trendProductId,
        null,
        savedDesc.id,
        "description",
      );

      // Append to export file
      const exportPath = appendPostDescription(product.name, {
        headline: description.headline,
        content: description.content,
        offer: description.offer,
        cta: description.cta,
        hashtags: description.hashtags,
        wordCount: description.wordCount,
      });
      console.log(chalk.gray(`📄 Đã cập nhật file export: ${exportPath}\n`));

      const content: GeneratedContent = { product, description };
      const result = await handlePostActions("description", content);
      if (result === "back") continue;
      return;
    }
  }
}

// ── Usage Stats ──

async function viewUsage() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   📊  USAGE STATS - Thống kê sử dụng AI          ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  const stats = getUsage();

  console.log(chalk.bold(`📈 Tổng số lần gọi AI: ${stats.totalCalls}`));
  console.log(
    chalk.gray(
      `   Lần cuối reset: ${new Date(stats.lastReset).toLocaleString("vi-VN")}\n`,
    ),
  );

  console.log(chalk.bold("\n📡 Theo provider:"));
  for (const [provider, count] of Object.entries(stats.byProvider)) {
    if (count > 0) {
      console.log(
        `   ${provider === "ollama" ? "🟢" : "🔵"} ${provider}: ${count} lần`,
      );
    }
  }

  console.log(chalk.bold("\n🔧 Theo chức năng:"));
  const featureLabels: Record<string, string> = {
    trend_research: "🔍 Trend Research",
    video_script: "🎬 Video Script",
    marketing_caption: "✍️ Marketing Caption",
    image_brief: "🎨 Image Brief",
  };
  for (const [feature, count] of Object.entries(stats.byFeature)) {
    if (count > 0) {
      console.log(`   ${featureLabels[feature] || feature}: ${count} lần`);
    }
  }

  console.log(chalk.cyan("\n" + "─".repeat(50) + "\n"));

  const { action } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "action",
      message: "Làm gì tiếp theo?",
      choices: [
        { name: "🔄  Reset thống kê", value: "reset" },
        { name: "⏭️  Quay lại menu chính", value: "menu" },
      ],
    },
  ]);

  if (action === "reset") {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Xác nhận reset toàn bộ thống kê?",
        default: false,
      },
    ]);
    if (confirm) {
      resetUsage();
      console.log(chalk.green("\n🗑️  Đã reset thống kê\n"));
      await viewUsage();
    }
  }
}

// ── Main Menu ──

async function askMainMenu(): Promise<string> {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║       🤖  AFFILIATE MARKETING BOT - AI POWERED      ║"),
  );
  console.log(
    chalk.bold.cyan("║           Tự động hóa nội dung Affiliate            ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  console.log(chalk.bold.yellow("\n📌 TÍNH NĂNG CHÍNH:\n"));

  const { action } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "action",
      message: "👉 Chọn thao tác bạn muốn thực hiện:",
      choices: [
        new inquirer.Separator(" 🔍 Nghiên cứu & Phân tích xu hướng "),
        {
          name: "[Trend Researcher] - Quét trend, tìm sản phẩm hot theo ngách",
          value: "trendscan",
        },
        new inquirer.Separator(" ✍️ Tạo nội dung với AI "),
        {
          name: "[Video Creator] - Tạo kịch bản video TikTok/YouTube",
          value: "script",
        },
        {
          name: "[Marketing Writer] - Tạo caption & hashtags bài đăng",
          value: "description",
        },
        {
          name: "[Image Creator] - Tạo brief ảnh ads (prompt AI)",
          value: "imagebrief",
        },
        {
          name: "[Short Creator] - Tạo video prompt cho AI Veo",
          value: "short_video",
        },
        new inquirer.Separator(" 🎨 Tiện ích & Quản lý "),
        {
          name: "[TTS Voice] - Chuyển kịch bản thành giọng nói (Google TTS)",
          value: "tts",
        },
        { name: "[History] - Xem & quản lý nội dung đã tạo", value: "history" },
        { name: "[Products] - Xem & quản lý sản phẩm", value: "products" },
        new inquirer.Separator(" ⚙️ Hệ thống "),
        { name: "[System] - Kiểm tra kết nối AI providers", value: "check" },
        { name: "[Usage] - Xem thống kê sử dụng AI", value: "usage" },
        new inquirer.Separator(""),
        { name: "❌  Thoát chương trình", value: "exit" },
      ],
    },
  ]);

  return action;
}

// ── Main Loop ──

async function mainLoop() {
  console.log(
    chalk.bold.magenta("\n👋 Chào mừng bạn đến với Affiliate Marketing Bot!"),
  );
  console.log(chalk.gray("   Công cụ tự động tạo nội dung Affiliate với AI\n"));

  await checkProvidersStatus();

  while (true) {
    const action = await askMainMenu();

    if (action === "exit") {
      console.log(chalk.gray("\n👋 Hẹn gặp lại!\n"));
      process.exit(0);
    }

    if (action === "check") {
      await checkProvidersStatus();
      continue;
    }

    if (action === "usage") {
      await viewUsage();
      continue;
    }

    if (action === "script") {
      await generateScriptFlow();
    } else if (action === "description") {
      await generateDescriptionFlow();
    } else if (action === "trendscan") {
      await generateTrendScanFlow();
    } else if (action === "imagebrief") {
      await generateImageBriefFlow();
    } else if (action === "short_video") {
      await generateShortVideoFlow();
    } else if (action === "tts") {
      await generateTTSFromScript();
    } else if (action === "history") {
      await viewHistory();
    } else if (action === "products") {
      await manageProducts();
    }
  }
}

mainLoop().catch((err) => {
  console.error(chalk.red("\n❌ Lỗi:", err.message));
  process.exit(1);
});

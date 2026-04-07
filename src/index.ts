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
} from "./types/content";
import { VideoCreatorAgent } from "./agents/video-creator";
import { MarketingWriterAgent } from "./agents/marketing-writer";
import { AutonomousTrendScanner } from "./agents/trend-scanner";
import { ImageCreatorAgent } from "./agents/image-creator";
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
  getHistory,
  deleteHistoryEntry,
  clearHistory,
  HistoryEntry,
  deleteProduct,
  exportToTextFile,
} from "./data/storage";
import { TTSService } from "./services/tts-service";
import { NICHES, getNicheById, getRandomNiche } from "./config/niches";
import fs from "fs";

// ── Product Input ──

async function selectOrEnterProduct(): Promise<ProductInfo> {
  const products = await getProducts();

  if (products.length === 0) {
    return await enterProduct();
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
    return await enterProduct();
  }

  const productId = action.replace("use_", "");
  const product = products.find((p) => p.id === productId);

  if (product) {
    console.log(chalk.green(`\n✅ Đã chọn: ${product.name}\n`));
    return {
      name: product.name,
      description: product.description,
      price: product.price,
      rating: product.rating,
      sold: product.sold,
    };
  }

  return await enterProduct();
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
        `\n⚠️  Output chưa đạt chuẩn (${validation.issues.join(", ")})`,
      ),
    );
    console.log(
      chalk.yellow(`🔄 Đang tạo lại lần ${i + 2}/${maxRetries + 1}...\n`),
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

// ── Post-Action Handler ──

async function handlePostActions(
  type: "script" | "description",
  content: GeneratedContent,
) {
  while (true) {
    const choices = [
      { name: "📋  Copy vào clipboard", value: "copy" },
      { name: "💾  Xuất ra file txt", value: "export" },
      { name: "✏️  Chỉnh sửa nội dung", value: "edit" },
      { name: "🔄  Tạo lại (regenerate)", value: "regenerate" },
      { name: "⏭️  Quay lại menu chính", value: "menu" },
    ];

    const { action } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "action",
        message: "Làm gì tiếp theo?",
        choices,
      },
    ]);

    if (action === "menu") return;

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
      return; // regenerate sẽ gọi lại flow, không loop tiếp
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

  const product = await selectOrEnterProduct();
  const platform = await selectPlatform();

  const agent = new VideoCreatorAgent();

  const script = await generateWithRetry(
    () => agent.generateScript(product, platform),
    (s) => validateScript(s),
  );

  console.log(formatScriptOutput(script));

  const content: GeneratedContent = { product, script };
  await saveToHistory(product, content, "script");

  await handlePostActions("script", content);
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

  const product = await selectOrEnterProduct();
  const platform = await selectPlatform();

  const { scriptInput } = await inquirer.prompt([
    {
      type: "input",
      name: "scriptInput",
      message: "📝 Tóm tắt nội dung video (hoặc paste kịch bản):",
      validate: (input: string) =>
        input.trim().length > 0 ? true : "Vui lòng nhập nội dung",
    },
  ]);

  console.log(chalk.yellow("\n⚙️ Đang tạo mô tả bài đăng...\n"));

  const agent = new MarketingWriterAgent();

  const description = await generateWithRetry(
    () => agent.generateDescription(product, scriptInput, platform),
    (d) => validateDescription(d),
  );

  console.log(formatDescriptionOutput(description));

  const content: GeneratedContent = { product, description };
  await saveToHistory(product, content, "description");

  await handlePostActions("description", content);
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

  const product = await selectOrEnterProduct();

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
          { name: "⏭️  Quay lại menu chính", value: "menu" },
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

// ── History Viewer ──

async function viewHistory() {
  console.log(
    chalk.bold.cyan("\n╔══════════════════════════════════════════════════╗"),
  );
  console.log(
    chalk.bold.cyan("║   📜  HISTORY - Lịch sử nội dung đã tạo           ║"),
  );
  console.log(
    chalk.bold.cyan("║       Xem, quản lý & tái sử dụng nội dung          ║"),
  );
  console.log(
    chalk.bold.cyan("╚══════════════════════════════════════════════════╝\n"),
  );

  const history = await getHistory();

  if (history.length === 0) {
    console.log(chalk.yellow("\n📭 Chưa có lịch sử nội dung nào.\n"));
    console.log(
      chalk.gray("💡 Mẹo: Hãy tạo nội dung trước để xem ở đây nhé!\n"),
    );
    return;
  }

  const choices = history.slice(0, 10).map((entry: HistoryEntry, i: number) => {
    const date = new Date(entry.createdAt).toLocaleString("vi-VN");
    const type =
      entry.workflow === "full"
        ? "🚀 Full"
        : entry.workflow === "script"
          ? "🎬 Script"
          : "✍️ Description";
    return {
      name: `${i + 1}. ${type} - ${entry.product.name} (${date})`,
      value: entry.id,
    };
  });

  choices.push({ name: "❌  Quay lại", value: "back" });

  const { selected } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "selected",
      message: "📜 Xem lịch sử (10 gần nhất):",
      choices,
    },
  ]);

  if (selected === "back") return;

  const entry = history.find((h: HistoryEntry) => h.id === selected);
  if (!entry) return;

  console.log(chalk.bold.cyan(`\n📄 ${entry.product.name}\n`));

  if (entry.content.script) {
    console.log(formatScriptOutput(entry.content.script));
  }
  if (entry.content.description) {
    console.log(formatDescriptionOutput(entry.content.description));
  }

  const { action } = await inquirer.prompt([
    {
      type: "rawlist",
      name: "action",
      message: "Làm gì tiếp theo?",
      choices: [
        { name: "📋  Copy vào clipboard", value: "copy" },
        { name: "💾  Xuất ra file txt", value: "export" },
        { name: "🗑️  Xóa entry này", value: "delete" },
        { name: "🔄  Tạo lại với sản phẩm này", value: "regenerate" },
        { name: "⏭️  Quay lại", value: "back" },
      ],
    },
  ]);

  if (action === "copy") {
    await copyToClipboard(
      getFullText(entry.content),
      `${entry.product.name} - ${entry.workflow}`,
    );
  } else if (action === "export") {
    const filepath = exportToTextFile(
      entry.content,
      `${entry.product.name} - ${entry.workflow}`,
    );
    console.log(chalk.green(`\n💾 Đã xuất ra file: ${filepath}\n`));
  } else if (action === "delete") {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Xác nhận xóa lịch sử "${entry.product.name}"?`,
        default: false,
      },
    ]);
    if (confirm) {
      await deleteHistoryEntry(entry.id);
      console.log(chalk.green("\n🗑️  Đã xóa entry khỏi lịch sử\n"));
    }
  } else if (action === "regenerate") {
    const { workflow } = await inquirer.prompt([
      {
        type: "rawlist",
        name: "workflow",
        message: "Chọn workflow:",
        choices: [
          { name: "🎬  Chỉ kịch bản", value: "script" },
          { name: "✍️  Chỉ mô tả", value: "description" },
        ],
      },
    ]);
    if (workflow === "script") {
      await generateScriptFlow();
    } else if (workflow === "description") {
      await generateDescriptionFlow();
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
        { name: "⏭️  Quay lại", value: "back" },
      ],
    },
  ]);

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
      const product = await selectOrEnterProduct();
      const plat = await selectPlatform();

      const agent = new VideoCreatorAgent();
      const script = await generateWithRetry(
        () => agent.generateScript(product, plat),
        (s) => validateScript(s),
      );

      console.log(formatScriptOutput(script));
      scriptContent = script;

      const content: GeneratedContent = { product, script };
      await saveToHistory(product, content, "script");
    } else {
      const entry = scriptsOnly.find((h: HistoryEntry) => h.id === source);
      if (!entry) return;
      scriptContent = entry.content.script!;
    }
  } else {
    console.log(chalk.yellow("\n📭 Chưa có kịch bản nào. Tạo mới...\n"));
    const product = await selectOrEnterProduct();
    const plat = await selectPlatform();

    const agent = new VideoCreatorAgent();
    const script = await generateWithRetry(
      () => agent.generateScript(product, plat),
      (s) => validateScript(s),
    );

    console.log(formatScriptOutput(script));
    scriptContent = script;

    const content: GeneratedContent = { product, script };
    await saveToHistory(product, content, "script");
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

      const videoCreator = new VideoCreatorAgent();
      const script = await generateWithRetry(
        () => videoCreator.generateScript(product, platform),
        (s) => validateScript(s),
      );

      console.log(formatScriptOutput(script));

      const content: GeneratedContent = { product, script };
      await saveToHistory(product, content, "script");

      await handlePostActions("script", content);
      return;
    }

    if (action === "description") {
      const platform = await selectPlatform();
      const { scriptSummary } = await inquirer.prompt([
        {
          type: "input",
          name: "scriptSummary",
          message: "📝 Tóm tắt nội dung video (hoặc paste kịch bản):",
          validate: (input: string) =>
            input.trim().length > 0 ? true : "Vui lòng nhập nội dung",
        },
      ]);

      console.log(chalk.yellow("\n⚙️ Đang tạo mô tả bài đăng...\n"));

      const marketingWriter = new MarketingWriterAgent();
      const description = await generateWithRetry(
        () =>
          marketingWriter.generateDescription(product, scriptSummary, platform),
        (d) => validateDescription(d),
      );

      console.log(formatDescriptionOutput(description));

      const content: GeneratedContent = { product, description };
      await saveToHistory(product, content, "description");

      await handlePostActions("description", content);
      return;
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
        new inquirer.Separator(" 🎨 Tiện ích & Quản lý "),
        {
          name: "[TTS Voice] - Chuyển kịch bản thành giọng nói (Google TTS)",
          value: "tts",
        },
        { name: "[History] - Xem & quản lý nội dung đã tạo", value: "history" },
        { name: "[Products] - Xem & quản lý sản phẩm", value: "products" },
        new inquirer.Separator(" ⚙️ Hệ thống "),
        { name: "[System] - Kiểm tra kết nối AI providers", value: "check" },
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

    if (action === "script") {
      await generateScriptFlow();
    } else if (action === "description") {
      await generateDescriptionFlow();
    } else if (action === "trendscan") {
      await generateTrendScanFlow();
    } else if (action === "imagebrief") {
      await generateImageBriefFlow();
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

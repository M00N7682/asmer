#!/usr/bin/env node

/**
 * deco-compare.mjs - Compare implementation screenshots against design references
 *
 * Usage: node scripts/deco-compare.mjs <page>
 * Pages: landing, mixer, timer, presets
 *
 * Requires: design reference images in designs/ directory
 * Output: .deco/<page>/screenshot.png, diff.png, heatmap.png
 */

import { capture, compareImages, analyzeDiff, closeBrowser } from "../node_modules/deco-claude/dist/index.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const pages = {
  landing: { url: "/", designFile: "landing.png" },
  mixer: { url: "/mix", designFile: "mixer.png" },
  timer: { url: "/timer", designFile: "timer.png" },
  presets: { url: "/presets", designFile: "presets.png" },
};

const pageName = process.argv[2];

if (!pageName || !pages[pageName]) {
  console.error("Usage: node scripts/deco-compare.mjs <landing|mixer|timer|presets>");
  process.exit(1);
}

const page = pages[pageName];
const outDir = resolve(ROOT, ".deco", pageName);
mkdirSync(outDir, { recursive: true });

const designPath = resolve(ROOT, "designs", page.designFile);
if (!existsSync(designPath)) {
  console.error(`Design reference not found: ${designPath}`);
  console.error("Export design screenshots from Pencil first.");
  process.exit(1);
}

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

async function run() {
  console.log(`\n📐 Comparing: ${pageName} (${page.url})`);
  console.log(`   Design: ${designPath}`);
  console.log(`   Server: ${SERVER_URL}${page.url}\n`);

  // 1. Capture live page
  console.log("📸 Capturing page...");
  const result = await capture({
    url: `${SERVER_URL}${page.url}`,
    viewport: { width: 1440, height: 900 },
    waitUntil: "networkidle",
    fullPage: true,
    timeoutMs: 15000,
  });

  writeFileSync(resolve(outDir, "screenshot.png"), result.screenshot);
  console.log(`   Saved: .deco/${pageName}/screenshot.png (${result.width}x${result.height})`);

  if (result.errors.length > 0) {
    console.warn("   ⚠️ Page errors:", result.errors);
  }

  // 2. Compare against design
  console.log("🔍 Comparing images...");
  const designImage = readFileSync(designPath);
  const comparison = await compareImages(designImage, result.screenshot);

  writeFileSync(resolve(outDir, "diff.png"), comparison.diffImage);
  console.log(`   SSIM: ${(comparison.ssim * 100).toFixed(1)}%`);
  console.log(`   Pixel Match: ${(comparison.pixelMatch * 100).toFixed(1)}%`);
  console.log(`   Composite: ${(comparison.composite * 100).toFixed(1)}%`);
  console.log(`   Mismatch pixels: ${comparison.mismatchCount}/${comparison.totalPixels}`);

  // 3. Analyze diff regions
  console.log("🗺️  Analyzing diff regions...");
  const analysis = await analyzeDiff(comparison.diffImage, comparison.width, comparison.height);

  writeFileSync(resolve(outDir, "heatmap.png"), analysis.heatmap);
  console.log(`   ${analysis.summary}`);

  if (analysis.regions.length > 0) {
    console.log("   Regions:");
    for (const region of analysis.regions) {
      console.log(
        `     - ${region.area}: ${(region.mismatchRatio * 100).toFixed(1)}% mismatch (${region.description})`
      );
    }
  }

  // Result
  const passed = comparison.composite >= 0.85;
  console.log(`\n${passed ? "✅" : "❌"} ${pageName}: composite ${(comparison.composite * 100).toFixed(1)}% ${passed ? "≥" : "<"} 85%\n`);

  await closeBrowser();
  process.exit(passed ? 0 : 1);
}

run().catch((err) => {
  console.error("Error:", err);
  closeBrowser().catch(() => {});
  process.exit(1);
});

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import PptxGenJS from "pptxgenjs";
import { chromium } from "playwright";

const PRESETS = {
  widescreen: { width: 1920, height: 1080 },
  mobile: { width: 1080, height: 1920 }
};
const PNG_CAPTURE_GUTTER = 64;
const PX_PER_INCH = 144;
const AUTO_TRIM_MODES = new Set([
  "none",
  "block-end",
  "block",
  "inline-end",
  "inline",
  "box"
]);

function pxToInch(px) {
  return px / PX_PER_INCH;
}

function parseArgs(argv) {
  const options = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[i + 1];

    if (!value || value.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = value;
    i += 1;
  }

  return options;
}

function resolvePreset(options) {
  const presetName = options.preset ?? "widescreen";
  const preset = PRESETS[presetName];

  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}`);
  }

  const width = Number(options.width ?? preset.width);
  const height = Number(options.height ?? preset.height);

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error("Width and height must be numeric values.");
  }

  return { presetName, width, height };
}

async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Input file not found: ${filePath}`);
  }
}

async function statPath(targetPath) {
  try {
    return await fs.stat(targetPath);
  } catch {
    throw new Error(`Input path not found: ${targetPath}`);
  }
}

async function listHtmlFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
    .map((entry) => path.join(dirPath, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function resolveHtmlInputs(inputPath, inputLabel, inputStat) {
  if (!inputStat.isDirectory()) {
    await ensureFileExists(inputPath);
    return [inputPath];
  }

  const files = await listHtmlFiles(inputPath);

  if (files.length === 0) {
    throw new Error(`No slide pages found in ${inputLabel}`);
  }

  return files;
}

function styleNameFromDir(dirPath) {
  return path.basename(dirPath);
}

function extractHeadContent(source) {
  const match = source.match(/<head[^>]*>([\s\S]*?)<\/head>/i);

  if (!match) {
    return "";
  }

  return match[1]
    .replace(/<title[\s\S]*?<\/title>/gi, "")
    .trim();
}

function buildDeckHtml({ deckTitle, headContent, slides, width, height }) {
  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${deckTitle}</title>
    <style>
      @page {
        size: ${width}px ${height}px;
        margin: 0;
      }
    </style>
    ${headContent}
  </head>
  <body>
${slides.join("\n")}
  </body>
</html>
`;
}

async function extractSlideDocument(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  const match = source.match(/<main[^>]*class="slide"[^>]*>[\s\S]*?<\/main>/);

  if (!match) {
    throw new Error(`Could not find slide markup in ${filePath}`);
  }

  return {
    headContent: extractHeadContent(source),
    slideMarkup: match[0]
  };
}

async function createDeckSource(dirPath, width, height) {
  const htmlFiles = await listHtmlFiles(dirPath);

  if (htmlFiles.length === 0) {
    throw new Error(`No slide pages found in ${dirPath}`);
  }

  const slides = [];
  let headContent = "";

  for (let index = 0; index < htmlFiles.length; index += 1) {
    const filePath = htmlFiles[index];
    const document = await extractSlideDocument(filePath);
    slides.push(document.slideMarkup);

    if (index === 0) {
      headContent = document.headContent;
    }
  }

  const style = styleNameFromDir(dirPath);
  const tempName = `.deck-${style}-${Date.now()}-${process.pid}.html`;
  const tempPath = path.join(dirPath, tempName);

  await fs.writeFile(
    tempPath,
    buildDeckHtml({
      deckTitle: `${style} Deck`,
      headContent,
      slides,
      width,
      height
    }),
    "utf8"
  );

  return { tempPath, pageCount: htmlFiles.length, files: htmlFiles };
}

async function openPage(browser, filePath, width, height, scale) {
  const page = await browser.newPage({
    viewport: {
      width: width + PNG_CAPTURE_GUTTER * 2,
      height: height + PNG_CAPTURE_GUTTER * 2
    },
    deviceScaleFactor: scale
  });

  await page.emulateMedia({ media: "screen" });
  await page.goto(pathToFileURL(filePath).href, { waitUntil: "load" });
  await page.waitForLoadState("networkidle");

  return page;
}

function buildTempOutputPath(outputPath) {
  const parsed = path.parse(outputPath);
  const tempName = `${parsed.name}-${process.pid}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}${parsed.ext}`;
  return path.join(os.tmpdir(), tempName);
}

function clampCrop(value, max) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.min(value, Math.max(0, max - 1));
}

async function resolveClipRegion(locator) {
  const boundingBox = await locator.boundingBox();

  if (!boundingBox) {
    throw new Error("Could not resolve screenshot bounds for the selected element.");
  }

  const trim = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const readInset = (name) => {
      const value = Number.parseFloat(style.getPropertyValue(name));
      return Number.isFinite(value) && value > 0 ? value : 0;
    };
    const hasPaintedBox = (computed) => {
      const backgroundImage = computed.backgroundImage && computed.backgroundImage !== "none";
      const boxShadow = computed.boxShadow && computed.boxShadow !== "none";
      const outlineWidth = Number.parseFloat(computed.outlineWidth || "0");
      const borderWidths = [
        computed.borderTopWidth,
        computed.borderRightWidth,
        computed.borderBottomWidth,
        computed.borderLeftWidth
      ].some((value) => Number.parseFloat(value || "0") > 0);

      return backgroundImage || boxShadow || outlineWidth > 0 || borderWidths;
    };
    const hasDirectText = (node) =>
      Array.from(node.childNodes).some(
        (child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0
      );
    const paintsOwnRect = (node, computed) => {
      if (hasPaintedBox(computed)) {
        return true;
      }

      const tagName = node.tagName.toLowerCase();

      if (["img", "svg", "canvas", "video", "iframe"].includes(tagName)) {
        return true;
      }

      return hasDirectText(node);
    };

    const mode = style.getPropertyValue("--slideforge-auto-trim").trim().toLowerCase() || "none";
    const readBounds = () => {
      if (mode === "none") {
        return null;
      }

      const rootRect = element.getBoundingClientRect();
      let minLeft = Number.POSITIVE_INFINITY;
      let minTop = Number.POSITIVE_INFINITY;
      let maxRight = Number.NEGATIVE_INFINITY;
      let maxBottom = Number.NEGATIVE_INFINITY;

      for (const node of element.querySelectorAll("*")) {
        if (node.hasAttribute("data-slideforge-trim-ignore")) {
          continue;
        }

        const computed = getComputedStyle(node);

        if (
          computed.display === "none" ||
          computed.visibility === "hidden" ||
          Number.parseFloat(computed.opacity || "1") === 0
        ) {
          continue;
        }

        const rect = node.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
          continue;
        }

        if (!paintsOwnRect(node, computed)) {
          continue;
        }

        minLeft = Math.min(minLeft, rect.left);
        minTop = Math.min(minTop, rect.top);
        maxRight = Math.max(maxRight, rect.right);
        maxBottom = Math.max(maxBottom, rect.bottom);
      }

      if (!Number.isFinite(minLeft)) {
        return null;
      }

      return {
        left: minLeft - rootRect.left,
        top: minTop - rootRect.top,
        right: maxRight - rootRect.left,
        bottom: maxBottom - rootRect.top
      };
    };

    return {
      mode,
      manual: {
        top: readInset("--slideforge-crop-top"),
        right: readInset("--slideforge-crop-right"),
        bottom: readInset("--slideforge-crop-bottom"),
        left: readInset("--slideforge-crop-left")
      },
      padding: {
        top: readInset("--slideforge-trim-padding-top"),
        right: readInset("--slideforge-trim-padding-right"),
        bottom: readInset("--slideforge-trim-padding-bottom"),
        left: readInset("--slideforge-trim-padding-left")
      },
      bounds: readBounds()
    };
  });

  const mode = AUTO_TRIM_MODES.has(trim.mode) ? trim.mode : "none";
  const autoCrop = { top: 0, right: 0, bottom: 0, left: 0 };

  if (mode !== "none" && trim.bounds) {
    if (mode === "block" || mode === "box") {
      autoCrop.top = Math.max(0, trim.bounds.top - trim.padding.top);
    }

    if (mode === "inline" || mode === "box") {
      autoCrop.left = Math.max(0, trim.bounds.left - trim.padding.left);
    }

    if (mode === "inline" || mode === "inline-end" || mode === "box") {
      autoCrop.right = Math.max(0, boundingBox.width - trim.bounds.right - trim.padding.right);
    }

    if (mode === "block-end" || mode === "block" || mode === "box") {
      autoCrop.bottom = Math.max(0, boundingBox.height - trim.bounds.bottom - trim.padding.bottom);
    }
  }

  const crop = {
    top: autoCrop.top + trim.manual.top,
    right: autoCrop.right + trim.manual.right,
    bottom: autoCrop.bottom + trim.manual.bottom,
    left: autoCrop.left + trim.manual.left
  };

  const left = clampCrop(crop.left, boundingBox.width);
  const right = clampCrop(crop.right, boundingBox.width - left);
  const top = clampCrop(crop.top, boundingBox.height);
  const bottom = clampCrop(crop.bottom, boundingBox.height - top);
  const width = Math.max(1, boundingBox.width - left - right);
  const height = Math.max(1, boundingBox.height - top - bottom);
  const hasCrop = top > 0 || right > 0 || bottom > 0 || left > 0;

  return {
    hasCrop,
    x: boundingBox.x + left,
    y: boundingBox.y + top,
    width,
    height
  };
}

async function renderSingleFile({
  browser,
  inputPath,
  outputPath,
  format,
  selector,
  width,
  height,
  scale,
  crop = true
}) {
  const page = await openPage(browser, inputPath, width, height, scale);
  const tempOutputPath = buildTempOutputPath(outputPath);

  try {
    const slide = page.locator(selector).first();
    await slide.waitFor({ state: "visible" });

    if (format === "png") {
      await page.emulateMedia({ media: "screen" });
      const clip = crop ? await resolveClipRegion(slide) : null;

      if (clip?.hasCrop) {
        await page.screenshot({
          path: tempOutputPath,
          type: "png",
          clip
        });
      } else {
        await slide.screenshot({
          path: tempOutputPath,
          type: "png"
        });
      }
    } else {
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: tempOutputPath,
        printBackground: true,
        width: `${width}px`,
        height: `${height}px`,
        preferCSSPageSize: true
      });
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.copyFile(tempOutputPath, outputPath);
  } finally {
    await fs.rm(tempOutputPath, { force: true }).catch(() => {});
    await page.close();
  }
}

async function renderPptxFromHtmlFiles({
  browser,
  htmlFiles,
  outputPath,
  selector,
  width,
  height,
  scale
}) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "slideforge-pptx-"));
  const tempOutputPath = buildTempOutputPath(outputPath);
  const slideWidthInch = pxToInch(width);
  const slideHeightInch = pxToInch(height);

  try {
    const imagePaths = [];

    for (let index = 0; index < htmlFiles.length; index += 1) {
      const filePath = htmlFiles[index];
      const imagePath = path.join(
        tempDir,
        `${String(index + 1).padStart(4, "0")}-${path.parse(filePath).name}.png`
      );

      await renderSingleFile({
        browser,
        inputPath: filePath,
        outputPath: imagePath,
        format: "png",
        selector,
        width,
        height,
        scale,
        crop: false
      });

      imagePaths.push(imagePath);
    }

    const pptx = new PptxGenJS();
    pptx.author = "SlideForge";
    pptx.subject = "SlideForge image-based deck";
    pptx.title = path.parse(outputPath).name;
    pptx.defineLayout({
      name: "SLIDEFORGE_CUSTOM",
      width: slideWidthInch,
      height: slideHeightInch
    });
    pptx.layout = "SLIDEFORGE_CUSTOM";

    for (const imagePath of imagePaths) {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addImage({
        path: imagePath,
        x: 0,
        y: 0,
        w: slideWidthInch,
        h: slideHeightInch
      });
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await pptx.writeFile({ fileName: tempOutputPath });
    await fs.copyFile(tempOutputPath, outputPath);
  } finally {
    await fs.rm(tempOutputPath, { force: true }).catch(() => {});
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

function resolveFormat(args) {
  const outputExt = path.extname(args.output ?? "").slice(1);
  return (args.format || outputExt || "png").toLowerCase();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const input = args.input;
  const format = resolveFormat(args);
  const selector = args.selector ?? ".slide";
  const scale = Number(args.scale ?? 1);

  if (!input) {
    throw new Error("Missing required option: --input <path>");
  }

  if (!["png", "pdf", "pptx"].includes(format)) {
    throw new Error(`Unsupported format: ${format}`);
  }

  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error("Scale must be a positive number.");
  }

  const inputPath = path.resolve(cwd, input);
  const inputStat = await statPath(inputPath);
  const { width, height, presetName } = resolvePreset(args);

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"]
  });

  try {
    if (inputStat.isDirectory()) {
      if (format === "png") {
        const files = await resolveHtmlInputs(inputPath, input, inputStat);
        const outputDir = path.resolve(cwd, args.output ?? path.join("dist", input));

        await fs.mkdir(outputDir, { recursive: true });

        for (const filePath of files) {
          const relativeInput = path.relative(cwd, filePath);
          const outputPath = path.join(
            outputDir,
            `${path.parse(filePath).name}.png`
          );

          await renderSingleFile({
            browser,
            inputPath: filePath,
            outputPath,
            format,
            selector,
            width,
            height,
            scale
          });

          console.log(
            JSON.stringify(
              {
                input: relativeInput,
                output: path.relative(cwd, outputPath),
                format,
                preset: presetName,
                width,
                height,
                scale
              },
              null,
              2
            )
          );
        }
      } else if (format === "pdf") {
        const { tempPath, pageCount } = await createDeckSource(inputPath, width, height);
        const outputPath = path.resolve(
          cwd,
          args.output ?? path.join("dist", "decks", `${styleNameFromDir(inputPath)}.pdf`)
        );

        try {
          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await renderSingleFile({
            browser,
            inputPath: tempPath,
            outputPath,
            format,
            selector,
            width,
            height,
            scale
          });

          console.log(
            JSON.stringify(
              {
                input,
                output: path.relative(cwd, outputPath),
                format,
                preset: presetName,
                width,
                height,
                scale,
                pages: pageCount
              },
              null,
              2
            )
          );
        } finally {
          await fs.rm(tempPath, { force: true });
        }
      } else {
        const files = await resolveHtmlInputs(inputPath, input, inputStat);
        const outputPath = path.resolve(
          cwd,
          args.output ?? path.join("dist", "decks", `${styleNameFromDir(inputPath)}.pptx`)
        );

        await renderPptxFromHtmlFiles({
          browser,
          htmlFiles: files,
          outputPath,
          selector,
          width,
          height,
          scale
        });

        console.log(
          JSON.stringify(
            {
              input,
              output: path.relative(cwd, outputPath),
              format,
              preset: presetName,
              width,
              height,
              scale,
              pages: files.length
            },
            null,
            2
          )
        );
      }
    } else {
      await ensureFileExists(inputPath);
      const outputPath = path.resolve(cwd, args.output ?? inferOutputPath(input, format));
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      if (format === "pptx") {
        await renderPptxFromHtmlFiles({
          browser,
          htmlFiles: [inputPath],
          outputPath,
          selector,
          width,
          height,
          scale
        });
      } else {
        await renderSingleFile({
          browser,
          inputPath,
          outputPath,
          format,
          selector,
          width,
          height,
          scale
        });
      }

      console.log(
        JSON.stringify(
          {
            input,
            output: path.relative(cwd, outputPath),
            format,
            preset: presetName,
            width,
            height,
            scale
          },
          null,
          2
        )
      );
    }
  } finally {
    await browser.close();
  }
}

function inferOutputPath(input, format) {
  const parsed = path.parse(input);
  return path.join("dist", parsed.dir, `${parsed.name}.${format}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

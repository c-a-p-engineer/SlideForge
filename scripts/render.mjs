import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const PRESETS = {
  widescreen: { width: 1920, height: 1080 },
  mobile: { width: 1080, height: 1920 }
};

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
    .filter((entry) => entry.isFile() && /^\d{2}-.*\.html$/.test(entry.name))
    .map((entry) => path.join(dirPath, entry.name))
    .sort((a, b) => a.localeCompare(b));
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
    viewport: { width, height },
    deviceScaleFactor: scale
  });

  await page.emulateMedia({ media: "screen" });
  await page.goto(pathToFileURL(filePath).href, { waitUntil: "load" });
  await page.waitForLoadState("networkidle");

  return page;
}

async function renderSingleFile({
  browser,
  inputPath,
  outputPath,
  format,
  selector,
  width,
  height,
  scale
}) {
  const page = await openPage(browser, inputPath, width, height, scale);

  try {
    const slide = page.locator(selector).first();
    await slide.waitFor({ state: "visible" });

    if (format === "png") {
      await page.emulateMedia({ media: "screen" });
      await slide.screenshot({
        path: outputPath,
        type: "png"
      });
    } else {
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: outputPath,
        printBackground: true,
        width: `${width}px`,
        height: `${height}px`,
        preferCSSPageSize: true
      });
    }
  } finally {
    await page.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const input = args.input;
  const format = (
    args.format ??
    path.extname(args.output ?? "").slice(1) ??
    "png"
  ).toLowerCase();
  const selector = args.selector ?? ".slide";
  const scale = Number(args.scale ?? 1);

  if (!input) {
    throw new Error("Missing required option: --input <path>");
  }

  if (!["png", "pdf"].includes(format)) {
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
        const files = await listHtmlFiles(inputPath);
        const outputDir = path.resolve(cwd, args.output ?? path.join("dist", input));

        if (files.length === 0) {
          throw new Error(`No slide pages found in ${input}`);
        }

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
      } else {
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
      }
    } else {
      await ensureFileExists(inputPath);
      const outputPath = path.resolve(cwd, args.output ?? inferOutputPath(input, format));
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

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

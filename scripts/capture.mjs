import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const DEFAULT_WIDTH = 1440;
const DEFAULT_HEIGHT = 900;
const DEFAULT_SCALE = 1;
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_WAIT_UNTIL = "networkidle";
const VALID_WAIT_UNTIL = new Set(["load", "domcontentloaded", "networkidle", "commit"]);

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

function parsePositiveNumber(value, label) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }

  return number;
}

function parseNonNegativeNumber(value, label) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${label} must be zero or a positive number.`);
  }

  return number;
}

function parseUrl(value) {
  if (!value) {
    throw new Error("Missing required option: --url <url>");
  }

  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("URL must use http or https.");
  }

  return url;
}

function timestampForFileName(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[:.]/g, "-");
}

function safeHostName(hostname) {
  return hostname.replace(/[^a-zA-Z0-9.-]/g, "-");
}

function inferOutputPath(url) {
  return path.join(
    "dist",
    "captures",
    `${safeHostName(url.hostname)}-${timestampForFileName()}.png`
  );
}

function parseHideSelectors(value) {
  if (!value || value === true) {
    return [];
  }

  return String(value)
    .split(",")
    .map((selector) => selector.trim())
    .filter(Boolean);
}

async function hideElements(page, selectors) {
  if (selectors.length === 0) {
    return;
  }

  await page.addStyleTag({
    content: selectors
      .map((selector) => `${selector} { visibility: hidden !important; }`)
      .join("\n")
  });
}

function resolveOptions(args, cwd) {
  const url = parseUrl(args.url);
  const width = parsePositiveNumber(args.width ?? DEFAULT_WIDTH, "Width");
  const height = parsePositiveNumber(args.height ?? DEFAULT_HEIGHT, "Height");
  const scale = parsePositiveNumber(args.scale ?? DEFAULT_SCALE, "Scale");
  const timeout = parsePositiveNumber(args.timeout ?? DEFAULT_TIMEOUT, "Timeout");
  const delay = parseNonNegativeNumber(args.delay ?? 0, "Delay");
  const waitUntil = args["wait-until"] ?? DEFAULT_WAIT_UNTIL;

  if (!VALID_WAIT_UNTIL.has(waitUntil)) {
    throw new Error(
      `Unsupported wait-until value: ${waitUntil}. Use load, domcontentloaded, networkidle, or commit.`
    );
  }

  return {
    url,
    outputPath: path.resolve(cwd, args.output ?? inferOutputPath(url)),
    selector: typeof args.selector === "string" ? args.selector : null,
    width,
    height,
    scale,
    fullPage: Boolean(args["full-page"]),
    waitUntil,
    waitFor: typeof args["wait-for"] === "string" ? args["wait-for"] : null,
    timeout,
    delay,
    hideSelectors: parseHideSelectors(args.hide)
  };
}

async function capture(options, cwd) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"]
  });

  try {
    const page = await browser.newPage({
      viewport: {
        width: options.width,
        height: options.height
      },
      deviceScaleFactor: options.scale
    });

    page.setDefaultTimeout(options.timeout);
    page.setDefaultNavigationTimeout(options.timeout);
    await page.goto(options.url.href, {
      waitUntil: options.waitUntil,
      timeout: options.timeout
    });

    if (options.waitFor) {
      await page.locator(options.waitFor).first().waitFor({
        state: "visible",
        timeout: options.timeout
      });
    }

    await hideElements(page, options.hideSelectors);

    if (options.delay > 0) {
      await page.waitForTimeout(options.delay);
    }

    await fs.mkdir(path.dirname(options.outputPath), { recursive: true });

    if (options.selector) {
      const target = page.locator(options.selector).first();
      await target.waitFor({ state: "visible", timeout: options.timeout });
      await target.screenshot({
        path: options.outputPath,
        type: "png"
      });
    } else {
      await page.screenshot({
        path: options.outputPath,
        type: "png",
        fullPage: options.fullPage
      });
    }

    return {
      url: options.url.href,
      output: path.relative(cwd, options.outputPath),
      selector: options.selector,
      width: options.width,
      height: options.height,
      scale: options.scale,
      fullPage: options.fullPage,
      waitUntil: options.waitUntil,
      waitFor: options.waitFor,
      timeout: options.timeout,
      delay: options.delay,
      hide: options.hideSelectors
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  const cwd = process.cwd();
  const args = parseArgs(process.argv.slice(2));
  const options = resolveOptions(args, cwd);
  const result = await capture(options, cwd);

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

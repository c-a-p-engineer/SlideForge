import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const DEFAULT_WIDTH = 1440;
const DEFAULT_HEIGHT = 900;
const DEFAULT_SCALE = 1;
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_WAIT_UNTIL = "networkidle";
const VALID_WAIT_UNTIL = new Set(["load", "domcontentloaded", "networkidle", "commit"]);
const AUTO_TRIM_MODES = new Set(["none", "block-end", "block", "box"]);

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

    if (mode === "box") {
      autoCrop.left = Math.max(0, trim.bounds.left - trim.padding.left);
      autoCrop.right = Math.max(0, boundingBox.width - trim.bounds.right - trim.padding.right);
    }

    autoCrop.bottom = Math.max(0, boundingBox.height - trim.bounds.bottom - trim.padding.bottom);
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
    const tempOutputPath = buildTempOutputPath(options.outputPath);

    try {
      if (options.selector) {
        const target = page.locator(options.selector).first();
        await target.waitFor({ state: "visible", timeout: options.timeout });
        const clip = await resolveClipRegion(target);

        if (clip.hasCrop) {
          await page.screenshot({
            path: tempOutputPath,
            type: "png",
            clip
          });
        } else {
          await target.screenshot({
            path: tempOutputPath,
            type: "png"
          });
        }
      } else {
        await page.screenshot({
          path: tempOutputPath,
          type: "png",
          fullPage: options.fullPage
        });
      }

      await fs.copyFile(tempOutputPath, options.outputPath);
    } finally {
      await fs.rm(tempOutputPath, { force: true }).catch(() => {});
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

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const COLORS = {
  background: "#FFFFFF",
  text: "#222222",
  muted: "#666666",
  blue: "#1976D2",
  green: "#2E7D32",
  orange: "#F57C00",
  danger: "#D32F2F",
  purple: "#6A1B9A"
};
const DEFAULT_FONT_FAMILY = "IPAGothic";

const TONES = {
  normal: { fill: "#FFFFFF", stroke: COLORS.text, text: COLORS.text },
  muted: { fill: "#F5F5F5", stroke: COLORS.muted, text: COLORS.text },
  blue: { fill: "#E8F1FB", stroke: COLORS.blue, text: COLORS.text },
  green: { fill: "#EAF4EA", stroke: COLORS.green, text: COLORS.text },
  orange: { fill: "#FFF3E0", stroke: COLORS.orange, text: COLORS.text },
  danger: { fill: "#FDEAEA", stroke: COLORS.danger, text: COLORS.text },
  purple: { fill: "#F3EAF7", stroke: COLORS.purple, text: COLORS.text }
};

const REVIEW_ROUTES = [
  ["pre02-", "pre02"],
  ["chap00-", "chap00-first-crash"],
  ["chap01-", "chap01-ai-development-breakdown"],
  ["chap02-", "chap02-ai-and-engineering-ethics"],
  ["chap03-", "chap03-how-to-keep-ai-honest"],
  ["chap04-", "chap04-ai-readiness"],
  ["chap05-", "chap05-development-basics-before-ai"],
  ["chap06-", "chap06-rebuilding-the-wheel"],
  ["chap07-", "chap07-pre-development-checks"],
  ["chap08-", "chap08-reviewing-ai-code"],
  ["chap09-", "chap09-ai-team-development"],
  ["chap10-", "chap10-operability-after-release"],
  ["chap11-", "chap11-ai-era-principles"],
  ["supplement-", "supplement-working-with-ai"],
  ["conclusion-", "conclusion"],
  ["post02-", "post02"]
];

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

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function style(properties) {
  return Object.entries(properties)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join(";");
}

function toneOf(node, fallback = "normal") {
  return TONES[node?.tone] ? node.tone : fallback;
}

function boxStyle(toneName, extra = {}) {
  const tone = TONES[toneName] ?? TONES.normal;

  return style({
    rounded: 0,
    whiteSpace: "wrap",
    html: 1,
    shadow: 0,
    glass: 0,
    fillColor: tone.fill,
    strokeColor: tone.stroke,
    fontColor: tone.text,
    fontFamily: DEFAULT_FONT_FAMILY,
    strokeWidth: 2,
    fontSize: 18,
    align: "center",
    verticalAlign: "middle",
    spacing: 12,
    ...extra
  });
}

function titleStyle() {
  return style({
    text: 1,
    html: 1,
    strokeColor: "none",
    fillColor: "none",
    fontColor: COLORS.text,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 28,
    fontStyle: 1,
    align: "center",
    verticalAlign: "middle",
    whiteSpace: "wrap",
    rounded: 0,
    shadow: 0
  });
}

function labelStyle(color = COLORS.muted, size = 15) {
  return style({
    text: 1,
    html: 1,
    strokeColor: "none",
    fillColor: "none",
    fontColor: color,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: size,
    fontStyle: 1,
    align: "center",
    verticalAlign: "middle",
    whiteSpace: "wrap",
    rounded: 0,
    shadow: 0
  });
}

function edgeStyle(toneName = "normal") {
  const tone = TONES[toneName] ?? TONES.normal;

  return style({
    edgeStyle: "orthogonalEdgeStyle",
    rounded: 0,
    orthogonalLoop: 1,
    jettySize: "auto",
    html: 1,
    endArrow: "classic",
    endFill: 1,
    strokeColor: tone.stroke,
    strokeWidth: 2,
    fontColor: COLORS.text
  });
}

function normalizeNodes(nodes, minimum = 1) {
  if (!Array.isArray(nodes) || nodes.length < minimum) {
    throw new Error(`Expected at least ${minimum} node(s).`);
  }

  return nodes.map((node) => (typeof node === "string" ? { text: node } : node));
}

class GraphBuilder {
  constructor(width = 1200, height = 800) {
    this.width = width;
    this.height = height;
    this.nextId = 2;
    this.cells = [];
    this.bounds = {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    };
  }

  id(prefix) {
    const id = `${prefix}-${this.nextId}`;
    this.nextId += 1;
    return id;
  }

  vertex({ id = this.id("node"), value, x, y, width, height, style: cellStyle }) {
    this.bounds.minX = Math.min(this.bounds.minX, x);
    this.bounds.minY = Math.min(this.bounds.minY, y);
    this.bounds.maxX = Math.max(this.bounds.maxX, x + width);
    this.bounds.maxY = Math.max(this.bounds.maxY, y + height);
    this.cells.push(
      `<mxCell id="${escapeXml(id)}" value="${escapeXml(value)}" style="${escapeXml(cellStyle)}" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" /></mxCell>`
    );
    return id;
  }

  edge({ id = this.id("edge"), source, target, value = "", style: cellStyle }) {
    this.cells.push(
      `<mxCell id="${escapeXml(id)}" value="${escapeXml(value)}" style="${escapeXml(cellStyle)}" edge="1" parent="1" source="${escapeXml(source)}" target="${escapeXml(target)}"><mxGeometry relative="1" as="geometry" /></mxCell>`
    );
    return id;
  }

  normalizedCells() {
    if (!Number.isFinite(this.bounds.minX) || !Number.isFinite(this.bounds.minY)) {
      return this.cells;
    }

    const offsetX = this.bounds.minX;
    const offsetY = this.bounds.minY;

    return this.cells.map((cell) =>
      cell.replace(/<mxGeometry x="(-?\d+(?:\.\d+)?)" y="(-?\d+(?:\.\d+)?)"/, (_match, x, y) => {
        const normalizedX = Number(x) - offsetX;
        const normalizedY = Number(y) - offsetY;
        return `<mxGeometry x="${normalizedX}" y="${normalizedY}"`;
      })
    );
  }

  pageSize() {
    if (!Number.isFinite(this.bounds.minX) || !Number.isFinite(this.bounds.minY)) {
      return { width: this.width, height: this.height };
    }

    return {
      width: this.bounds.maxX - this.bounds.minX,
      height: this.bounds.maxY - this.bounds.minY
    };
  }

  xml(title) {
    const { width, height } = this.pageSize();
    const cells = this.normalizedCells();

    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="SlideForge" modified="${new Date().toISOString()}" agent="SlideForge drawio" version="30.0.4">
  <diagram id="slideforge-diagram" name="${escapeXml(title || "diagram")}">
    <mxGraphModel dx="${width}" dy="${height}" grid="0" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${width}" pageHeight="${height}" background="${COLORS.background}" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        ${cells.join("\n        ")}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
  }
}

function addTitle(graph, title) {
  if (!title) {
    return;
  }

  const width = 520;
  graph.vertex({
    value: title,
    x: Math.floor((graph.width - width) / 2),
    y: 48,
    width,
    height: 52,
    style: titleStyle()
  });
}

function buildFlow(spec) {
  const nodes = normalizeNodes(spec.nodes, 2);
  const graph = new GraphBuilder();
  addTitle(graph, spec.title);

  const boxWidth = 360;
  const boxHeight = 78;
  const gap = Math.min(72, Math.max(38, Math.floor((620 - nodes.length * boxHeight) / Math.max(1, nodes.length - 1))));
  const startY = 136;
  const x = Math.floor((graph.width - boxWidth) / 2);
  const ids = nodes.map((node, index) =>
    graph.vertex({
      value: node.text,
      x,
      y: startY + index * (boxHeight + gap),
      width: boxWidth,
      height: boxHeight,
      style: boxStyle(toneOf(node))
    })
  );

  for (let index = 0; index < ids.length - 1; index += 1) {
    graph.edge({
      source: ids[index],
      target: ids[index + 1],
      style: edgeStyle(toneOf(nodes[index + 1]))
    });
  }

  return graph;
}

function buildTimeline(spec) {
  const nodes = normalizeNodes(spec.nodes, 2);
  const graph = new GraphBuilder();
  addTitle(graph, spec.title);

  const boxWidth = 520;
  const boxHeight = 70;
  const x = 420;
  const labelX = 180;
  const startY = 136;
  const gap = Math.min(66, Math.max(34, Math.floor((620 - nodes.length * boxHeight) / Math.max(1, nodes.length - 1))));
  const ids = [];

  nodes.forEach((node, index) => {
    const y = startY + index * (boxHeight + gap);
    graph.vertex({
      value: node.label ?? String(index + 1),
      x: labelX,
      y,
      width: 160,
      height: boxHeight,
      style: labelStyle(COLORS.muted, 16)
    });
    ids.push(
      graph.vertex({
        value: node.text,
        x,
        y,
        width: boxWidth,
        height: boxHeight,
        style: boxStyle(toneOf(node))
      })
    );
  });

  for (let index = 0; index < ids.length - 1; index += 1) {
    graph.edge({
      source: ids[index],
      target: ids[index + 1],
      style: edgeStyle(toneOf(nodes[index + 1]))
    });
  }

  return graph;
}

function buildLayer(spec) {
  const nodes = normalizeNodes(spec.nodes, 2);
  const graph = new GraphBuilder();
  addTitle(graph, spec.title);

  const boxWidth = 560;
  const boxHeight = Math.max(58, Math.floor(500 / nodes.length));
  const x = Math.floor((graph.width - boxWidth) / 2);
  const startY = 150;

  nodes.forEach((node, index) => {
    graph.vertex({
      value: node.text,
      x,
      y: startY + index * boxHeight,
      width: boxWidth,
      height: boxHeight,
      style: boxStyle(toneOf(node), {
        fontSize: 20
      })
    });
  });

  return graph;
}

function normalizeColumns(spec) {
  if (Array.isArray(spec.columns) && spec.columns.length >= 2) {
    return spec.columns.slice(0, 2).map((column) => ({
      title: column.title ?? "",
      nodes: normalizeNodes(column.nodes ?? [], 1)
    }));
  }

  if (Array.isArray(spec.left) && Array.isArray(spec.right)) {
    return [
      { title: spec.leftTitle ?? "左", nodes: normalizeNodes(spec.left, 1) },
      { title: spec.rightTitle ?? "右", nodes: normalizeNodes(spec.right, 1) }
    ];
  }

  const nodes = normalizeNodes(spec.nodes, 2);
  const middle = Math.ceil(nodes.length / 2);

  return [
    { title: spec.leftTitle ?? "Before", nodes: nodes.slice(0, middle) },
    { title: spec.rightTitle ?? "After", nodes: nodes.slice(middle) }
  ];
}

function buildComparison(spec) {
  const [left, right] = normalizeColumns(spec);
  const graph = new GraphBuilder();
  addTitle(graph, spec.title);

  const columns = [
    { ...left, x: 130, tone: "orange" },
    { ...right, x: 650, tone: "green" }
  ];
  const maxRows = Math.max(columns[0].nodes.length, columns[1].nodes.length);
  const boxHeight = Math.max(66, Math.min(96, Math.floor(470 / maxRows)));

  columns.forEach((column) => {
    graph.vertex({
      value: column.title,
      x: column.x,
      y: 132,
      width: 420,
      height: 48,
      style: labelStyle(TONES[column.tone].stroke, 20)
    });

    column.nodes.forEach((node, index) => {
      graph.vertex({
        value: node.text,
        x: column.x,
        y: 206 + index * (boxHeight + 22),
        width: 420,
        height: boxHeight,
        style: boxStyle(toneOf(node, column.tone))
      });
    });
  });

  graph.vertex({
    value: "vs",
    x: 560,
    y: 380,
    width: 80,
    height: 48,
    style: labelStyle(COLORS.muted, 20)
  });

  return graph;
}

function buildAccident(spec) {
  const nodes = normalizeNodes(spec.nodes, 2);
  const graph = new GraphBuilder();
  addTitle(graph, spec.title);

  const root = nodes[0];
  const causes = nodes.slice(1);
  const rootId = graph.vertex({
    value: root.text,
    x: 420,
    y: 136,
    width: 360,
    height: 86,
    style: boxStyle(toneOf(root, "danger"), {
      fontSize: 22,
      fontStyle: 1
    })
  });

  const cols = causes.length <= 3 ? causes.length : 3;
  const boxWidth = 280;
  const boxHeight = 76;
  const gapX = 42;
  const startX = Math.floor((graph.width - (cols * boxWidth + (cols - 1) * gapX)) / 2);

  causes.forEach((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const id = graph.vertex({
      value: node.text,
      x: startX + col * (boxWidth + gapX),
      y: 330 + row * 126,
      width: boxWidth,
      height: boxHeight,
      style: boxStyle(toneOf(node, "orange"))
    });
    graph.edge({
      source: id,
      target: rootId,
      style: edgeStyle(toneOf(node, "orange"))
    });
  });

  return graph;
}

function buildGraph(spec) {
  switch (spec.type) {
    case "flow":
      return buildFlow(spec);
    case "timeline":
      return buildTimeline(spec);
    case "layer":
      return buildLayer(spec);
    case "comparison":
      return buildComparison(spec);
    case "accident":
      return buildAccident(spec);
    default:
      throw new Error(`Unsupported drawio type: ${spec.type}`);
  }
}

async function statPath(targetPath) {
  try {
    return await fs.stat(targetPath);
  } catch {
    throw new Error(`Input path not found: ${targetPath}`);
  }
}

async function listInputFiles(inputPath) {
  const stat = await statPath(inputPath);

  if (stat.isDirectory()) {
    const entries = await fs.readdir(inputPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".drawio.json"))
      .map((entry) => path.join(inputPath, entry.name))
      .sort((a, b) => a.localeCompare(b));
  }

  if (!inputPath.endsWith(".drawio.json")) {
    throw new Error("Input file must end with .drawio.json");
  }

  return [inputPath];
}

function inferOutputBase(inputFile, outputDir) {
  const name = path.basename(inputFile, ".drawio.json");
  return path.join(outputDir ?? path.dirname(inputFile), name);
}

function routeReviewChapter(spec, inputFile) {
  if (spec.reviewChapter) {
    return spec.reviewChapter;
  }

  const name = path.basename(inputFile, ".drawio.json");
  const route = REVIEW_ROUTES.find(([prefix]) => name.startsWith(prefix));

  if (!route) {
    throw new Error(`Could not infer Re:VIEW chapter from file name: ${path.basename(inputFile)}`);
  }

  return route[1];
}

function defaultReviewPath(inputPath, childPath) {
  const marker = `${path.sep}ReVIEW${path.sep}`;
  const index = inputPath.indexOf(marker);

  if (index >= 0) {
    return path.join(inputPath.slice(0, index), "ReVIEW", childPath);
  }

  return path.resolve(process.cwd(), "../ReVIEW", childPath);
}

async function commandExists(command) {
  const paths = (process.env.PATH ?? "").split(path.delimiter);

  for (const dir of paths) {
    if (!dir) {
      continue;
    }

    try {
      await fs.access(path.join(dir, command));
      return true;
    } catch {
      // Try next PATH entry.
    }
  }

  return false;
}

async function runDrawio({ input, output, format, embed, border, scale, noXvfb }) {
  const drawioBin = process.env.DRAWIO_BIN ?? "drawio";
  const drawioArgs = [
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "-x",
    ...(embed ? ["-e"] : []),
    "-f",
    format,
    "--border",
    String(border),
    "--scale",
    String(scale),
    "-o",
    output
  ];

  drawioArgs.push(input);

  const useXvfb = !noXvfb && (await commandExists("xvfb-run"));
  const command = useXvfb ? "xvfb-run" : drawioBin;
  const args = useXvfb ? ["-a", drawioBin, ...drawioArgs] : drawioArgs;

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: {
        ...process.env,
        ELECTRON_DISABLE_SANDBOX: "1"
      }
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function buildPngTextChunk(keyword, text) {
  const type = Buffer.from("tEXt", "ascii");
  const data = Buffer.concat([
    Buffer.from(keyword, "latin1"),
    Buffer.from([0]),
    Buffer.from(text, "latin1")
  ]);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([type, data])));

  return Buffer.concat([length, type, data, crc]);
}

async function addDrawioPngMetadata(pngPath, drawioPath) {
  const png = await fs.readFile(pngPath);
  const xml = await fs.readFile(drawioPath, "utf8");
  const encodedXml = encodeURIComponent(xml);
  const chunks = [
    buildPngTextChunk("mxGraphModel", encodedXml),
    buildPngTextChunk("mxfile", encodedXml)
  ];
  const signature = png.subarray(0, 8);
  let offset = 8;

  if (signature.toString("hex") !== "89504e470d0a1a0a") {
    throw new Error(`Output is not a PNG file: ${pngPath}`);
  }

  const output = [signature];
  let inserted = false;

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const chunk = png.subarray(offset, offset + 12 + length);

    output.push(chunk);
    offset += 12 + length;

    if (type === "IHDR" && !inserted) {
      output.push(...chunks);
      inserted = true;
    }
  }

  await fs.writeFile(pngPath, Buffer.concat(output));
}

async function renderOne(inputFile, options) {
  const spec = JSON.parse(await fs.readFile(inputFile, "utf8"));
  const graph = buildGraph(spec);
  const outputBase = inferOutputBase(inputFile, options.output);
  const drawioPath = `${outputBase}.drawio`;
  const pngPath = `${outputBase}.drawio.png`;

  await fs.mkdir(path.dirname(drawioPath), { recursive: true });
  await fs.writeFile(drawioPath, graph.xml(spec.title), "utf8");

  await runDrawio({
    input: drawioPath,
    output: pngPath,
    format: "png",
    embed: true,
    border: options.border,
    scale: options.scale,
    noXvfb: options.noXvfb
  });
  await addDrawioPngMetadata(pngPath, drawioPath);

  let reviewOutput = null;

  if (options.review) {
    const chapter = routeReviewChapter(spec, inputFile);
    const reviewName = `${path.basename(inputFile, ".drawio.json")}.jpg`;
    reviewOutput = path.join(options.reviewImagesDir, chapter, reviewName);

    await fs.mkdir(path.dirname(reviewOutput), { recursive: true });
    await runDrawio({
      input: drawioPath,
      output: reviewOutput,
      format: "jpg",
      embed: false,
      border: options.border,
      scale: options.scale,
      noXvfb: options.noXvfb
    });
  }

  console.log(
    JSON.stringify(
      {
        input: inputFile,
        drawio: drawioPath,
        png: pngPath,
        review: reviewOutput
      },
      null,
      2
    )
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();

  if (!args.input) {
    throw new Error("Missing required option: --input <file|dir>");
  }

  const inputPath = path.resolve(cwd, args.input);
  const files = await listInputFiles(inputPath);

  if (files.length === 0) {
    throw new Error(`No .drawio.json files found in ${inputPath}`);
  }

  const output = args.output
    ? path.resolve(cwd, args.output)
    : args.review
      ? defaultReviewPath(inputPath, "drawio_build")
      : null;
  const scale = Number(args.scale ?? 2);
  const border = Number(args.border ?? 20);

  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error("Scale must be a positive number.");
  }

  if (!Number.isFinite(border) || border < 0) {
    throw new Error("Border must be zero or a positive number.");
  }

  const options = {
    output,
    review: Boolean(args.review),
    reviewImagesDir: path.resolve(
      cwd,
      args["review-images-dir"] ?? defaultReviewPath(inputPath, "images")
    ),
    scale,
    border,
    noXvfb: Boolean(args["no-xvfb"])
  };

  for (const file of files) {
    await renderOne(file, options);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

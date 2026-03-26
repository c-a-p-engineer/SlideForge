import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

async function listStyles() {
  const root = path.resolve(process.cwd(), "slides");
  const entries = await fs.readdir(root, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== "templates")
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function runNode(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${args.join(" ")} exited with code ${code}`));
    });

    child.on("error", reject);
  });
}

async function main() {
  const styles = await listStyles();

  for (const style of styles) {
    const preset = style === "mobile" ? "mobile" : "widescreen";
    await runNode([
      "scripts/render.mjs",
      "--input",
      path.join("slides", style),
      "--format",
      "png",
      "--preset",
      preset
    ]);
    await runNode([
      "scripts/render.mjs",
      "--input",
      path.join("slides", style),
      "--format",
      "pdf",
      "--preset",
      preset
    ]);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

import { spawn } from "node:child_process";

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

async function runRender(input, output) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["scripts/render.mjs", "--input", input, "--format", "pdf", "--output", output],
      {
        cwd: process.cwd(),
        stdio: "inherit"
      }
    );

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`render.mjs exited with code ${code}`));
    });

    child.on("error", reject);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const style = args.style;

  if (!style) {
    throw new Error("Missing required option: --style <name>");
  }

  const input = `slides/${style}`;
  const output = args.output ?? `dist/decks/${style}.pdf`;
  await runRender(input, output);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

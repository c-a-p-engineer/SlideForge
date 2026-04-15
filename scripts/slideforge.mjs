#!/usr/bin/env node

import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function printUsage() {
  console.log(`Usage:
  slideforge render --input <file|dir> --format <png|pdf> [options]
  slideforge capture --url <url> [options]
  slideforge render-all
  slideforge generate-samples`);
}

function resolveScript(command) {
  switch (command) {
    case "render":
      return path.join(__dirname, "render.mjs");
    case "capture":
      return path.join(__dirname, "capture.mjs");
    case "render-all":
      return path.join(__dirname, "render-all.mjs");
    case "generate-samples":
      return path.join(__dirname, "generate-samples.sh");
    default:
      return null;
  }
}

function runCommand(command, args) {
  const scriptPath = resolveScript(command);

  if (!scriptPath) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const child =
    command === "generate-samples"
      ? spawn("bash", [scriptPath, ...args], { stdio: "inherit", cwd: process.cwd() })
      : spawn(process.execPath, [scriptPath, ...args], { stdio: "inherit", cwd: process.cwd() });

  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });

  child.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

const [command, ...args] = process.argv.slice(2);

if (!command || command === "--help" || command === "-h") {
  printUsage();
} else {
  runCommand(command, args);
}

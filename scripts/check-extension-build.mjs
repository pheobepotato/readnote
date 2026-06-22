import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve("dist");
const requiredFiles = [
  "manifest.json",
  "background.js",
  "content.js",
  "content.css"
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(distDir, file)));
if (missing.length > 0) {
  throw new Error(`Missing extension build files: ${missing.join(", ")}`);
}

const content = readFileSync(resolve(distDir, "content.js"), "utf8");
if (/^\s*import(?:\s|\{)/m.test(content) || /\bfrom\s*["']\.\/chunks\//.test(content)) {
  throw new Error("content.js must be self-contained; Chrome content scripts cannot load shared chunks here.");
}

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const distDir = resolve(rootDir, "dist");

await build({
  configFile: false,
  root: rootDir,
  publicDir: "public",
  build: {
    outDir: distDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(rootDir, "src/background/index.ts")
      },
      output: {
        entryFileNames: "background.js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});

await build({
  configFile: false,
  root: rootDir,
  publicDir: false,
  build: {
    outDir: distDir,
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(rootDir, "src/content/index.ts"),
      output: {
        format: "iife",
        name: "ReadnoteContent",
        entryFileNames: "content.js",
        inlineDynamicImports: true
      }
    }
  }
});

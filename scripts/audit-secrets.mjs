import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const PERSONAL_USER = ["yang", "linshu"].join("");
const PERSONAL_NOTION_ID = ["3836", "d0ec"].join("");
const PRIVATE_OWNER = ["pheobe", "potato"].join("");
const PRIVATE_REPO = ["reading", "notebook"].join("-");
const OLD_LOCAL_DIR = ["1-assume", "2-highlight-obsidian-rolex"].join("-");

const RULES = [
  {
    rule: "notion-token",
    pattern: /\bsecret_[A-Za-z0-9]{12,}\b/g
  },
  {
    rule: "api-key",
    pattern: /\bsk-[A-Za-z0-9][A-Za-z0-9_-]{12,}\b/g
  },
  {
    rule: "personal-path",
    pattern: new RegExp(`/Users/${PERSONAL_USER}\\b|${"Obsidian"} Vault`, "g")
  },
  {
    rule: "personal-notion-page",
    pattern: new RegExp(`${PERSONAL_NOTION_ID}-?94fa-?8128-?96b8-?ee5985993421`, "gi")
  },
  {
    rule: "private-repo",
    pattern: new RegExp(`${PRIVATE_OWNER}/${PRIVATE_REPO}|${OLD_LOCAL_DIR}`, "g")
  }
];

const IGNORED_FILES = new Set(["package-lock.json"]);

export function scanTextForSecrets(text, filePath = "") {
  const findings = [];
  const seen = new Set();
  for (const { rule, pattern } of RULES) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const before = text.slice(0, match.index);
      const line = before.split(/\r?\n/).length;
      const key = `${filePath}:${line}:${rule}`;
      if (!seen.has(key)) {
        findings.push({ filePath, line, rule });
        seen.add(key);
      }
    }
  }
  return findings;
}

export function trackedFiles() {
  return execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((filePath) => !IGNORED_FILES.has(filePath));
}

export function scanTrackedFiles(files = trackedFiles()) {
  return files.flatMap((filePath) => scanTextForSecrets(readFileSync(filePath, "utf8"), filePath));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const findings = scanTrackedFiles();
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`${finding.filePath}:${finding.line} ${finding.rule}`);
    }
    process.exitCode = 1;
  }
}

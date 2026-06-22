import { describe, expect, test } from "vitest";
import { scanTextForSecrets } from "../scripts/audit-secrets.mjs";

describe("secret audit", () => {
  test("allows public placeholders", () => {
    const findings = scanTextForSecrets(
      [
        "READNOTE_OBSIDIAN_PATH=/Users/you/Documents/Readnote/Reading Notes.md",
        "READNOTE_NOTION_PAGE_ID=<your_notion_page_id>",
        "DEEPSEEK_API_KEY=<your_deepseek_api_key>",
        "curl -fsSL https://raw.githubusercontent.com/<owner>/readnote/main/install.sh | bash"
      ].join("\n"),
      "README.md"
    );

    expect(findings).toEqual([]);
  });

  test("flags personal paths, real-looking tokens, and private repo identifiers", () => {
    const notionToken = `secret_${"abcdefghijklmnopqrstuvwxyz"}`;
    const apiKey = `sk-${"abcdefghijklmnopqrstuvwxyz"}`;
    const personalPath = `/Users/${["yang", "linshu"].join("")}/Documents/${"Obsidian"} Vault/Reading Notes.md`;
    const privateRepo = `https://github.com/${["pheobe", "potato"].join("")}/${["reading", "notebook"].join("-")}`;
    const findings = scanTextForSecrets(
      [
        `NOTION_TOKEN=${notionToken}`,
        `DEEPSEEK_API_KEY=${apiKey}`,
        `READING_NOTEBOOK_OBSIDIAN_PATH=${personalPath}`,
        privateRepo
      ].join("\n"),
      "README.md"
    );

    expect(findings.map((finding) => finding.rule)).toEqual([
      "notion-token",
      "api-key",
      "personal-path",
      "private-repo"
    ]);
  });
});

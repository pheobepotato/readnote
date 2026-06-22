import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { loadEnvFile } from "../scripts/companion-env.mjs";

describe("companion env loader", () => {
  test("loads local env values without overwriting existing process env", () => {
    const dir = mkdtempSync(join(tmpdir(), "readnote-env-"));
    const envPath = join(dir, ".env.local");
    writeFileSync(
      envPath,
      [
        "OPENAI_API_KEY=example-openai-key",
        "NOTION_TOKEN=example-notion-token",
        "READNOTE_NOTION_PAGE_ID=\"example-page-id\"",
        "EXISTING_VALUE=from-file"
      ].join("\n"),
      "utf8"
    );

    const env = { EXISTING_VALUE: "from-process" };
    const loaded = loadEnvFile(envPath, env);

    expect(loaded).toEqual({
      OPENAI_API_KEY: "example-openai-key",
      NOTION_TOKEN: "example-notion-token",
      READNOTE_NOTION_PAGE_ID: "example-page-id"
    });
    expect(env.EXISTING_VALUE).toBe("from-process");
  });
});

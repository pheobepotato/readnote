import { describe, expect, test } from "vitest";
import { envTextForSettings, maskSecret, normalizeSetupSettings } from "../scripts/companion-config.mjs";

describe("companion setup config", () => {
  test("normalizes setup settings and writes a local env file without placeholders", () => {
    const settings = normalizeSetupSettings({
      profileName: "  Linshu  ",
      translationProvider: "deepseek",
      translationModel: "deepseek-v4-flash",
      translationApiKey: `sk-${"real-local-key"}`,
      obsidianPath: " /Users/you/Documents/Readnote/Reading Notes.md ",
      notionToken: `secret_${"real_local_token"}`,
      notionPageId: " page-id "
    });

    expect(settings.profileName).toBe("Linshu");
    expect(settings.obsidianPath).toBe("/Users/you/Documents/Readnote/Reading Notes.md");
    expect(envTextForSettings(settings)).toContain("READNOTE_PROFILE_NAME=Linshu");
    expect(envTextForSettings(settings)).toContain("READNOTE_OBSIDIAN_PATH=/Users/you/Documents/Readnote/Reading Notes.md");
    expect(envTextForSettings(settings)).not.toContain("<");
  });

  test("masks secrets for status pages", () => {
    expect(maskSecret(`sk-${"abcdefghijklmnopqrstuvwxyz"}`)).toBe("sk-a...wxyz");
    expect(maskSecret("")).toBe("Not configured");
  });
});

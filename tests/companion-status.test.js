import { describe, expect, test } from "vitest";

import { isCompanionStatusPageRequest, renderCompanionStatusPage } from "../scripts/companion-status.mjs";

describe("companion status page", () => {
  test("renders a readable status page for the preview root", () => {
    const html = renderCompanionStatusPage({
      status: {
        profileName: "Local Reader",
        translationConfigured: true,
        translationProvider: "deepseek",
        translationModel: "deepseek-v4-flash",
        obsidianConfigured: true,
        notionConfigured: true
      },
      notionPageId: "example-page-id",
      obsidianNotebookPath: "/Users/you/Documents/Readnote/Reading Notes.md"
    });

    expect(html).toContain("Readnote Companion");
    expect(html).toContain("Running");
    expect(html).toContain("Reading Notes");
    expect(html).toContain('rel="icon"');
    expect(html).not.toContain("not_found");
  });

  test("matches the preview root route", () => {
    expect(isCompanionStatusPageRequest("GET", "/")).toBe(true);
    expect(isCompanionStatusPageRequest("GET", "/index.html")).toBe(true);
    expect(isCompanionStatusPageRequest("POST", "/")).toBe(false);
    expect(isCompanionStatusPageRequest("GET", "/health")).toBe(false);
  });
});

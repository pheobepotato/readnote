import { describe, expect, test } from "vitest";

import { buildNotionExcerptBlocks, syncExcerptToNotion } from "../scripts/companion-notion.mjs";

const excerpt = {
  id: "ex_1",
  sourceId: "src_1",
  sourceTitle: "Rolex acquired Bucherer",
  sourceUrl: "https://example.com/rolex",
  text: "Rolex acquired Bucherer after decades of distribution dependence.",
  note: "Channel control matters.",
  translation: "Rolex 收购 Bucherer 和渠道控制有关。",
  createdAt: "2026-06-18T03:30:00.000Z"
};

describe("companion Notion sync", () => {
  test("builds one compact append block set for a reading excerpt", () => {
    const blocks = buildNotionExcerptBlocks(excerpt);

    expect(blocks[0].type).toBe("heading_3");
    expect(blocks[0].heading_3.rich_text[0].text.content).toBe("2026-06-18 · Rolex acquired Bucherer");
    expect(blocks[0].heading_3.rich_text[0].text.link).toBeUndefined();
    expect(blocks.some((block) => block.type === "quote")).toBe(true);
    expect(JSON.stringify(blocks)).toContain("Channel control matters.");
    expect(JSON.stringify(blocks)).toContain("Rolex 收购 Bucherer");
  });

  test("skips sync when Notion token is not configured", async () => {
    const result = await syncExcerptToNotion(excerpt, { token: "", pageId: "page-id" });

    expect(result).toEqual({ status: "not_configured" });
  });
});

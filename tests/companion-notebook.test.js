import { describe, expect, test } from "vitest";

import { appendExcerpt, renderExcerptBlock } from "../scripts/companion-notebook.mjs";

const excerpt = {
  id: "ex_1",
  sourceId: "src_1",
  sourceTitle: "Rolex acquired Bucherer",
  sourceUrl: "https://example.com/rolex",
  text: "Rolex acquired Bucherer after decades of distribution dependence.",
  note: "Remember this episode.",
  translation: "",
  createdAt: "2026-06-18T03:30:00.000Z"
};

describe("companion notebook formatting", () => {
  test("renders excerpt blocks without Obsidian block ids", () => {
    const block = renderExcerptBlock(excerpt);

    expect(block).toContain("##### 03:30");
    expect(block).toContain("> Rolex acquired Bucherer");
    expect(block).toContain("Note: Remember this episode.");
    expect(block).not.toContain("^ex_");
  });

  test("groups excerpts from one article under one source heading", () => {
    const first = appendExcerpt("# Reading Notes\n", excerpt);
    const second = appendExcerpt(first, {
      ...excerpt,
      id: "ex_2",
      text: "Second excerpt.",
      createdAt: "2026-06-18T04:15:00.000Z"
    });

    expect(second.match(/#### Rolex acquired Bucherer/g)).toHaveLength(1);
    expect(second.match(/\[Source\]\(https:\/\/example.com\/rolex\)/g)).toHaveLength(1);
    expect(second).toContain("##### 03:30");
    expect(second).toContain("##### 04:15");
  });

  test("keeps same-titled article groups separated by date", () => {
    const first = appendExcerpt("# Reading Notes\n", excerpt);
    const second = appendExcerpt(first, {
      ...excerpt,
      id: "ex_2",
      text: "Second day excerpt.",
      createdAt: "2026-06-19T04:15:00.000Z"
    });

    expect(second.match(/#### Rolex acquired Bucherer/g)).toHaveLength(2);
    expect(second.indexOf("### 2026-06-18")).toBeLessThan(second.indexOf("##### 03:30"));
    expect(second.indexOf("### 2026-06-19")).toBeLessThan(second.indexOf("> Second day excerpt."));
  });
});

import { appendExcerptToNotebook, renderExcerptBlock } from "../src/shared/notebook";
import type { ExcerptRecord } from "../src/shared/types";

const excerpt: ExcerptRecord = {
  id: "ex_1",
  sourceId: "src_1",
  sourceTitle: "Rolex acquired Bucherer",
  sourceUrl: "https://example.com/rolex",
  text: "Rolex acquired Bucherer after decades of distribution dependence.",
  note: "Remember this under the Acquired Rolex episode.",
  translation: "Rolex 收购 Bucherer，这件事体现了它对渠道控制的重视。",
  createdAt: "2026-06-18T03:30:00.000Z"
};

describe("Reading Notes notebook rendering", () => {
  it("renders one excerpt block with source, quote, note, and Chinese explanation", () => {
    const block = renderExcerptBlock(excerpt);

    expect(block).toContain("##### 03:30");
    expect(block).toContain("> Rolex acquired Bucherer");
    expect(block).toContain("Note: Remember this");
    expect(block).toContain("中文: Rolex 收购 Bucherer");
    expect(block).not.toContain("^ex_");
  });

  it("appends excerpts under month, date, and source article in one continuous notebook", () => {
    const existing = "# Reading Notes\n\n## Inbox\n";
    const next = appendExcerptToNotebook(existing, excerpt);

    expect(next).toContain("## 2026-06");
    expect(next).toContain("### 2026-06-18");
    expect(next).toContain("#### Rolex acquired Bucherer");
    expect(next).toContain("[Source](https://example.com/rolex)");
    expect(next.indexOf("## 2026-06")).toBeLessThan(next.indexOf("### 2026-06-18"));
    expect(next.indexOf("### 2026-06-18")).toBeLessThan(next.indexOf("#### Rolex acquired Bucherer"));
  });

  it("groups multiple excerpts from the same article under one article heading", () => {
    const first = appendExcerptToNotebook("# Reading Notes\n", excerpt);
    const second = appendExcerptToNotebook(first, {
      ...excerpt,
      id: "ex_2",
      text: "A second excerpt from the same article.",
      createdAt: "2026-06-18T04:15:00.000Z"
    });

    expect(second.match(/#### Rolex acquired Bucherer/g)).toHaveLength(1);
    expect(second.match(/\[Source\]\(https:\/\/example.com\/rolex\)/g)).toHaveLength(1);
    expect(second).toContain("##### 03:30");
    expect(second).toContain("##### 04:15");
    expect(second).toContain("> A second excerpt");
  });

  it("keeps same-titled article groups separated by reading date", () => {
    const first = appendExcerptToNotebook("# Reading Notes\n", excerpt);
    const second = appendExcerptToNotebook(first, {
      ...excerpt,
      id: "ex_2",
      text: "Read again on the next day.",
      createdAt: "2026-06-19T04:15:00.000Z"
    });

    expect(second.match(/#### Rolex acquired Bucherer/g)).toHaveLength(2);
    expect(second.indexOf("### 2026-06-18")).toBeLessThan(second.indexOf("##### 03:30"));
    expect(second.indexOf("### 2026-06-19")).toBeLessThan(second.indexOf("> Read again on the next day."));
  });
});

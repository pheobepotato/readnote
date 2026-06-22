import { renderObsidianNote } from "../src/shared/markdown";
import type { HighlightRecord, SourceRecord } from "../src/shared/types";

describe("Obsidian Markdown", () => {
  it("renders source metadata, full text, highlights, notes, Chinese explanation, vocabulary, and block IDs", () => {
    const source: SourceRecord = {
      id: "src_rolex",
      url: "https://example.com/rolex",
      title: "Acquired - Rolex",
      siteName: "example.com",
      capturedText: "Rolex acquired Bucherer after decades of distribution dependence.",
      firstReadAt: "2026-06-17T10:00:00.000Z",
      lastReadAt: "2026-06-17T10:30:00.000Z",
      tags: ["reading/source", "company/rolex"]
    };
    const highlights: HighlightRecord[] = [
      {
        id: "hlt_abc123",
        sourceId: "src_rolex",
        text: "Rolex acquired Bucherer",
        prefix: "",
        suffix: " after decades",
        note: "Remember this episode.",
        translation: "Rolex 收购 Bucherer，是理解其渠道战略的关键事件。",
        vocabulary: [
          {
            term: "distribution dependence",
            explanation: "渠道依赖；公司依赖外部经销商触达客户。"
          }
        ],
        createdAt: "2026-06-17T10:10:00.000Z",
        updatedAt: "2026-06-17T10:15:00.000Z"
      }
    ];

    const markdown = renderObsidianNote(source, highlights);

    expect(markdown).toContain('title: "Acquired - Rolex"');
    expect(markdown).toContain('source_url: "https://example.com/rolex"');
    expect(markdown).toContain("## Full Text Snapshot");
    expect(markdown).toContain("Rolex acquired Bucherer after decades");
    expect(markdown).toContain("> [!quote] Highlight");
    expect(markdown).toContain("**My note:** Remember this episode.");
    expect(markdown).toContain("**中文理解:** Rolex 收购 Bucherer");
    expect(markdown).toContain("- **distribution dependence**: 渠道依赖");
    expect(markdown).toContain("^hlt_abc123");
  });
});

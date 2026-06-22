import { canonicalizeUrl, sourceIdFromUrl } from "../src/shared/ids";

describe("source IDs", () => {
  it("removes fragments and normalizes empty paths", () => {
    expect(canonicalizeUrl("https://example.com/#intro")).toBe("https://example.com/");
    expect(canonicalizeUrl("https://example.com/article#section")).toBe("https://example.com/article");
  });

  it("creates deterministic source IDs from canonical URLs", async () => {
    const first = await sourceIdFromUrl("https://example.com/article#one");
    const second = await sourceIdFromUrl("https://example.com/article#two");

    expect(first).toBe(second);
    expect(first).toMatch(/^src_[a-f0-9]{16}$/);
  });
});

import { getContextForText } from "../src/content/text";

describe("highlight context helpers", () => {
  it("extracts prefix and suffix around selected text", () => {
    const context = getContextForText("Before Rolex acquired Bucherer after decades.", "Rolex acquired Bucherer", 8);

    expect(context).toEqual({
      prefix: "Before ",
      suffix: " after d"
    });
  });

  it("returns empty context when selected text is not found", () => {
    const context = getContextForText("No matching text", "Rolex", 8);

    expect(context).toEqual({ prefix: "", suffix: "" });
  });
});

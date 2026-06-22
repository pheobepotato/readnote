import {
  clearAnnotationMarkup,
  createAnnotationRecord,
  createExcerptFromAnnotation,
  normalizeAnnotationRecord,
  toggleAnnotationStyle
} from "../src/shared/annotations";

describe("annotation records", () => {
  it("creates styled annotations with note and excerpt state", () => {
    const annotation = createAnnotationRecord({
      sourceId: "src_1",
      text: "Rolex acquired Bucherer",
      prefix: "",
      suffix: " after decades",
      styles: ["yellow"],
      note: "Important",
      createdAt: "2026-06-18T03:30:00.000Z"
    });

    expect(annotation.id).toMatch(/^ann_[a-f0-9]{16}$/);
    expect(annotation.styles).toEqual(["yellow"]);
    expect(annotation.note).toBe("Important");
    expect(annotation.savedAsExcerpt).toBe(false);
  });

  it("uses a stable id for the same selected text location", () => {
    const first = createAnnotationRecord({
      sourceId: "src_1",
      text: "Rolex acquired Bucherer",
      prefix: "",
      suffix: " after decades",
      styles: ["yellow"],
      createdAt: "2026-06-18T03:30:00.000Z"
    });
    const second = createAnnotationRecord({
      sourceId: "src_1",
      text: "Rolex acquired Bucherer",
      prefix: "",
      suffix: " after decades",
      styles: ["green"],
      createdAt: "2026-06-18T04:30:00.000Z"
    });

    expect(second.id).toBe(first.id);
  });

  it("toggles individual styles without removing the other styles", () => {
    const annotation = createAnnotationRecord({
      sourceId: "src_1",
      text: "Rolex acquired Bucherer",
      prefix: "",
      suffix: " after decades",
      styles: ["yellow", "underline"],
      createdAt: "2026-06-18T03:30:00.000Z"
    });

    expect(toggleAnnotationStyle(annotation, "yellow", "2026-06-18T04:00:00.000Z").styles).toEqual(["underline"]);
    expect(toggleAnnotationStyle(annotation, "pink", "2026-06-18T04:00:00.000Z").styles).toEqual([
      "yellow",
      "pink",
      "underline"
    ]);
  });

  it("keeps current mark styles ordered and still normalizes legacy green annotations", () => {
    const current = createAnnotationRecord({
      sourceId: "src_1",
      text: "Rolex acquired Bucherer",
      prefix: "",
      suffix: " after decades",
      styles: ["pink", "wavy", "yellow", "blue", "underline"],
      createdAt: "2026-06-18T03:30:00.000Z"
    });
    const legacy = {
      id: "ann_legacy",
      sourceId: "src_1",
      text: "Rolex acquired Bucherer",
      prefix: "",
      suffix: " after decades",
      style: "blue" as const,
      note: "",
      translation: "",
      savedAsExcerpt: false,
      createdAt: "2026-06-18T03:30:00.000Z",
      updatedAt: "2026-06-18T03:30:00.000Z"
    };

    expect(current.styles).toEqual(["yellow", "blue", "pink", "underline", "wavy"]);
    expect(normalizeAnnotationRecord(legacy).styles).toEqual(["blue"]);
    expect(normalizeAnnotationRecord(legacy).id).toMatch(/^ann_[a-f0-9]{16}$/);
  });

  it("clears selected page markup without losing saved excerpt state", () => {
    const annotation = createAnnotationRecord({
      sourceId: "src_1",
      text: "Rolex acquired Bucherer",
      prefix: "",
      suffix: " after decades",
      styles: ["yellow", "underline"],
      note: "Important",
      savedAsExcerpt: true,
      createdAt: "2026-06-18T03:30:00.000Z"
    });

    const cleared = clearAnnotationMarkup(annotation, "2026-06-18T04:00:00.000Z");

    expect(cleared.styles).toEqual([]);
    expect(cleared.note).toBe("");
    expect(cleared.savedAsExcerpt).toBe(true);
    expect(cleared.updatedAt).toBe("2026-06-18T04:00:00.000Z");
  });

  it("creates an excerpt payload from an annotation", () => {
    const annotation = createAnnotationRecord({
      sourceId: "src_1",
      text: "Rolex acquired Bucherer",
      prefix: "",
      suffix: " after decades",
      styles: ["underline"],
      note: "Important",
      createdAt: "2026-06-18T03:30:00.000Z"
    });

    const excerpt = createExcerptFromAnnotation(annotation, {
      title: "Rolex acquired Bucherer",
      url: "https://example.com/rolex"
    });

    expect(excerpt.sourceTitle).toBe("Rolex acquired Bucherer");
    expect(excerpt.sourceUrl).toBe("https://example.com/rolex");
    expect(excerpt.text).toBe("Rolex acquired Bucherer");
    expect(excerpt.note).toBe("Important");
  });
});

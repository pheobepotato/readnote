import { createAnnotationRecord } from "../src/shared/annotations";
import { annotationClassName, orderAnnotationsForRendering } from "../src/content/rendering";

describe("content annotation rendering helpers", () => {
  it("renders containing annotations before nested annotations", () => {
    const long = createAnnotationRecord({
      sourceId: "src_1",
      text: "strategic control over a channel",
      prefix: "gaining ",
      suffix: " that had become",
      styles: ["underline"],
      createdAt: "2026-06-18T03:30:00.000Z"
    });
    const nested = createAnnotationRecord({
      sourceId: "src_1",
      text: "control",
      prefix: "strategic ",
      suffix: " over",
      styles: ["yellow"],
      createdAt: "2026-06-18T03:31:00.000Z"
    });

    expect(orderAnnotationsForRendering([nested, long]).map((annotation) => annotation.text)).toEqual([
      "strategic control over a channel",
      "control"
    ]);
  });

  it("adds a note line class independently from highlight and underline classes", () => {
    const annotation = createAnnotationRecord({
      sourceId: "src_1",
      text: "channel control",
      prefix: "strategic ",
      suffix: " over",
      styles: ["yellow", "underline", "wavy"],
      note: "This maps to my note.",
      createdAt: "2026-06-18T03:30:00.000Z"
    });

    expect(annotationClassName(annotation).split(" ")).toEqual([
      "rk-annotation",
      "rk-note-mark",
      "rk-yellow",
      "rk-underline",
      "rk-wavy"
    ]);
  });

  it("can show the note line before note text is saved", () => {
    const annotation = createAnnotationRecord({
      sourceId: "src_1",
      text: "distribution",
      prefix: "decades of ",
      suffix: " dependence",
      createdAt: "2026-06-18T03:30:00.000Z"
    });

    expect(annotationClassName(annotation).split(" ")).not.toContain("rk-note-mark");
    expect(annotationClassName(annotation, { noteMark: true }).split(" ")).toContain("rk-note-mark");
  });
});

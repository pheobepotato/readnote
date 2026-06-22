import { computeToolbarPosition } from "../src/content/positioning";

describe("toolbar positioning", () => {
  it("places toolbar close to the selection end by default", () => {
    const position = computeToolbarPosition({
      selectionEndRect: { right: 320, bottom: 180, left: 260, top: 154, width: 60, height: 26 },
      toolbarSize: { width: 220, height: 36 },
      viewportSize: { width: 1000, height: 800 },
      gap: 8
    });

    expect(position).toEqual({ left: 328, top: 188 });
  });

  it("flips left when the toolbar would overflow the right edge", () => {
    const position = computeToolbarPosition({
      selectionEndRect: { right: 980, bottom: 180, left: 920, top: 154, width: 60, height: 26 },
      toolbarSize: { width: 220, height: 36 },
      viewportSize: { width: 1000, height: 800 },
      gap: 8
    });

    expect(position.left).toBe(692);
    expect(position.top).toBe(188);
  });

  it("flips above when the toolbar would overflow the bottom edge", () => {
    const position = computeToolbarPosition({
      selectionEndRect: { right: 320, bottom: 790, left: 260, top: 764, width: 60, height: 26 },
      toolbarSize: { width: 220, height: 36 },
      viewportSize: { width: 1000, height: 800 },
      gap: 8
    });

    expect(position).toEqual({ left: 328, top: 720 });
  });
});

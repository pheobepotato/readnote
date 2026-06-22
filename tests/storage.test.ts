import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAllSources,
  getSource,
  deleteAnnotations,
  listAnnotations,
  listExcerpts,
  listHighlights,
  listTranslations,
  saveAnnotation,
  saveExcerpt,
  saveHighlight,
  saveTranslations,
  saveSource,
  updateAnnotation,
  updateHighlight
} from "../src/shared/storage";
import type { AnnotationRecord, ExcerptRecord, HighlightRecord, SourceRecord, TranslationRecord } from "../src/shared/types";

type Store = Record<string, unknown>;

function installChromeStorageFake(initial: Store = {}) {
  const store: Store = { ...initial };

  vi.stubGlobal("chrome", {
    storage: {
      local: {
        async get(keys?: string | string[] | null) {
          if (keys == null) {
            return { ...store };
          }
          if (typeof keys === "string") {
            return { [keys]: store[keys] };
          }
          return Object.fromEntries(keys.map((key) => [key, store[key]]));
        },
        async set(items: Store) {
          Object.assign(store, items);
        }
      }
    }
  });

  return store;
}

const baseSource: SourceRecord = {
  id: "src_abc",
  url: "https://example.com/article",
  title: "Original Title",
  siteName: "example.com",
  capturedText: "First snapshot",
  firstReadAt: "2026-06-17T10:00:00.000Z",
  lastReadAt: "2026-06-17T10:00:00.000Z",
  tags: ["reading/source"]
};

const baseHighlight: HighlightRecord = {
  id: "hlt_abc",
  sourceId: "src_abc",
  text: "Important sentence",
  prefix: "Before ",
  suffix: " after.",
  note: "",
  translation: "",
  vocabulary: [],
  createdAt: "2026-06-17T10:05:00.000Z",
  updatedAt: "2026-06-17T10:05:00.000Z"
};

const baseAnnotation: AnnotationRecord = {
  id: "ann_abc",
  sourceId: "src_abc",
  text: "Rolex acquired Bucherer",
  prefix: "",
  suffix: " after decades",
  styles: ["yellow"],
  note: "",
  translation: "",
  savedAsExcerpt: false,
  createdAt: "2026-06-17T10:05:00.000Z",
  updatedAt: "2026-06-17T10:05:00.000Z"
};

const baseExcerpt: ExcerptRecord = {
  id: "ex_abc",
  sourceId: "src_abc",
  sourceTitle: "Original Title",
  sourceUrl: "https://example.com/article",
  text: "Rolex acquired Bucherer",
  note: "Important",
  translation: "",
  createdAt: "2026-06-17T10:06:00.000Z"
};

const baseTranslation: TranslationRecord = {
  id: "tr_abc",
  sourceId: "src_abc",
  textHash: "hash_abc",
  text: "Rolex acquired Bucherer after decades of distribution dependence.",
  translation: "劳力士在数十年依赖分销后收购了宝齐莱。",
  createdAt: "2026-06-17T10:07:00.000Z",
  updatedAt: "2026-06-17T10:07:00.000Z"
};

describe("extension storage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installChromeStorageFake();
  });

  it("saves and retrieves sources", async () => {
    await saveSource(baseSource);

    await expect(getSource("src_abc")).resolves.toEqual(baseSource);
    await expect(getAllSources()).resolves.toEqual([baseSource]);
  });

  it("preserves firstReadAt and updates lastReadAt when saving an existing source", async () => {
    await saveSource(baseSource);

    const updated = await saveSource({
      ...baseSource,
      title: "Updated Title",
      capturedText: "Updated snapshot",
      firstReadAt: "2026-06-18T00:00:00.000Z",
      lastReadAt: "2026-06-18T11:00:00.000Z"
    });

    expect(updated.firstReadAt).toBe("2026-06-17T10:00:00.000Z");
    expect(updated.lastReadAt).toBe("2026-06-18T11:00:00.000Z");
    expect(updated.title).toBe("Updated Title");
    expect(updated.capturedText).toBe("Updated snapshot");
  });

  it("adds and lists highlights by source", async () => {
    await saveHighlight(baseHighlight);

    await expect(listHighlights("src_abc")).resolves.toEqual([baseHighlight]);
    await expect(listHighlights("src_other")).resolves.toEqual([]);
  });

  it("updates note, translation, and vocabulary fields on an existing highlight", async () => {
    await saveHighlight(baseHighlight);

    const updated = await updateHighlight("src_abc", "hlt_abc", {
      note: "Remember this",
      translation: "重要句子",
      vocabulary: [{ term: "distribution", explanation: "渠道分发" }]
    });

    expect(updated?.note).toBe("Remember this");
    expect(updated?.translation).toBe("重要句子");
    expect(updated?.vocabulary).toEqual([{ term: "distribution", explanation: "渠道分发" }]);
    await expect(listHighlights("src_abc")).resolves.toEqual([updated]);
  });

  it("adds and updates annotations by source", async () => {
    const saved = await saveAnnotation(baseAnnotation);

    const updated = await updateAnnotation("src_abc", saved.id, {
      styles: ["yellow", "blue"],
      note: "This is worth saving",
      savedAsExcerpt: true
    });

    expect(updated?.styles).toEqual(["yellow", "blue"]);
    expect(updated?.note).toBe("This is worth saving");
    expect(updated?.savedAsExcerpt).toBe(true);
    await expect(listAnnotations("src_abc")).resolves.toEqual([updated]);
  });

  it("normalizes legacy annotations when listing by source", async () => {
    await saveAnnotation({
      ...baseAnnotation,
      id: "ann_legacy",
      styles: undefined,
      style: "green"
    } as unknown as AnnotationRecord);

    const annotations = await listAnnotations("src_abc");

    expect(annotations).toHaveLength(1);
    expect(annotations[0].styles).toEqual(["green"]);
    expect(annotations[0].id).toMatch(/^ann_[a-f0-9]{16}$/);
  });

  it("coalesces duplicate legacy annotations when updating", async () => {
    vi.unstubAllGlobals();
    installChromeStorageFake({
      "annotations:src_abc": [
        { ...baseAnnotation, id: "ann_old_green", styles: ["green"] },
        { ...baseAnnotation, id: "ann_old_yellow", styles: ["yellow"], note: "Legacy note" }
      ]
    });

    const [existing] = await listAnnotations("src_abc");
    expect(existing.styles).toEqual(["yellow", "green"]);

    const updated = await updateAnnotation("src_abc", existing.id, { styles: ["blue", "yellow"] });

    expect(updated?.styles).toEqual(["yellow", "blue"]);
    expect(updated?.note).toBe("Legacy note");
    const annotations = await listAnnotations("src_abc");
    expect(annotations).toHaveLength(1);
    expect(annotations[0].styles).toEqual(["yellow", "blue"]);
  });

  it("deletes page annotations without deleting saved excerpts", async () => {
    await saveAnnotation(baseAnnotation);
    await saveExcerpt(baseExcerpt);

    await deleteAnnotations("src_abc");

    await expect(listAnnotations("src_abc")).resolves.toEqual([]);
    await expect(listExcerpts()).resolves.toEqual([baseExcerpt]);
  });

  it("stores excerpts as one append-only list", async () => {
    await saveExcerpt(baseExcerpt);

    await expect(listExcerpts()).resolves.toEqual([baseExcerpt]);
  });

  it("stores page translations by source and replaces existing text hashes", async () => {
    await saveTranslations("src_abc", [baseTranslation]);
    await saveTranslations("src_abc", [
      {
        ...baseTranslation,
        translation: "更新后的中文解释",
        updatedAt: "2026-06-17T10:08:00.000Z"
      }
    ]);

    await expect(listTranslations("src_abc")).resolves.toEqual([
      {
        ...baseTranslation,
        translation: "更新后的中文解释",
        updatedAt: "2026-06-17T10:08:00.000Z"
      }
    ]);
    await expect(listTranslations("src_other")).resolves.toEqual([]);
  });
});

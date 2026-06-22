import { describe, expect, it } from "vitest";
import {
  createTranslationBatches,
  isUsableTranslationText,
  translationRecordId,
  uniqueTranslationBlocks
} from "../src/content/translation";

describe("content translation planning", () => {
  it("keeps all untranslated blocks and prioritizes the first block for fast feedback", () => {
    const blocks = Array.from({ length: 26 }, (_, index) => ({
      key: `block_${index}`,
      text: `Paragraph ${index} with enough content to translate reliably.`
    }));

    const batches = createTranslationBatches(blocks, new Set(["block_2"]), {
      firstBatchSize: 1,
      batchSize: 4
    });

    expect(batches.flat().map((block) => block.key)).toEqual([
      "block_0",
      "block_1",
      "block_3",
      "block_4",
      "block_5",
      "block_6",
      "block_7",
      "block_8",
      "block_9",
      "block_10",
      "block_11",
      "block_12",
      "block_13",
      "block_14",
      "block_15",
      "block_16",
      "block_17",
      "block_18",
      "block_19",
      "block_20",
      "block_21",
      "block_22",
      "block_23",
      "block_24",
      "block_25"
    ]);
    expect(batches[0]).toHaveLength(1);
    expect(batches[1]).toHaveLength(4);
  });

  it("creates stable translation ids from source and text", () => {
    expect(translationRecordId("src_abc", "same text")).toBe(translationRecordId("src_abc", "same text"));
    expect(translationRecordId("src_abc", "same text")).not.toBe(translationRecordId("src_other", "same text"));
  });

  it("rejects object string translations so bad cache entries can be retried", () => {
    expect(isUsableTranslationText("这是正常中文解释")).toBe(true);
    expect(isUsableTranslationText("[object Object]")).toBe(false);
    expect(isUsableTranslationText("")).toBe(false);
  });

  it("keeps every unique block for long articles instead of truncating the page", () => {
    const blocks = Array.from({ length: 220 }, (_, index) => ({
      key: `block_${index}`,
      text: `Paragraph ${index}`
    }));

    blocks.push({ key: "block_42", text: "Duplicate paragraph" });

    const unique = uniqueTranslationBlocks(blocks);

    expect(unique).toHaveLength(220);
    expect(unique.at(-1)?.key).toBe("block_219");
  });
});

import { describe, expect, test } from "vitest";

import { translateParagraphs } from "../scripts/companion-openai.mjs";

describe("companion OpenAI translation", () => {
  test("translates paragraphs through a low-cost OpenAI model", async () => {
    const requests = [];
    const fetchImpl = async (url, init) => {
      requests.push({ url, init });
      return {
        ok: true,
        async json() {
          return {
            output_text: JSON.stringify({
              translations: ["中文解释 1", "中文解释 2"]
            })
          };
        }
      };
    };

    const translations = await translateParagraphs(
      {
        source: { title: "Test", url: "https://example.com" },
        paragraphs: ["Distribution dependence matters.", "Channel control matters."]
      },
      { apiKey: "test-key", fetchImpl }
    );

    expect(translations).toEqual(["中文解释 1", "中文解释 2"]);
    expect(requests[0].url).toBe("https://api.openai.com/v1/responses");
    expect(requests[0].init.headers.authorization).toBe("Bearer test-key");
    expect(JSON.parse(requests[0].init.body).model).toBe("gpt-5.4-nano");
  });

  test("returns setup_needed when no API key is configured", async () => {
    await expect(
      translateParagraphs({ source: { title: "Test", url: "https://example.com" }, paragraphs: ["Hello"] }, { apiKey: "" })
    ).rejects.toThrow("openai_api_key_missing");
  });

  test("translates paragraphs through DeepSeek chat completions", async () => {
    const requests = [];
    const fetchImpl = async (url, init) => {
      requests.push({ url, init });
      return {
        ok: true,
        async json() {
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    translations: ["中文解释"]
                  })
                }
              }
            ]
          };
        }
      };
    };

    const translations = await translateParagraphs(
      {
        source: { title: "Test", url: "https://example.com" },
        paragraphs: ["The retail channel matters."]
      },
      { provider: "deepseek", apiKey: "deepseek-key", fetchImpl }
    );

    const body = JSON.parse(requests[0].init.body);
    expect(translations).toEqual(["中文解释"]);
    expect(requests[0].url).toBe("https://api.deepseek.com/chat/completions");
    expect(requests[0].init.headers.authorization).toBe("Bearer deepseek-key");
    expect(body.model).toBe("deepseek-v4-flash");
    expect(body.thinking).toEqual({ type: "disabled" });
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
  });

  test("normalizes object-shaped translation arrays from model output", async () => {
    const fetchImpl = async () => ({
      ok: true,
      async json() {
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  translations: [
                    { translation: "这段在讲 Shopify 的投资判断。" },
                    { text: "这里说明商家获客路径的变化。" }
                  ]
                })
              }
            }
          ]
        };
      }
    });

    const translations = await translateParagraphs(
      {
        source: { title: "Test", url: "https://example.com" },
        paragraphs: ["Shopify paragraph.", "Amazon discovery paragraph."]
      },
      { provider: "deepseek", apiKey: "deepseek-key", fetchImpl }
    );

    expect(translations).toEqual(["这段在讲 Shopify 的投资判断。", "这里说明商家获客路径的变化。"]);
  });

  test("uses MiniMax chat completions when selected explicitly", async () => {
    const requests = [];
    const fetchImpl = async (url, init) => {
      requests.push({ url, init });
      return {
        ok: true,
        async json() {
          return {
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    translations: ["中文解释"]
                  })
                }
              }
            ]
          };
        }
      };
    };

    await translateParagraphs(
      {
        source: { title: "Test", url: "https://example.com" },
        paragraphs: ["The retail channel matters."]
      },
      { provider: "minimax", apiKey: "minimax-key", fetchImpl }
    );

    const body = JSON.parse(requests[0].init.body);
    expect(requests[0].url).toBe("https://api.minimax.io/v1/chat/completions");
    expect(body.model).toBe("MiniMax-M3");
    expect(body.thinking).toEqual({ type: "disabled" });
  });

  test("reports the selected provider setup when an API key is missing", async () => {
    await expect(
      translateParagraphs(
        { source: { title: "Test", url: "https://example.com" }, paragraphs: ["Hello"] },
        { provider: "deepseek", apiKey: "" }
      )
    ).rejects.toThrow("deepseek_api_key_missing");
  });
});

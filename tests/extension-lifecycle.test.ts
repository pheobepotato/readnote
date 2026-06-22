import { describe, expect, it, vi } from "vitest";
import { isExtensionLifecycleError, settleExtensionTask } from "../src/shared/extension-lifecycle";

describe("extension lifecycle task handling", () => {
  it("recognizes Chrome extension reload and missing receiver errors", () => {
    expect(isExtensionLifecycleError(new Error("Extension context invalidated."))).toBe(true);
    expect(isExtensionLifecycleError(new Error("Could not establish connection. Receiving end does not exist."))).toBe(
      true
    );
    expect(isExtensionLifecycleError(new Error("storage quota exceeded"))).toBe(false);
  });

  it("ignores lifecycle errors without reporting them", async () => {
    const reportError = vi.fn();

    await settleExtensionTask(async () => {
      throw new Error("Extension context invalidated.");
    }, reportError);

    expect(reportError).not.toHaveBeenCalled();
  });

  it("reports unexpected errors", async () => {
    const reportError = vi.fn();
    const error = new Error("storage quota exceeded");

    await settleExtensionTask(async () => {
      throw error;
    }, reportError);

    expect(reportError).toHaveBeenCalledWith(error);
  });
});

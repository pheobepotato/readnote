import { describe, expect, test } from "vitest";

import { parseScutilProxyOutput, proxyUrlFromSettings } from "../scripts/companion-proxy.mjs";

describe("companion system proxy detection", () => {
  test("uses the enabled macOS HTTPS proxy as an HTTP CONNECT proxy", () => {
    const settings = parseScutilProxyOutput(`
<dictionary> {
  HTTPEnable : 1
  HTTPPort : 8001
  HTTPProxy : 127.0.0.1
  HTTPSEnable : 1
  HTTPSPort : 8001
  HTTPSProxy : 127.0.0.1
  SOCKSEnable : 1
  SOCKSPort : 1081
  SOCKSProxy : 127.0.0.1
}
`);

    expect(proxyUrlFromSettings(settings)).toBe("http://127.0.0.1:8001");
  });

  test("prefers explicit proxy environment over macOS settings", () => {
    const settings = parseScutilProxyOutput("HTTPSEnable : 1\nHTTPSProxy : 127.0.0.1\nHTTPSPort : 8001");

    expect(proxyUrlFromSettings(settings, { HTTPS_PROXY: "http://127.0.0.1:9000" })).toBe("http://127.0.0.1:9000");
  });
});

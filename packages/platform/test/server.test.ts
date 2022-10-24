import { describe, it, expect } from "vitest";
import * as platform from "../src";

describe("platform", () => {
  it("should work on the server", () => {
    //
    // Devices
    //

    expect(platform.isAndroid).toBe(false);
    expect(platform.isWindows).toBe(false);
    expect(platform.isMac).toBe(false);
    expect(platform.isIPhone).toBe(false);
    expect(platform.isIPad).toBe(false);
    expect(platform.isIPod).toBe(false);
    expect(platform.isIOS).toBe(false);
    expect(platform.isAppleDevice).toBe(false);
    expect(platform.isMobile).toBe(false);

    //
    // Browsers
    //

    expect(platform.isFirefox).toBe(false);
    expect(platform.isOpera).toBe(false);
    expect(platform.isSafari).toBe(false);
    expect(platform.isIE).toBe(false);
    expect(platform.isChromium).toBe(false);
    expect(platform.isEdge).toBe(false);
    expect(platform.isChrome).toBe(false);

    //
    // Rendering Engines
    //

    expect(platform.isGecko).toBe(false);
    expect(platform.isBlink).toBe(false);
    expect(platform.isWebKit).toBe(false);
    expect(platform.isPresto).toBe(false);
    expect(platform.isTrident).toBe(false);
    expect(platform.isEdgeHTML).toBe(false);
  });
});

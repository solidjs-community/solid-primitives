import { __permissions__ } from "./setup.js";

import { createRoot, flush } from "solid-js";
import { it, describe, expect } from "vitest";
import { createPermission } from "../src/index.js";

describe("createPermission", () => {
  it("reads permission", async () => {
    const { permission, dispose } = createRoot(dispose => {
      const permission = createPermission("microphone" as PermissionName);
      return { permission, dispose };
    });

    expect(permission()).toBe("unknown");

    await Promise.resolve();
    flush();
    expect(permission()).toBe("granted");

    dispose();
  });

  it("reads permission updates", async () => {
    const { permission, dispose } = createRoot(dispose => {
      const permission = createPermission("camera" as PermissionName);
      return { permission, dispose };
    });

    expect(permission()).toBe("unknown");

    await Promise.resolve();
    flush();
    expect(permission()).toBe("denied");

    __permissions__.camera.__dispatchEvent("granted");
    flush();
    expect(permission()).toBe("granted");

    dispose();
  });
});

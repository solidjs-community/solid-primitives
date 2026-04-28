import { __permissions__ } from "./setup.js";

import { createEffect, createRoot, flush } from "solid-js";
import { it, describe, expect } from "vitest";
import { createPermission } from "../src/index.js";

describe("createPermission", () => {
  it("reads permission", async () => {
    let captured: unknown;

    const dispose = createRoot(dispose => {
      const permission = createPermission("microphone" as PermissionName);

      createEffect(permission, (state) => {
        captured = state;
      });

      return dispose;
    });

    flush();
    
    expect(captured).toEqual("unknown");

    await Promise.resolve();
    flush();
    
    expect(captured).toEqual("granted");

    dispose();
  });

  it("reads permission updates", async () => {
    let captured: unknown;

    const dispose = createRoot(dispose => {
      const permission = createPermission("camera" as PermissionName);

      createEffect(permission, (state) => {
        captured = state;
      });

      return dispose;
    });

    flush();
    
    expect(captured).toEqual("unknown");

    await Promise.resolve();
    flush();
    expect(captured).toEqual("denied");

    __permissions__.camera.__dispatchEvent("granted");
    flush();
    expect(captured).toEqual("granted");

    dispose();
  });
});

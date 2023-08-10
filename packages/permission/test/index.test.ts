import { __permissions__ } from "./setup.js";

import { createEffect, createRoot } from "solid-js";
import { it, describe, expect } from "vitest";
import { createPermission } from "../src/index.js";

describe("createPermission", () => {
  it("reads permission", async () => {
    let captured: unknown;

    const dispose = createRoot(dispose => {
      const permission = createPermission("microphone" as PermissionName);

      createEffect(() => {
        captured = permission();
      });

      return dispose;
    });

    expect(captured).toEqual("unknown");

    await Promise.resolve();
    expect(captured).toEqual("granted");

    dispose();
  });

  it("reads permission updates", async () => {
    let captured: unknown;

    const dispose = createRoot(dispose => {
      const permission = createPermission("camera" as PermissionName);

      createEffect(() => {
        captured = permission();
      });

      return dispose;
    });

    expect(captured).toEqual("unknown");

    await Promise.resolve();
    expect(captured).toEqual("denied");

    __permissions__.camera.__dispatchEvent("granted");
    expect(captured).toEqual("granted");

    dispose();
  });
});

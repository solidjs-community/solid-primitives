import { __permissions__ } from "./setup.js";
import { createEffect, createRoot } from "solid-js";
import { it, describe, expect } from "vitest";
import { createPermission } from "../src/index.js";

describe("permission", () => {
  it("reads permission", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        const permission = createPermission("microphone" as PermissionName);
        const expectedStates = ["unknown", "granted"];
        createEffect(() => {
          expect(permission()).toBe(expectedStates.shift());
          if (expectedStates.length === 0) {
            dispose();
            resolve();
          }
        });
      }),
    ));

  it("reads permission updates", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        const permission = createPermission("camera" as PermissionName);
        const expectedStates = ["unknown", "denied", "granted"];
        createEffect(() => {
          expect(permission()).toBe(expectedStates.shift());
          if (expectedStates.length === 2) {
            setTimeout(() => {
              __permissions__.camera.__dispatchEvent("granted");
            }, 50);
          } else if (expectedStates.length === 0) {
            dispose();
            resolve();
          }
        });
      }),
    ));
});

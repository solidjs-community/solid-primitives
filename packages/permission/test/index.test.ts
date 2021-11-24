import { __permissions__ } from "./setup";
import { createEffect, createRoot } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { createPermission } from "../src";

test("reads permission", () =>
  new Promise<void>(resolve =>
    createRoot(dispose => {
      const permission = createPermission("microphone" as PermissionName);
      const expectedStates = ["unknown", "granted"];
      createEffect(() => {
        assert.is(permission(), expectedStates.shift());
        if (expectedStates.length === 0) {
          dispose();
          resolve();
        }
      });
    })
  ));

test("reads permission updates", () =>
  new Promise<void>(resolve =>
    createRoot(dispose => {
      const permission = createPermission("camera" as PermissionName);
      const expectedStates = ["unknown", "denied", "granted"];
      createEffect(() => {
        assert.is(permission(), expectedStates.shift());
        if (expectedStates.length === 2) {
          setTimeout(() => {
            __permissions__.camera.__dispatchEvent("granted");
          }, 50);
        } else if (expectedStates.length === 0) {
          dispose();
          resolve();
        }
      });
    })
  ));

test.run();

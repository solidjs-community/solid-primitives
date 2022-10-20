import { describe, expect, it } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createEventProps } from "../src/index";

describe('event-props', () => {
  //# test type errors - run `yarn typecheck to find them`
  //- will expect at least 1 argument
  //@ts-expect-error
  createEventProps();
  //- will only accept HTMLElementEvent names
  //@ts-expect-error
  createEventProps("foobar");
  //- will only contain given names in props and store
  const [store, props] = createEventProps("focus", "blur");
  //@ts-expect-error
  store.click;
  //@ts-expect-error
  props.onclick?.(new MouseEvent("click"));

  it("it will support multiple events", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        const [store, props] = createEventProps("keydown", "keyup");
        props.onkeydown(new KeyboardEvent("keydown", { key: "A" }));
        props.onkeyup(new KeyboardEvent("keyup", { key: "A" }));
        const expected = [undefined, "A"];
        createEffect(() => {
          expect(store.keydown?.key).toBe("A");
          expect(store.keyup?.key).toBe("A");
          dispose();
          resolve();
        });
      })
    ));
});

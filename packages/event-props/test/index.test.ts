import { describe, expect, it } from "vitest";
import { createRoot, flush } from "solid-js";
import { createEventProps } from "../src/index.js";

describe("event-props", () => {
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

  it("it will support multiple events", () => {
    // Signal writes from event handlers are always outside any reactive scope
    // in production (DOM events fire asynchronously). Mirror that here by
    // returning the primitives from createRoot and calling handlers outside it.
    const [[store, props], dispose] = createRoot(
      d => [createEventProps("keydown", "keyup"), d] as const,
    );

    props.onkeydown(new KeyboardEvent("keydown", { key: "A" }));
    props.onkeyup(new KeyboardEvent("keyup", { key: "A" }));
    flush();

    expect(store.keydown?.key).toBe("A");
    expect(store.keyup?.key).toBe("A");

    dispose();
  });
});

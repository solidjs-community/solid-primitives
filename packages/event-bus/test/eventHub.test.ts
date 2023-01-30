import { describe, test, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createEventBus, createEventHub, createEventStack } from "../src";

const syncTest = (name: string, fn: (dispose: () => void) => void) =>
  test(name, () =>
    createRoot(dispose => {
      fn(dispose);
      dispose();
    })
  );

describe("createEventHub", () => {
  syncTest("listening and emiting", () => {
    const hub = createEventHub($ => ({
      busA: $<number>(),
      busB: $<string>()
    }));

    const cbA = vi.fn();
    const cbB = vi.fn();
    const cbAny = vi.fn();

    hub.on("busA", cbA);
    hub.on("busB", cbB);
    hub.listen(cbAny);

    hub.emit("busA", 0);
    hub.busA.emit(1);
    hub.emit("busB", "foo");
    hub.busB.emit("bar");

    expect(cbA).toBeCalledTimes(2);
    expect(cbA).nthCalledWith(1, 0);
    expect(cbA).nthCalledWith(2, 1);

    expect(cbB).toBeCalledTimes(2);
    expect(cbB).nthCalledWith(1, "foo");
    expect(cbB).nthCalledWith(2, "bar");

    expect(cbAny).toBeCalledTimes(4);
    expect(cbAny).nthCalledWith(1, { name: "busA", details: 0 });
    expect(cbAny).nthCalledWith(2, { name: "busA", details: 1 });
    expect(cbAny).nthCalledWith(3, { name: "busB", details: "foo" });
    expect(cbAny).nthCalledWith(4, { name: "busB", details: "bar" });
  });

  syncTest("accessing values", () => {
    const hub = createEventHub({
      busA: createEventBus<void>(),
      busB: createEventStack<{ text: string }>()
    });

    expect(hub.store.busA).toBe(undefined);
    expect(hub.store.busB).instanceOf(Array);
    expect(hub.store.busB.length).toBe(0);

    hub.emit("busA");
    hub.emit("busB", { text: "bar" });

    expect(hub.store.busA).toBe(undefined);
    expect(hub.store.busB).toEqual([{ text: "bar" }]);
  });
});

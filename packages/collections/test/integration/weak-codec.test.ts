import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import {
  createSerializer,
  createJSONDeserializer,
  serializeJSON,
  getLocalHeaderScript,
} from "@solidjs/web/serialization";
import { WeakCollectionTokenPlugin } from "@solid-primitives/collections/serialization";
import { createWeakCollectionToken, isWeakCollectionToken } from "../../src/weak-token.js";

function source() {
  const key = { tag: "shared" };
  const value = { key, date: new Date(1234), self: undefined as unknown };
  value.self = value;
  return {
    key,
    value,
    metadata: createWeakCollectionToken(key, key),
    token: createWeakCollectionToken(key, value),
    missing: Object.freeze({ $weak: true, ref: undefined, values: new WeakMap() }),
    undefined: createWeakCollectionToken(key, undefined),
  };
}

function verify(value: ReturnType<typeof source>) {
  expect(value.metadata.ref?.deref()).toBe(value.key);
  expect(value.metadata.values.get(value.key)).toBe(value.key);
  expect(value.token.ref?.deref()).toBe(value.key);
  expect(value.token.values.get(value.key)).toBe(value.value);
  expect(value.value.key).toBe(value.key);
  expect(value.value.self).toBe(value.value);
  expect(value.value.date.getTime()).toBe(1234);
  expect(value.missing.ref).toBeUndefined();
  expect(value.undefined.values.has(value.key)).toBe(true);
  expect(value.undefined.values.get(value.key)).toBeUndefined();
  expect(Object.isFrozen(value.token)).toBe(true);
}

async function collect() {
  expect(typeof globalThis.gc).toBe("function");
  for (let i = 0; i < 10; i++) {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    globalThis.gc!();
  }
}

function decodeWeakOnlyJSON() {
  const decode = createJSONDeserializer({ plugins: [WeakCollectionTokenPlugin] });
  let token: ReturnType<typeof source>["token"];
  serializeJSON(source().token, {
    plugins: [WeakCollectionTokenPlugin],
    onParse: node => {
      token = decode(JSON.parse(JSON.stringify(node)));
    },
    onError: error => {
      throw error;
    },
  });
  return { token: token!, owner: { decode: decode as typeof decode | undefined } };
}

function decodeWeakOnlyScript() {
  const scripts: string[] = [];
  const serializer = createSerializer({
    globalIdentifier: "self.data",
    plugins: [WeakCollectionTokenPlugin],
    onData: script => scripts.push(script),
    onError: error => {
      throw error;
    },
  });
  serializer.write("entry", source().token);
  serializer.close();
  const context = {
    data: {} as Record<string, ReturnType<typeof source>["token"]>,
    self: undefined as unknown,
    $R: undefined as unknown,
  };
  context.self = context;
  runInNewContext(getLocalHeaderScript() + scripts.join(";"), context);
  return { token: context.data.entry!, context };
}

describe("weak leaf transport", () => {
  it("reconstructs script values without a client runtime or custom globals", () => {
    const scripts: string[] = [];
    const serializer = createSerializer({
      globalIdentifier: "self.data",
      plugins: [WeakCollectionTokenPlugin],
      onData: script => scripts.push(script),
      onError: error => {
        throw error;
      },
    });
    serializer.write("entry", source());
    serializer.close();
    const context = {
      data: {} as Record<string, ReturnType<typeof source>>,
      self: undefined as unknown,
    };
    context.self = context;
    runInNewContext(getLocalHeaderScript() + scripts.join(";"), context);
    verify(context.data.entry!);
  });

  it("preserves shared key/value identity in JSON codec", async () => {
    const decode = createJSONDeserializer({ plugins: [WeakCollectionTokenPlugin] });
    const result = await new Promise<ReturnType<typeof source>>((resolve, reject) => {
      let value: ReturnType<typeof source>;
      serializeJSON(source(), {
        plugins: [WeakCollectionTokenPlugin],
        onParse(node, initial) {
          const decoded = decode(JSON.parse(JSON.stringify(node)));
          if (initial) value = decoded as ReturnType<typeof source>;
        },
        onDone: () => resolve(value),
        onError: reject,
      });
    });
    verify(result);
    expect(isWeakCollectionToken(result.token)).toBe(true);
  });

  it("requires codec registration rather than silently dropping weak state", () => {
    const serializer = createSerializer({
      globalIdentifier: "self.data",
      onData() {},
      onError: error => {
        throw error;
      },
    });
    expect(() => serializer.write("entry", source())).toThrow();
  });

  it("records JSON reference-table retention and releases keys when the decoder is released", async () => {
    const decoded = decodeWeakOnlyJSON();
    await collect();
    expect(decoded.token.ref?.deref()).toBeDefined();
    decoded.owner.decode = undefined;
    await collect();
    expect(decoded.token.ref?.deref()).toBeUndefined();
  });

  it("records script reference-table retention and proves tokens become weak after scope release", async () => {
    const decoded = decodeWeakOnlyScript();
    await collect();
    expect(decoded.token.ref?.deref()).toBeDefined();
    // Characterization only: a primitive must not clear this shared table;
    // other hydration consumers or later stream patches may still need it.
    (decoded.context.$R as unknown[]).length = 0;
    decoded.context.$R = undefined;
    await collect();
    expect(decoded.token.ref?.deref()).toBeUndefined();
  });
});

// Optional server/transport entry: importing the token runtime does not import the serializer.
import { createPlugin, type SerovalNode, type SerializerPlugin } from "@solidjs/web/serialization";
import {
  isWeakCollectionToken,
  createWeakCollectionToken,
  type WeakCollectionToken,
} from "./weak-token.js";

function snapshot(token: WeakCollectionToken<WeakKey, unknown>): [] | [WeakKey, unknown] {
  const key = token.ref?.deref();
  return key === undefined ? [] : [key, token.values.get(key)];
}

function restore(entry: [] | [WeakKey, unknown]): WeakCollectionToken<WeakKey, unknown> {
  return entry.length
    ? createWeakCollectionToken(entry[0], entry[1])
    : Object.freeze({ $weak: true, ref: undefined, values: new WeakMap() });
}

/** Pass to the renderer's `plugins` option; JSON codecs need it on both peers. */
export const WeakCollectionTokenPlugin: SerializerPlugin<
  WeakCollectionToken<WeakKey, unknown>,
  { entry: SerovalNode }
> = createPlugin({
  tag: "@solid-primitives/weak-collection-token/v1",
  test: isWeakCollectionToken,
  parse: {
    sync: (token, context) => ({ entry: context.parse(snapshot(token)) }),
    stream: (token, context) => ({ entry: context.parse(snapshot(token)) }),
    async: async (token, context) => ({ entry: await context.parse(snapshot(token)) }),
  },
  serialize: (node, context) =>
    `(function(e){return Object.freeze({$weak:true,ref:e.length?new WeakRef(e[0]):void 0,values:new WeakMap(e.length?[e]:[])})})(${context.serialize(node.entry)})`,
  deserialize: (node, context) => restore(context.deserialize(node.entry)),
});

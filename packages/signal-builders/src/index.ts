import { access, MaybeAccessor } from "@solid-primitives/utils";
import * as _ from "@solid-primitives/immutable";
import { Accessor, createMemo } from "solid-js";

// CONVERT
export * from "./convert";

// STRING
export const stringConcat = (...a: MaybeAccessor<any>[]): Accessor<string> =>
  createMemo(() => a.reduce((t: string, c) => t + access(c), "") as string);

// NUMBER
export * from "./number";

// ARRAY
export * from "./array";

// OBJECT
export * from "./object";
export * from "./update";

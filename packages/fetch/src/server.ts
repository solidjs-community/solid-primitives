import fetch from "node-fetch";

if (!globalThis.fetch) {
  Object.assign(globalThis, { fetch });
}

export * from "./index";

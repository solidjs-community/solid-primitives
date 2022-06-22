import { Resource } from "solid-js";
import * as API from "./index";

export const makeClipboard: typeof API.makeClipboard = () => [
  async (_data: string | ClipboardItem[]) => { /*noop*/ },
  async () => Promise.resolve(undefined),
  (_data, _type) => ({} as ClipboardItem)
];
export const createClipboard: typeof API.createClipboard = (..._a: any[]) => [
  {} as Resource<ClipboardItems | undefined>,
  () => { /** noop */ }
];
export const copyToClipboard: typeof API.copyToClipboard = () => {};

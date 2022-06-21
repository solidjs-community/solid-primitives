import * as API from "./index";

export const makeClipboard: typeof API.makeClipboard = () => [
  async (_data: string | ClipboardItem[]) => { /*noop*/ },
  async () => '',
  (_data, _type) => ({} as ClipboardItem)
];
export const createClipboard: typeof API.createClipboard = (..._a: any[]) => () => '';
export const copyToClipboard: typeof API.copyToClipboard = () => {};

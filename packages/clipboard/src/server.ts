import * as api from "./index";

const createClipboard: typeof api.default = (...a: any[]) => [
  () => undefined as unknown as Promise<void>,
  () => undefined as unknown as Promise<undefined>,
  {
    newItem: () => ({} as ClipboardItem)
  }
];
export default createClipboard;

export const copyToClipboard: typeof api.copyToClipboard = () => {};

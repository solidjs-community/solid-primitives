import type { ClipboardSetter } from './index';

export const createClipboard = (): [
  write: ClipboardSetter,
  read: () => Promise<ClipboardItems | undefined>,
  helpers: {
    newItem: (data: ClipboardItemData, type: string) => ClipboardItem | undefined;
  }
] => {
  return [
    async (_data: string | ClipboardItem[]) => {
      /*noop*/
    },
    async () => {
      return undefined;
    },
    {
      newItem: (_data: ClipboardItemData, _type: string) => {
        /*noop*/
        return undefined;
      }
    }
  ];
};

export const copyToClipboard = (
  _el: Element,
  _options: () => {
    value?: any;
    setter?: ClipboardSetter;
    highlight: boolean;
  }
) => {
  /*noop*/
}

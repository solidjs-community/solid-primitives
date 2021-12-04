const createClipboard = (): [
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
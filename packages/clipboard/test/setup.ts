let clipboardEntries: ClipboardItems = [];
export const getLastClipboardEntry = () => clipboardEntries[clipboardEntries.length - 1];

// @ts-ignore
const mock: typeof navigator.clipboard = {
  readText: () => new Promise(res => res('')),
  addEventListener: () => {},
  removeEventListener: () => {},
  read: async () => clipboardEntries,
  writeText: test =>
    new Promise(res => {
      clipboardEntries.push(new ClipboardItem({ test }));
      res();
    })
};

Object.assign(window.navigator, { clipboard: mock });

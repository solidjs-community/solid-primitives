const clipboardEntries: string[] = [];
export const getLastClipboardEntry = () => clipboardEntries[clipboardEntries.length - 1];

// @ts-ignore
const mock: typeof navigator.clipboard = {
  readText: () => new Promise(res => res(getLastClipboardEntry())),
  writeText: test =>
    new Promise(res => {
      clipboardEntries.push(test);
      res();
    })
};

Object.assign(window.navigator, { clipboard: mock });

import "regenerator-runtime/runtime";

// Implement mock ClipboardItem
class ClipboardItem {
  value: any;
  type: string = 'text/plain';
  types: string[];
  constructor(value) {
    return this.value = value;
  }
  text() {
    return this.value;
  }
  async getType(type: string) {
    this.type = type;
    return new Blob([this.value], { type });
  }
}

// Implement mock Blob
class Blob {
  value: any;
  type: string;
  size: number;
  constructor(value, { type }: { type: string}) {
    this.value = value[0];
    this.type = type;
  }
  async text() {
    return this.value;
  }
  slice(_start: number, _end: number) {
    return new Blob([], { type: this.type });
  }
  stream(): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>();
  }
  async arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
}

let clipboardEntries: ClipboardItems = [
  new ClipboardItem('InitialValue')
];
export const getLastClipboardEntry = () => clipboardEntries[clipboardEntries.length - 1];

const clipboard: typeof navigator.clipboard = {
  addEventListener: () => {},
  removeEventListener: () => {},
  read: async () => {
    return clipboardEntries;
  },
  readText: async () => new Promise(res => res('Hello')),
  writeText: value =>
    new Promise(res => {
      clipboardEntries = [new ClipboardItem(value)];
      res();
    }),
  write: value =>
    new Promise(res => {
      clipboardEntries = value;
      res();
    }),
    dispatchEvent: (_event: Event) => true
};

Object.assign(global.navigator, { clipboard });

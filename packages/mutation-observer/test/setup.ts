export const instances: MutationObserver[] = [];

export const getLastInstance = () => instances[instances.length - 1];

const exampleElements = [
  document.createElement("div"),
  document.createElement("span"),
  document.createElement("p"),
  document.createElement("li"),
  document.createElement("button"),
  document.createElement("img"),
];

const createMockMutationRecord = (
  target: Node = exampleElements[Math.floor(Math.random() * exampleElements.length)],
  type: MutationRecordType = "childList",
): MutationRecord => {
  return {
    addedNodes: (Math.random() > 0.5
      ? [exampleElements[Math.floor(Math.random() * exampleElements.length)]]
      : []) as any,
    attributeName: "test",
    attributeNamespace: "test",
    nextSibling: null,
    oldValue: null,
    previousSibling: null,
    removedNodes: (Math.random() > 0.5
      ? [exampleElements[Math.floor(Math.random() * exampleElements.length)]]
      : []) as any,
    target,
    type,
  };
};

// @ts-ignore
export class MutationObserver {
  public elements: [Node, MutationObserverInit][] = [];
  public records: MutationRecord[] = [];
  private abortCallbacks: (() => void)[] = [];

  constructor(public callback: MutationCallback) {
    instances.push(this);
  }

  disconnect() {
    this.records = [];
    this.elements = [];
    this.__abort();
  }
  observe(el: Node, options: MutationObserverInit) {
    this.elements.push([el, options]);
  }
  takeRecords(): MutationRecord[] {
    const records = this.records;
    this.records = [];
    this.__abort();
    return records;
  }

  __abort() {
    this.abortCallbacks.forEach(cb => cb());
    this.abortCallbacks = [];
  }
  __simulateMutation() {
    if (this.elements.length === 0) return;

    this.records.push(...this.elements.map(([node]) => createMockMutationRecord(node)));

    let isAborted = false;
    const stop = () => {
      isAborted = true;
    };
    this.abortCallbacks.push(stop);

    queueMicrotask(() => {
      if (!isAborted) {
        this.callback(this.records, this);
        this.records = [];
        this.abortCallbacks.splice(this.abortCallbacks.indexOf(stop), 1);
        stop();
      }
    });

    return stop;
  }
}
global.MutationObserver = MutationObserver;

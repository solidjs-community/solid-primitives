export const instances: MutationObserver[] = [];

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
  public records: [Node, MutationObserverInit][] = [];
  constructor(public callback: MutationCallback) {
    instances.push(this);
  }
  disconnect() {
    this.records = [];
  }
  observe(el: Node, options: MutationObserverInit) {
    this.records.push([el, options]);
  }
  takeRecords(): MutationRecord[] {
    return this.records.map(([node]) => createMockMutationRecord(node));
  }
}
global.MutationObserver = MutationObserver;

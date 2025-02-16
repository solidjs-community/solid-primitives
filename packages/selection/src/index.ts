import { Accessor, createEffect, createSignal, onCleanup, Setter } from "solid-js";
import { isServer } from "solid-js/web";

export type HTMLSelection = [node: HTMLElement | null, start: number, end: number];

export const getTextNodes = (startNode: Node) => {
  const textNodes: Node[] = [];
  const walkNodes = (node: Node) => {
    node instanceof Text && textNodes.push(node);
    node.firstChild && walkNodes(node.firstChild);
    node.nextSibling && walkNodes(node.nextSibling);
  };
  walkNodes(startNode);
  return textNodes;
};

const addNodeLength = (length: number, node: Node) => length + (node as Text).data.length;

const getRangePos = (container: Node, offset: number, texts: Node[]) => {
  const index = texts.findIndex(text => text === container || text.parentElement === container);
  return index === -1 ? NaN : texts.slice(0, index).reduce(addNodeLength, 0) + offset;
};

const getParent = (node: Node | null): Node | null =>
  node === null || (node as HTMLElement).contentEditable === "true"
    ? node
    : getParent(node.parentNode || null);

const getRangeArgs = (offset: number, texts: Node[]): [node: Node | null, offset: number] =>
  texts.reduce(
    ([node, pos], text) =>
      node
        ? [node, pos]
        : pos <= (text as Text).data.length
          ? [text, pos]
          : [null, pos - (text as Text).data.length],
    [null, offset] as [node: Node | null, pos: number],
  );

export const createSelection = (): [Accessor<HTMLSelection>, Setter<HTMLSelection>] => {
  if (isServer) {
    return [
      () => [null, NaN, NaN],
      sel => (typeof sel === "function" ? sel([null, NaN, NaN]) : sel),
    ];
  }
  const [getSelection, setSelection] = createSignal<HTMLSelection>([null, NaN, NaN]);
  const [selected, setSelected] = createSignal<HTMLSelection>([null, NaN, NaN]);
  const selectionHandler = () => {
    const active = document.activeElement;
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
      return setSelection([active, active.selectionStart ?? NaN, active.selectionEnd ?? NaN]);
    }
    const selection = window.getSelection();
    if (!selection?.rangeCount) {
      return setSelection([null, NaN, NaN]);
    }
    const range = selection.getRangeAt(0);
    const parent = getParent(range.commonAncestorContainer);
    if (!parent) {
      return setSelection([null, NaN, NaN]);
    }
    const texts = getTextNodes(parent);
    const startPosition = getRangePos(range.startContainer, range.startOffset, texts);
    const endPosition = range.collapsed
      ? startPosition
      : getRangePos(range.endContainer, range.endOffset, texts);
    setSelection([parent as HTMLElement, startPosition, endPosition]);
  };
  selectionHandler();
  createEffect(() => {
    document.addEventListener("selectionchange", selectionHandler);
    document.addEventListener("click", selectionHandler);
    document.addEventListener("keyup", selectionHandler);
    onCleanup(() => {
      document.removeEventListener("selectionchange", selectionHandler);
      document.removeEventListener("click", selectionHandler);
      document.removeEventListener("keyup", selectionHandler);
    });
  });
  createEffect(() => {
    const [node, start, end] = selected();
    const selection = window.getSelection();
    if (node === null) {
      selection?.rangeCount && selection.removeAllRanges();
    } else if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
      document.activeElement !== node && node.focus();
      node.setSelectionRange(start, end);
    } else {
      selection?.removeAllRanges();
      const range = document.createRange();
      const texts = getTextNodes(node);
      const [startNode, startPos] = getRangeArgs(start, texts);
      const [endNode, endPos] = start === end ? [startNode, startPos] : getRangeArgs(end, texts);
      if (startNode && endNode && startPos !== -1 && endPos !== -1) {
        range.setStart(startNode, startPos);
        range.setEnd(endNode, endPos);
        selection?.addRange(range);
      }
    }
  });
  return [getSelection, setSelected];
};

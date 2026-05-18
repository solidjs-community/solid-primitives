import { vi } from "vitest";

/**
 * Creates a bidirectional in-process message channel that lets
 * createReactiveWorker and workerScope talk to each other without a real Worker.
 *
 * Messages posted before a listener is registered are queued and flushed
 * as soon as the listener is added — matching real Worker behaviour.
 */
export function makeChannel() {
  let workerListeners: ((e: MessageEvent) => void)[] = [];
  let mainListeners: ((e: MessageEvent) => void)[] = [];
  const pendingToWorker: unknown[] = [];

  function dispatch(data: unknown, listeners: ((e: MessageEvent) => void)[]) {
    listeners.forEach(h => h(new MessageEvent("message", { data })));
  }

  // Returned by `new Worker(url)` — held by createReactiveWorker
  const workerObj = {
    postMessage: vi.fn((data: unknown) => {
      if (workerListeners.length) {
        dispatch(data, workerListeners);
      } else {
        pendingToWorker.push(data);
      }
    }),
    addEventListener: vi.fn((type: string, h: (e: MessageEvent) => void) => {
      if (type === "message") mainListeners.push(h);
    }),
    removeEventListener: vi.fn((type: string, h: (e: MessageEvent) => void) => {
      mainListeners = mainListeners.filter(l => l !== h);
    }),
    terminate: vi.fn(),
  };

  // Replaces `self` inside workerScope
  const selfObj = {
    postMessage: vi.fn((data: unknown) => dispatch(data, mainListeners)),
    addEventListener: vi.fn((type: string, h: (e: MessageEvent) => void) => {
      if (type !== "message") return;
      workerListeners.push(h);
      // Flush messages that arrived before this listener was attached
      pendingToWorker.splice(0).forEach(d => h(new MessageEvent("message", { data: d })));
    }),
    removeEventListener: vi.fn((type: string, h: (e: MessageEvent) => void) => {
      workerListeners = workerListeners.filter(l => l !== h);
    }),
  };

  return { workerObj, selfObj };
}

export {
  makeSSE,
  createSSE,
  makeSSEAsyncIterable,
  createSSEStream,
  SSEReadyState,
  type SSEOptions,
  type SSEReconnectOptions,
  type SSESourceHandle,
  type SSESourceFn,
  type SSEReadyStateValue,
  type CreateSSEOptions,
  type SSEReturn,
  type CreateSSEStreamOptions,
} from "./sse.js";

export { json, ndjson, lines, number, safe, pipe } from "./transform.js";

// Re-export Solid 2.0 async primitives commonly used with SSE primitives:
// - isPending(() => data()) — true during stale-while-revalidating (not initial load)
// - onSettled(() => ...) — runs when the first message arrives
// - NotReadyError — thrown by data() while pending (caught by <Loading>)
export { isPending, onSettled, NotReadyError } from "solid-js";

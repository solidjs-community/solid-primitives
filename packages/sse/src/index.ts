export {
  makeSSE,
  createSSE,
  SSEReadyState,
  type SSEOptions,
  type SSEReconnectOptions,
  type SSESourceHandle,
  type SSESourceFn,
  type SSEReadyStateValue,
  type CreateSSEOptions,
  type SSEReturn,
} from "./sse.js";

export { json, ndjson, lines, number, safe, pipe } from "./transform.js";

// Re-export Solid 2.0 async primitives commonly used with createSSE:
// - isPending(data) — true while awaiting the first SSE message
// - onSettled(() => ...) — runs when the first message arrives
// - NotReadyError — thrown by data() while pending (caught by <Suspense>)
export { isPending, onSettled, NotReadyError } from "solid-js";

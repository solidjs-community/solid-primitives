import { createSignal } from "solid-js";
import { tryOnCleanup, INTERNAL_OPTIONS, isServer, createIdGenerator } from "@solid-primitives/utils";
import { makeQueue } from "@solid-primitives/queue";
import type {
  AnyPayload,
  AnalyticsPlugin,
  AnalyticsOptions,
  AnalyticsControls,
  ReactiveAnalyticsControls,
  PageProperties,
  TrackProperties,
  IdentifyTraits,
  PagePayload,
  TrackPayload,
  IdentifyPayload,
} from "./types.js";



const generateId = createIdGenerator();

function buildPagePayload(properties: PageProperties): PagePayload {
  const defaults: PageProperties = !isServer
    ? { path: window.location.pathname, url: window.location.href, title: document.title, referrer: document.referrer }
    : {};
  return {
    type: "page",
    properties: { ...defaults, ...properties },
    meta: { rid: generateId(), ts: Date.now() },
  };
}

function buildTrackPayload(event: string, properties: TrackProperties): TrackPayload {
  return { type: "track", event, properties, meta: { rid: generateId(), ts: Date.now() } };
}

function buildIdentifyPayload(userId: string, traits: IdentifyTraits): IdentifyPayload {
  return { type: "identify", userId, traits, meta: { rid: generateId(), ts: Date.now() } };
}

/**
 * Send a payload to a single plugin.
 * Returns `true` if the plugin processed the event, `false` if it aborted.
 */
async function invokePlugin(plugin: AnalyticsPlugin, payload: AnyPayload): Promise<boolean> {
  const config = plugin.config ?? {};
  let aborted = false;
  const abort = (): void => { aborted = true; };
  try {
    if (payload.type === "page" && plugin.page) {
      await plugin.page({ payload, config, abort });
    } else if (payload.type === "track" && plugin.track) {
      await plugin.track({ payload, config, abort });
    } else if (payload.type === "identify" && plugin.identify) {
      await plugin.identify({ payload, config, abort });
    }
  } catch {
    // Individual plugin errors never stop the pipeline.
  }
  return !aborted;
}

/**
 * Send a payload through all ready plugins sequentially.
 * A plugin that calls abort() stops subsequent plugins from receiving the event.
 */
async function dispatchSequential(plugins: AnalyticsPlugin[], payload: AnyPayload): Promise<void> {
  for (const plugin of plugins) {
    if (!await invokePlugin(plugin, payload)) break;
  }
}

/** Minimal queue interface used by buildCore — a subset of Queue<T>. */
type EventBuffer = {
  readonly size: number;
  readonly isEmpty: boolean;
  add(item: AnyPayload): void;
  remove(): AnyPayload | undefined;
  clear(): void;
};

/** Internal engine — shared by makeAnalytics and createAnalytics. */
function buildCore(queue: EventBuffer, options: AnalyticsOptions) {
  const { queueLimit = 100, retryInterval = 500, drainInterval, drainSize } = options;
  const batching = drainInterval != null;
  const plugins: AnalyticsPlugin[] = [];
  const initialized = new Set<string>();
  const inflight = new Set<Promise<void>>();
  let pollTimer: ReturnType<typeof setInterval> | undefined;
  let drainTimer: ReturnType<typeof setInterval> | undefined;

  function trackInflight(p: Promise<void>): void {
    inflight.add(p);
    void p.finally(() => inflight.delete(p));
  }

  function isReady(plugin: AnalyticsPlugin): boolean {
    return initialized.has(plugin.name) && (plugin.loaded == null || plugin.loaded());
  }

  function allReady(): boolean {
    return plugins.length > 0 && plugins.every(isReady);
  }

  function drainBatch(): AnyPayload[] {
    const events: AnyPayload[] = [];
    const max = drainSize ?? Infinity;
    let item: AnyPayload | undefined;
    while (events.length < max && (item = queue.remove()) !== undefined) {
      events.push(item);
    }
    return events;
  }

  async function drainQueue(): Promise<void> {
    for (const payload of drainBatch()) {
      trackInflight(dispatchSequential(plugins, payload));
    }
    await Promise.all([...inflight]);
  }

  function stopPoll(): void {
    if (pollTimer != null) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  }

  function startPoll(): void {
    if (pollTimer != null) return;
    pollTimer = setInterval(() => {
      if (allReady()) {
        stopPoll();
        if (!batching) void drainQueue();
        else startDrainTimer();
      }
    }, retryInterval);
  }

  function stopDrainTimer(): void {
    if (drainTimer != null) {
      clearInterval(drainTimer);
      drainTimer = undefined;
    }
  }

  function startDrainTimer(): void {
    if (!batching || drainTimer != null) return;
    drainTimer = setInterval(() => {
      if (queue.size > 0) void drainQueue();
    }, drainInterval);
  }

  async function initPlugin(plugin: AnalyticsPlugin): Promise<void> {
    const config = plugin.config ?? {};
    if (plugin.initialize) await plugin.initialize({ config });
    initialized.add(plugin.name);
    if (allReady()) {
      stopPoll();
      if (batching) startDrainTimer();
      else await drainQueue();
    } else {
      startPoll();
    }
  }

  function addPlugin(plugin: AnalyticsPlugin): void {
    plugins.push(plugin);
    void initPlugin(plugin);
    if (!allReady()) startPoll();
  }

  function dispatch(payload: AnyPayload): void {
    if (!batching && allReady()) {
      trackInflight(dispatchSequential(plugins, payload));
    } else if (queue.size < queueLimit) {
      queue.add(payload);
    }
  }

  async function drain(): Promise<void> {
    await Promise.all([...inflight]);
  }

  function stop(): void {
    stopPoll();
    stopDrainTimer();
    queue.clear();
  }

  return { addPlugin, dispatch, drain, stop };
}

function buildControls(core: ReturnType<typeof buildCore>): AnalyticsControls {
  return {
    page: (properties = {}) => core.dispatch(buildPagePayload(properties)),
    track: (event, properties = {}) => core.dispatch(buildTrackPayload(event, properties)),
    identify: (userId, traits = {}) => core.dispatch(buildIdentifyPayload(userId, traits)),
    use: core.addPlugin,
    reset: core.stop,
    drain: core.drain,
  };
}

/**
 * Non-reactive analytics primitive. Returns controls and a cleanup function.
 * Works on both server and client — plugins without DOM dependencies run identically
 * in SSR. Page property defaults (path, url, title, referrer) are omitted on the server.
 *
 * @param onQueueChange - Optional callback fired after every queue mutation with the
 * new size. Used internally by `createAnalytics` to keep a reactive signal in sync.
 */
export function makeAnalytics(
  plugins: AnalyticsPlugin[],
  options: AnalyticsOptions = {},
  onQueueChange?: (size: number) => void,
): [AnalyticsControls, () => void] {
  const q = makeQueue<AnyPayload>();

  // When an observer is provided, wrap the plain queue so every mutation also
  // fires the callback. Synchronous reads (isEmpty, size) go directly to the
  // underlying queue — no batching involved — which is what the drain loop needs.
  const queue: EventBuffer = onQueueChange
    ? {
        get size() { return q.size; },
        get isEmpty() { return q.isEmpty; },
        add(item) { q.add(item); onQueueChange(q.size); },
        remove() { const r = q.remove(); onQueueChange(q.size); return r; },
        clear() { q.clear(); onQueueChange(0); },
      }
    : q;

  const core = buildCore(queue, options);
  for (const plugin of plugins) core.addPlugin(plugin);
  return [buildControls(core), core.stop];
}

/**
 * Reactive analytics primitive built on top of `makeAnalytics`.
 * Integrates with Solid's owner tree — auto-disposes on cleanup.
 * Exposes `pendingCount` as a reactive signal driven by `makeAnalytics`'s queue.
 */
export function createAnalytics(
  plugins: AnalyticsPlugin[],
  options: AnalyticsOptions = {},
): ReactiveAnalyticsControls {
  // ownedWrite: true because dispatch() may be called inside createRoot scope in tests.
  const [pendingCount, setPendingCount] = createSignal(0, INTERNAL_OPTIONS);
  const [controls, cleanup] = makeAnalytics(plugins, options, setPendingCount);
  tryOnCleanup(cleanup);
  return { ...controls, pendingCount };
}

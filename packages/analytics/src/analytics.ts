import { createSignal } from "solid-js";
import { tryOnCleanup, INTERNAL_OPTIONS } from "@solid-primitives/utils";
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
import { EventQueue } from "./queue.js";

let _seq = 0;
function generateId(): string {
  return `${Date.now().toString(36)}-${(++_seq).toString(36)}`;
}

function buildPagePayload(properties: PageProperties): PagePayload {
  const defaults: PageProperties =
    typeof window !== "undefined"
      ? {
          path: window.location.pathname,
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
        }
      : {};
  return {
    type: "page",
    properties: { ...defaults, ...properties },
    meta: { rid: generateId(), ts: Date.now() },
  };
}

function buildTrackPayload(event: string, properties: TrackProperties): TrackPayload {
  return {
    type: "track",
    event,
    properties,
    meta: { rid: generateId(), ts: Date.now() },
  };
}

function buildIdentifyPayload(userId: string, traits: IdentifyTraits): IdentifyPayload {
  return {
    type: "identify",
    userId,
    traits,
    meta: { rid: generateId(), ts: Date.now() },
  };
}

/**
 * Send a payload to a single plugin.
 * Returns `true` if the plugin processed the event, `false` if it aborted.
 */
async function invokePlugin(plugin: AnalyticsPlugin, payload: AnyPayload): Promise<boolean> {
  const config = plugin.config ?? {};
  let aborted = false;
  const abort = (): void => {
    aborted = true;
  };
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
    const continued = await invokePlugin(plugin, payload);
    if (!continued) break;
  }
}

type StateSnapshot = { queueSize: number };

/** Internal engine — shared by makeAnalytics and (via makeAnalytics) createAnalytics. */
function buildCore(options: AnalyticsOptions, onStateChange?: (snap: StateSnapshot) => void) {
  const { queueLimit = 100, retryInterval = 500, drainInterval, drainSize } = options;
  const batching = drainInterval != null;
  const queue = new EventQueue(queueLimit);
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

  function notify(): void {
    onStateChange?.({ queueSize: queue.size });
  }

  async function drainQueue(): Promise<void> {
    const events = queue.drain(drainSize);
    notify();
    for (const { payload } of events) {
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
        if (!batching) void drainQueue().then(() => notify());
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
      if (queue.size > 0) void drainQueue().then(() => notify());
    }, drainInterval);
  }

  async function initPlugin(plugin: AnalyticsPlugin): Promise<void> {
    const config = plugin.config ?? {};
    if (plugin.initialize) {
      await plugin.initialize({ config });
    }
    initialized.add(plugin.name);
    if (allReady()) {
      stopPoll();
      if (batching) {
        startDrainTimer();
      } else {
        await drainQueue();
      }
    } else {
      startPoll();
    }
    notify();
  }

  function addPlugin(plugin: AnalyticsPlugin): void {
    plugins.push(plugin);
    void initPlugin(plugin);
    if (!allReady()) startPoll();
    notify();
  }

  function dispatch(payload: AnyPayload): void {
    if (batching && allReady()) {
      // Batching mode: accumulate in queue, drain on schedule.
      queue.enqueue(payload);
      notify();
    } else if (allReady()) {
      trackInflight(dispatchSequential(plugins, payload));
    } else {
      queue.enqueue(payload);
      notify();
    }
  }

  function drain(): Promise<void> {
    return Promise.all([...inflight]).then(() => {});
  }

  function stop(): void {
    stopPoll();
    stopDrainTimer();
    queue.clear();
    notify();
  }

  return { addPlugin, dispatch, drain, stop };
}

/**
 * Non-reactive analytics primitive. Returns controls and a cleanup function.
 * Works on both server and client — plugins without DOM dependencies run identically
 * in SSR. Page property defaults (path, url, title, referrer) are omitted on the server.
 *
 * @param onStateChange - Internal hook used by createAnalytics to observe state changes.
 * @internal
 */
export function makeAnalytics(
  plugins: AnalyticsPlugin[],
  options: AnalyticsOptions = {},
  onStateChange?: (snap: StateSnapshot) => void,
): [AnalyticsControls, () => void] {
  const core = buildCore(options, onStateChange);

  for (const plugin of plugins) {
    core.addPlugin(plugin);
  }

  const controls: AnalyticsControls = {
    page: (properties = {}) => core.dispatch(buildPagePayload(properties)),
    track: (event, properties = {}) => core.dispatch(buildTrackPayload(event, properties)),
    identify: (userId, traits = {}) => core.dispatch(buildIdentifyPayload(userId, traits)),
    use: plugin => core.addPlugin(plugin),
    reset: () => core.stop(),
    drain: () => core.drain(),
  };

  return [controls, () => core.stop()];
}

/**
 * Reactive analytics primitive built on top of `makeAnalytics`.
 * Integrates with Solid's owner tree — auto-disposes on cleanup.
 * Exposes `initialized` and `pendingCount` signals for reactive UI.
 */
export function createAnalytics(
  plugins: AnalyticsPlugin[],
  options: AnalyticsOptions = {},
): ReactiveAnalyticsControls {
  const [pendingCount, setPendingCount] = createSignal(0, INTERNAL_OPTIONS);

  const [controls, cleanup] = makeAnalytics(plugins, options, ({ queueSize }) => {
    setPendingCount(queueSize);
  });

  tryOnCleanup(cleanup);

  return { ...controls, pendingCount };
}

import { type Accessor, createEffect, createSignal } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, noop, type MaybeAccessor } from "@solid-primitives/utils";

/** A messaging target: a `Window`, an iframe element (resolved to its `contentWindow`) or a `MessagePort`. */
export type PostMessageTarget = Window | HTMLIFrameElement | MessagePort;

export type PostMessageListener<T> = (data: T, event: MessageEvent) => void;

export type PostMessageBaseOptions<TIn = unknown> = {
  /**
   * Type guard for incoming data. Messages failing it are dropped and the
   * handle's data type is narrowed to `TIn`.
   */
  validate?: (data: unknown) => data is TIn;
  /**
   * Namespace. When set, outgoing data is wrapped in an envelope and incoming
   * messages are only accepted if they carry the same channel.
   */
  channel?: string;
  /** Window that receives the `message` events. Defaults to the global `window`. Ignored for ports. */
  receiver?: Pick<Window, "addEventListener" | "removeEventListener">;
};

export type PostMessageWindowOptions<TIn = unknown> = PostMessageBaseOptions<TIn> & {
  /**
   * Origins incoming messages are accepted from. Required: an empty list
   * accepts nothing. `"*"` is only honoured when listed explicitly.
   */
  allowedOrigins: readonly string[];
  /** `targetOrigin` for `postMessage`. Required for sending; `"*"` only when given explicitly. */
  targetOrigin: string;
};

export type PostMessagePortOptions<TIn = unknown> = PostMessageBaseOptions<TIn>;

export type PostMessageHandle<TIn = unknown, TOut = unknown> = {
  /** Sends data to the target. Returns `false` if there is nothing to send to (closed, or iframe without a window). */
  send: (data: TOut, transfer?: Transferable[]) => boolean;
  /** Subscribes to accepted messages. Returns an unsubscribe function. */
  onMessage: (listener: PostMessageListener<TIn>) => () => void;
  /** Stops listening and drops all subscribers. Does not close a `MessagePort`. */
  close: () => void;
};

export type PostMessageReturn<TIn = unknown, TOut = unknown> = PostMessageHandle<TIn, TOut> & {
  /** The latest accepted message (reactive). */
  message: Accessor<TIn | undefined>;
};

const ENVELOPE_KEY = "__solidPrimitivesPostMessage";

type Envelope = { [ENVELOPE_KEY]: string; data: unknown };

const isEnvelope = (v: unknown): v is Envelope =>
  typeof v === "object" && v !== null && typeof (v as Envelope)[ENVELOPE_KEY] === "string";

const isIframe = (t: PostMessageTarget): t is HTMLIFrameElement => "contentWindow" in t;
const isPort = (t: PostMessageTarget): t is MessagePort =>
  !isIframe(t) && typeof (t as MessagePort).start === "function";

type AnyOptions<TIn> = PostMessageBaseOptions<TIn> & {
  allowedOrigins?: readonly string[];
  targetOrigin?: string;
};

/**
 * Non-reactive, secure `postMessage` channel. Call `close()` to clean up.
 *
 * Messages to/from a window or iframe are only accepted when
 * `event.source` is the target window **and** `event.origin` is listed in
 * `allowedOrigins`. Sending to a window requires an explicit `targetOrigin`.
 *
 * @example
 * ```ts
 * const channel = makePostMessage<{ type: "ready" }>(iframe, {
 *   allowedOrigins: ["https://preview.example.com"],
 *   targetOrigin: "https://preview.example.com",
 *   validate: (d): d is { type: "ready" } => (d as any)?.type === "ready",
 * });
 * channel.onMessage(msg => msg.type);
 * channel.send({ code: "..." });
 * channel.close();
 * ```
 */
export function makePostMessage<TIn = unknown, TOut = unknown>(
  target: MessagePort,
  options?: PostMessagePortOptions<TIn>,
): PostMessageHandle<TIn, TOut>;
export function makePostMessage<TIn = unknown, TOut = unknown>(
  target: Window | HTMLIFrameElement,
  options: PostMessageWindowOptions<TIn>,
): PostMessageHandle<TIn, TOut>;
export function makePostMessage<TIn = unknown, TOut = unknown>(
  target: PostMessageTarget,
  options: AnyOptions<TIn> = {},
): PostMessageHandle<TIn, TOut> {
  const port = isPort(target);
  const { allowedOrigins, targetOrigin, channel, validate } = options;

  if (!port && !Array.isArray(allowedOrigins)) {
    throw new TypeError(
      "makePostMessage: `allowedOrigins` is required when the target is a Window or iframe.",
    );
  }

  const listeners = new Set<PostMessageListener<TIn>>();
  let closed = false;

  const resolveWindow = (): Window | null =>
    isIframe(target) ? target.contentWindow : (target as Window);

  const handler = (event: Event) => {
    if (closed) return;
    const e = event as MessageEvent;
    if (!port) {
      const w = resolveWindow();
      if (!w || e.source !== w) return;
      if (!allowedOrigins!.includes("*") && !allowedOrigins!.includes(e.origin)) return;
    }
    let data: unknown = e.data;
    if (channel !== undefined) {
      if (!isEnvelope(data) || data[ENVELOPE_KEY] !== channel) return;
      data = data.data;
    }
    if (validate && !validate(data)) return;
    for (const listener of [...listeners]) {
      try {
        listener(data as TIn, e);
      } catch (error) {
        queueMicrotask(() => {
          throw error;
        });
      }
    }
  };

  const receiver: Pick<Window, "addEventListener" | "removeEventListener"> | MessagePort = port
    ? target
    : (options.receiver ?? window);
  receiver.addEventListener("message", handler);
  if (port) target.start();

  return {
    send(data, transfer) {
      if (closed) return false;
      const payload = channel !== undefined ? { [ENVELOPE_KEY]: channel, data } : data;
      if (port) {
        target.postMessage(payload, transfer ?? []);
        return true;
      }
      if (typeof targetOrigin !== "string") {
        throw new TypeError(
          "makePostMessage: `targetOrigin` is required to send to a Window or iframe.",
        );
      }
      const w = resolveWindow();
      if (!w) return false;
      w.postMessage(payload, { targetOrigin, transfer: transfer ?? [] });
      return true;
    },
    onMessage(listener) {
      if (!closed) listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close() {
      if (closed) return;
      closed = true;
      listeners.clear();
      receiver.removeEventListener("message", handler);
    },
  };
}

export type CreatePostMessagePortOptions<TIn = unknown> = PostMessagePortOptions<TIn> & {
  target: MaybeAccessor<MessagePort | null | undefined>;
};

export type CreatePostMessageWindowOptions<TIn = unknown> = PostMessageWindowOptions<TIn> & {
  target: MaybeAccessor<Window | HTMLIFrameElement | null | undefined>;
};

/**
 * Reactive `postMessage` channel. The `target` may be an accessor (for example
 * an iframe ref signal); the channel re-attaches whenever it changes and is
 * torn down with the owner. Returns inert stubs on the server.
 *
 * @example
 * ```ts
 * const [iframe, setIframe] = createSignal<HTMLIFrameElement>();
 * const { send, message } = createPostMessage<Reply>({
 *   target: iframe,
 *   allowedOrigins: [origin],
 *   targetOrigin: origin,
 *   validate: isReply,
 * });
 * ```
 */
export function createPostMessage<TIn = unknown, TOut = unknown>(
  options: CreatePostMessagePortOptions<TIn>,
): PostMessageReturn<TIn, TOut>;
export function createPostMessage<TIn = unknown, TOut = unknown>(
  options: CreatePostMessageWindowOptions<TIn>,
): PostMessageReturn<TIn, TOut>;
export function createPostMessage<TIn = unknown, TOut = unknown>(
  options: AnyOptions<TIn> & { target: MaybeAccessor<PostMessageTarget | null | undefined> },
): PostMessageReturn<TIn, TOut> {
  if (isServer) {
    return {
      send: () => false,
      onMessage: () => noop,
      close: noop,
      message: () => undefined,
    };
  }

  const [message, setMessage] = createSignal<TIn | undefined>(undefined, {
    ...INTERNAL_OPTIONS,
    equals: false,
  });
  const listeners = new Set<PostMessageListener<TIn>>();
  let current: PostMessageHandle<TIn, TOut> | undefined;
  let closed = false;

  createEffect(
    () => access(options.target),
    t => {
      if (!t || closed) return;
      const handle = (makePostMessage as any)(t, options) as PostMessageHandle<TIn, TOut>;
      const off = handle.onMessage((data, event) => {
        setMessage(() => data);
        for (const l of [...listeners]) l(data, event);
      });
      current = handle;
      return () => {
        off();
        handle.close();
        if (current === handle) current = undefined;
      };
    },
  );

  return {
    message: message as Accessor<TIn | undefined>,
    send: (data, transfer) => (current ? current.send(data, transfer) : false),
    onMessage(listener) {
      if (!closed) listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close() {
      closed = true;
      listeners.clear();
      current?.close();
      current = undefined;
    },
  };
}

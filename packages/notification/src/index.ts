import { action, createOptimistic, createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { INTERNAL_OPTIONS, isDev, noop, access, type MaybeAccessor } from "@solid-primitives/utils";
import { createPermission } from "@solid-primitives/permission";

/**
 * Returns `true` when the [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
 * is available in the current environment.
 */
export const isNotificationSupported = (): boolean => !isServer && "Notification" in window;

/**
 * Non-reactive notification helper. No Solid lifecycle dependency.
 * Both returned functions are no-ops / return `null` when the API is unavailable.
 *
 * Permission must be `"granted"` before calling `show()` — use
 * `createNotificationPermission` to request it reactively.
 *
 * @param title Notification title.
 * @param options Standard `NotificationOptions` (body, icon, tag, etc.).
 * @returns `[show, close]` — `show()` creates and returns the `Notification`
 *   (or `null` when permission is not `"granted"`); `close()` dismisses it.
 *
 * @example
 * ```ts
 * const [show, close] = makeNotification("New message", { body: "Hello!" });
 * button.addEventListener("click", () => show());
 * ```
 */
export function makeNotification(
  title: string,
  options?: NotificationOptions,
): [show: () => Notification | null, close: VoidFunction] {
  if (!isNotificationSupported()) return [() => null, noop];

  let current: Notification | undefined;
  let closeHandler: VoidFunction | undefined;

  const close: VoidFunction = () => {
    if (current && closeHandler) {
      current.removeEventListener("close", closeHandler);
      closeHandler = undefined;
    }
    current?.close();
    current = undefined;
  };

  const show = (): Notification | null => {
    if (Notification.permission !== "granted") {
      // eslint-disable-next-line no-console
      if (isDev) console.warn(
          `[@solid-primitives/notification] show() called with Notification.permission "${Notification.permission}" — must be "granted".`,
        );
      return null;
    }
    close();
    const n = new Notification(title, options);
    current = n;
    closeHandler = () => {
      if (current === n) {
        current = undefined;
        closeHandler = undefined;
      }
    };
    n.addEventListener("close", closeHandler);
    return n;
  };

  return [show, close];
}

/** Event handler callbacks for `createNotification`. */
export type NotificationEventHandlers = {
  /** Called when the user clicks the notification. */
  onClick?: (notification: Notification) => void;
  /** Called when the notification is dismissed, whether by the user, the OS, or `close()`. */
  onClose?: (notification: Notification) => void;
  /** Called when the notification fails to display. */
  onError?: (notification: Notification) => void;
};

/**
 * Reactive notification primitive tied to the current reactive owner.
 *
 * Accepts reactive `title` and `options` — their current values are read each
 * time `show()` is called. The `notification` accessor tracks the live
 * `Notification` instance, updating to `null` when it is dismissed or closed.
 * The notification is closed automatically on owner disposal.
 *
 * Permission must be `"granted"` before calling `show()` — use
 * `createNotificationPermission` to request it reactively.
 *
 * @param title Notification title, or a reactive accessor returning one.
 * @param options Standard `NotificationOptions`, or a reactive accessor.
 * @param handlers Optional event callbacks (`onClick`, `onClose`, `onError`).
 * @returns `{ show, close, notification, supported }`
 *
 * @example
 * ```ts
 * const { show, close, notification } = createNotification(
 *   () => `You have ${unread()} messages`,
 *   { icon: "/icon.png" },
 *   { onClick: () => window.focus() },
 * );
 * ```
 */
export function createNotification(
  title: MaybeAccessor<string>,
  options?: MaybeAccessor<NotificationOptions>,
  handlers?: NotificationEventHandlers,
): {
  show: () => Notification | null;
  close: VoidFunction;
  notification: Accessor<Notification | null>;
  supported: boolean;
} {
  const supported = isNotificationSupported();

  if (!supported) {
    return { show: () => null, close: noop, notification: () => null, supported };
  }

  const [notification, setNotification] = createSignal<Notification | null>(null, INTERNAL_OPTIONS);
  let current: Notification | null = null;
  let currentCleanup: VoidFunction | undefined;

  const close: VoidFunction = () => {
    const n = current;
    currentCleanup?.();
    currentCleanup = undefined;
    n?.close();
    current = null;
    setNotification(null);
    if (n) handlers?.onClose?.(n);
  };

  const show = (): Notification | null => {
    if (Notification.permission !== "granted") {
      // eslint-disable-next-line no-console
      if (isDev) console.warn(
          `[@solid-primitives/notification] show() called with Notification.permission "${Notification.permission}" — must be "granted".`,
        );
      return null;
    }
    close();
    const n = new Notification(access(title), access(options));
    current = n;

    const onCloseEvent = () => {
      if (current === n) {
        currentCleanup?.();
        currentCleanup = undefined;
        current = null;
        setNotification(null);
        handlers?.onClose?.(n);
      }
    };

    n.addEventListener("close", onCloseEvent);
    const cleanups: VoidFunction[] = [() => n.removeEventListener("close", onCloseEvent)];

    if (handlers?.onClick) {
      const h = () => handlers.onClick!(n);
      n.addEventListener("click", h);
      cleanups.push(() => n.removeEventListener("click", h));
    }

    if (handlers?.onError) {
      const h = () => handlers.onError!(n);
      n.addEventListener("error", h);
      cleanups.push(() => n.removeEventListener("error", h));
    }

    currentCleanup = () => cleanups.forEach(fn => fn());
    setNotification(n);
    return n;
  };

  onCleanup(close);

  return { show, close, notification, supported };
}

/**
 * Reactive notification permission manager built on `createPermission`.
 *
 * The `permission` accessor reflects the live state from the browser
 * [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
 * and updates automatically whenever permission changes — including after
 * `requestPermission()` resolves or the user edits browser settings.
 *
 * Permission values follow the Permissions API vocabulary: `"granted"`,
 * `"denied"`, `"prompt"` (not yet asked), or `"unknown"` while the query
 * is still resolving. Note that the Notifications API uses `"default"` for
 * the same concept that the Permissions API calls `"prompt"`.
 *
 * @returns `{ permission, requestPermission }`
 *
 * @example
 * ```ts
 * const { permission, requestPermission } = createNotificationPermission();
 *
 * <Show when={permission() !== "granted"}>
 *   <button onClick={requestPermission}>Enable notifications</button>
 * </Show>
 * ```
 */
export function createNotificationPermission(): {
  permission: Accessor<PermissionState | "unknown">;
  requestPermission: () => Promise<void>;
  pending: Accessor<boolean>;
} {
  if (!isNotificationSupported()) {
    return {
      permission: () => "unknown" as const,
      requestPermission: () => Promise.resolve(),
      pending: () => false,
    };
  }

  const permission = createPermission("notifications");
  const [pending, setPending] = createOptimistic(false, INTERNAL_OPTIONS);

  // createPermission tracks state via the change event — no manual update needed
  const requestPermission = action(function* () {
    setPending(true);
    try {
      yield Notification.requestPermission();
    } catch {
      // swallow — permission updates reactively via createPermission
    }
    setPending(false);
  });

  return { permission, requestPermission, pending };
}

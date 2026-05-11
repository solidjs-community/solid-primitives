import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { INTERNAL_OPTIONS, noop, access, type MaybeAccessor } from "@solid-primitives/utils";

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
    if (Notification.permission !== "granted") return null;
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
 * @returns `{ show, close, notification, supported }`
 *
 * @example
 * ```ts
 * const { show, close, notification } = createNotification(
 *   () => `You have ${unread()} messages`,
 *   { icon: "/icon.png" },
 * );
 *
 * createEffect(() => {
 *   if (notification()) console.log("notification is visible");
 * });
 * ```
 */
export function createNotification(
  title: MaybeAccessor<string>,
  options?: MaybeAccessor<NotificationOptions>,
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
  let closeHandler: VoidFunction | undefined;

  const close: VoidFunction = () => {
    if (current && closeHandler) {
      current.removeEventListener("close", closeHandler);
      closeHandler = undefined;
    }
    current?.close();
    current = null;
    setNotification(null);
  };

  const show = (): Notification | null => {
    if (Notification.permission !== "granted") return null;
    close();
    const n = new Notification(access(title), access(options));
    current = n;
    closeHandler = () => {
      if (current === n) {
        current = null;
        closeHandler = undefined;
        setNotification(null);
      }
    };
    n.addEventListener("close", closeHandler);
    setNotification(n);
    return n;
  };

  onCleanup(close);

  return { show, close, notification, supported };
}

/**
 * Reactive notification permission manager.
 *
 * The `permission` accessor reflects the current `Notification.permission`
 * value and updates after each `requestPermission()` call. Use this to
 * reactively gate UI controls or notification logic on permission state.
 *
 * On the server or when the Notifications API is unavailable, `permission`
 * always returns `"denied"` and `requestPermission` resolves to `"denied"`.
 *
 * @returns `{ permission, requestPermission }`
 *
 * @example
 * ```ts
 * const { permission, requestPermission } = createNotificationPermission();
 *
 * createEffect(() => {
 *   if (permission() === "granted") showWelcomeNotification();
 * });
 *
 * <button onClick={requestPermission}>Enable notifications</button>
 * ```
 */
export function createNotificationPermission(): {
  permission: Accessor<NotificationPermission>;
  requestPermission: () => Promise<NotificationPermission>;
} {
  if (!isNotificationSupported()) {
    return {
      permission: () => "denied" as NotificationPermission,
      requestPermission: () => Promise.resolve("denied" as NotificationPermission),
    };
  }

  const [permission, setPermission] = createSignal<NotificationPermission>(
    Notification.permission,
    INTERNAL_OPTIONS,
  );

  const requestPermission = async (): Promise<NotificationPermission> => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  return { permission, requestPermission };
}

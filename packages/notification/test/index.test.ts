import { describe, test, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { createRoot, createSignal, flush, onCleanup } from "solid-js";
import {
  isNotificationSupported,
  makeNotification,
  createNotification,
  createNotificationPermission,
} from "../src/index.js";

// ── Mock Notification API ─────────────────────────────────────────────────────

class MockNotification {
  static permission: NotificationPermission = "granted";
  static requestPermission = vi.fn().mockResolvedValue("granted" as NotificationPermission);
  static instances: MockNotification[] = [];

  title: string;
  private listeners: Map<string, (() => void)[]> = new Map();

  constructor(title: string, _options?: NotificationOptions) {
    this.title = title;
    MockNotification.instances.push(this);
  }

  close = vi.fn().mockImplementation(() => {
    this.listeners.get("close")?.forEach(fn => fn());
  });

  addEventListener = vi.fn().mockImplementation((event: string, fn: () => void) => {
    const list = this.listeners.get(event) ?? [];
    list.push(fn);
    this.listeners.set(event, list);
  });

  removeEventListener = vi.fn().mockImplementation((event: string, fn: () => void) => {
    const list = this.listeners.get(event) ?? [];
    this.listeners.set(
      event,
      list.filter(f => f !== fn),
    );
  });

  simulateClose() {
    this.listeners.get("close")?.forEach(fn => fn());
  }

  simulateClick() {
    this.listeners.get("click")?.forEach(fn => fn());
  }

  simulateError() {
    this.listeners.get("error")?.forEach(fn => fn());
  }
}

// ── Mock Permissions API ──────────────────────────────────────────────────────

const mockPermStatus = {
  state: "granted" as PermissionState,
  _listeners: [] as (() => void)[],
  addEventListener(_: string, fn: () => void) {
    this._listeners.push(fn);
  },
  removeEventListener(_: string, fn: () => void) {
    const i = this._listeners.indexOf(fn);
    if (i >= 0) this._listeners.splice(i, 1);
  },
  dispatchChange(state: PermissionState) {
    this.state = state;
    this._listeners.forEach(fn => fn());
  },
};

// ── Global setup ──────────────────────────────────────────────────────────────

beforeAll(() => {
  Object.defineProperty(window, "Notification", {
    value: MockNotification,
    configurable: true,
    writable: true,
  });

  (navigator as any).permissions ??= {} as any;
  navigator.permissions.query = vi.fn().mockImplementation(({ name }: PermissionDescriptor) => {
    if (name === "notifications") return Promise.resolve(mockPermStatus);
    return Promise.reject(new Error(`Unhandled permission: ${name}`));
  });
});

afterAll(() => {
  Object.defineProperty(window, "Notification", { value: undefined, configurable: true });
});

beforeEach(() => {
  MockNotification.instances = [];
  MockNotification.permission = "granted";
  MockNotification.requestPermission.mockClear().mockResolvedValue("granted");
  mockPermStatus.state = "granted";
  mockPermStatus._listeners = [];
});

// ── isNotificationSupported ───────────────────────────────────────────────────

describe("isNotificationSupported", () => {
  test("returns true when Notification is available", () => {
    expect(isNotificationSupported()).toBe(true);
  });
});

// ── makeNotification ──────────────────────────────────────────────────────────

describe("makeNotification", () => {
  test("show creates a Notification with the given title", () => {
    const [show] = makeNotification("Hello");
    show();
    expect(MockNotification.instances).toHaveLength(1);
    expect(MockNotification.instances[0]!.title).toBe("Hello");
  });

  test("show returns the Notification instance", () => {
    const [show] = makeNotification("Hello");
    expect(show()).toBeInstanceOf(MockNotification);
  });

  test("show returns null when permission is not granted", () => {
    MockNotification.permission = "denied";
    const [show] = makeNotification("Hello");
    expect(show()).toBeNull();
    expect(MockNotification.instances).toHaveLength(0);
  });

  test("close dismisses the current notification", () => {
    const [show, close] = makeNotification("Hello");
    show();
    const instance = MockNotification.instances[0]!;
    close();
    expect(instance.close).toHaveBeenCalled();
  });

  test("close removes the event listener before closing", () => {
    const [show, close] = makeNotification("Hello");
    show();
    const instance = MockNotification.instances[0]!;
    close();
    expect(instance.removeEventListener).toHaveBeenCalledWith("close", expect.any(Function));
  });

  test("show replaces an existing notification", () => {
    const [show] = makeNotification("Hello");
    show();
    const first = MockNotification.instances[0]!;
    show();
    expect(first.close).toHaveBeenCalled();
    expect(MockNotification.instances).toHaveLength(2);
  });

  test("external close clears internal reference so close() becomes a no-op", () => {
    const [show, close] = makeNotification("Hello");
    show();
    const instance = MockNotification.instances[0]!;
    instance.simulateClose();
    instance.close.mockClear();
    close();
    expect(instance.close).not.toHaveBeenCalled();
  });

  test("close can be registered with onCleanup by the caller for reactive cleanup", () => {
    const { dispose } = createRoot(dispose => {
      const [show, close] = makeNotification("Hello");
      onCleanup(close);
      show();
      return { dispose };
    });

    const instance = MockNotification.instances[0]!;
    instance.close.mockClear();

    dispose();
    expect(instance.close).toHaveBeenCalled();
  });
});

// ── createNotification ────────────────────────────────────────────────────────

describe("createNotification", () => {
  test("initial state: notification is null, supported is true", () => {
    createRoot(dispose => {
      const { notification, supported } = createNotification("Hello");
      expect(notification()).toBeNull();
      expect(supported).toBe(true);
      dispose();
    });
  });

  test("show creates a Notification and updates the signal", () => {
    const { show, notification, dispose } = createRoot(dispose => {
      const { show, notification } = createNotification("Hello");
      return { show, notification, dispose };
    });

    show();
    flush();
    expect(notification()).toBeInstanceOf(MockNotification);
    expect((notification() as MockNotification).title).toBe("Hello");

    dispose();
  });

  test("show returns null and warns when permission is not granted", () => {
    MockNotification.permission = "denied";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { show, notification, dispose } = createRoot(dispose => {
      const { show, notification } = createNotification("Hello");
      return { show, notification, dispose };
    });

    expect(show()).toBeNull();
    flush();
    expect(notification()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
    dispose();
  });

  test("close dismisses the notification and sets signal to null", () => {
    const { show, close, notification, dispose } = createRoot(dispose => {
      const { show, close, notification } = createNotification("Hello");
      return { show, close, notification, dispose };
    });

    show();
    flush();

    close();
    flush();
    expect(notification()).toBeNull();
    expect(MockNotification.instances[0]!.close).toHaveBeenCalled();

    dispose();
  });

  test("close removes the event listener before closing", () => {
    const { show, close, dispose } = createRoot(dispose => {
      const { show, close } = createNotification("Hello");
      return { show, close, dispose };
    });

    show();
    flush();
    close();
    expect(MockNotification.instances[0]!.removeEventListener).toHaveBeenCalledWith(
      "close",
      expect.any(Function),
    );

    dispose();
  });

  test("external close (OS dismiss) sets signal to null", () => {
    const { show, notification, dispose } = createRoot(dispose => {
      const { show, notification } = createNotification("Hello");
      return { show, notification, dispose };
    });

    show();
    flush();

    MockNotification.instances[0]!.simulateClose();
    flush();
    expect(notification()).toBeNull();

    dispose();
  });

  test("show replaces an existing notification", () => {
    const { show, notification, dispose } = createRoot(dispose => {
      const { show, notification } = createNotification("Hello");
      return { show, notification, dispose };
    });

    show();
    flush();
    const first = notification();

    show();
    flush();
    expect(notification()).not.toBe(first);
    expect((first as MockNotification).close).toHaveBeenCalled();

    dispose();
  });

  test("dispose closes the notification", () => {
    const { show, dispose } = createRoot(dispose => {
      const { show } = createNotification("Hello");
      return { show, dispose };
    });

    show();
    flush();
    const instance = MockNotification.instances[0]!;
    instance.close.mockClear();

    dispose();
    expect(instance.close).toHaveBeenCalled();
  });

  test("reactive title: reads current accessor value at show() time", () => {
    const [title, setTitle] = createSignal("First");

    const { show, notification, dispose } = createRoot(dispose => {
      const { show, notification } = createNotification(title);
      return { show, notification, dispose };
    });

    show();
    flush();
    expect((notification() as MockNotification).title).toBe("First");

    setTitle("Second");
    flush();
    // not re-shown automatically — title only read on next show() call
    expect((notification() as MockNotification).title).toBe("First");

    show();
    flush();
    expect((notification() as MockNotification).title).toBe("Second");

    dispose();
  });

  // ── Event callbacks ─────────────────────────────────────────────────────────

  test("onClick fires when click event is dispatched", () => {
    const onClick = vi.fn();

    const { show, dispose } = createRoot(dispose => {
      const { show } = createNotification("Hello", undefined, { onClick });
      return { show, dispose };
    });

    show();
    flush();
    MockNotification.instances[0]!.simulateClick();

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(MockNotification.instances[0]);

    dispose();
  });

  test("onClose fires when OS dismisses the notification", () => {
    const onClose = vi.fn();

    const { show, dispose } = createRoot(dispose => {
      const { show } = createNotification("Hello", undefined, { onClose });
      return { show, dispose };
    });

    show();
    flush();
    MockNotification.instances[0]!.simulateClose();

    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledWith(MockNotification.instances[0]);

    dispose();
  });

  test("onClose fires when close() is called programmatically", () => {
    const onClose = vi.fn();

    const { show, close, dispose } = createRoot(dispose => {
      const { show, close } = createNotification("Hello", undefined, { onClose });
      return { show, close, dispose };
    });

    show();
    flush();
    close();

    expect(onClose).toHaveBeenCalledOnce();

    dispose();
  });

  test("onError fires when error event is dispatched", () => {
    const onError = vi.fn();

    const { show, dispose } = createRoot(dispose => {
      const { show } = createNotification("Hello", undefined, { onError });
      return { show, dispose };
    });

    show();
    flush();
    MockNotification.instances[0]!.simulateError();

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(MockNotification.instances[0]);

    dispose();
  });

  test("event listeners are removed when close() is called", () => {
    const onClick = vi.fn();
    const onClose = vi.fn();

    const { show, close, dispose } = createRoot(dispose => {
      const { show, close } = createNotification("Hello", undefined, { onClick, onClose });
      return { show, close, dispose };
    });

    show();
    flush();
    close();
    onClose.mockClear();

    // After close(), simulating OS events should not trigger callbacks
    MockNotification.instances[0]!.simulateClick();
    MockNotification.instances[0]!.simulateClose();

    expect(onClick).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    dispose();
  });
});

// ── createNotificationPermission ──────────────────────────────────────────────

describe("createNotificationPermission", () => {
  test("permission starts as unknown before query resolves", () => {
    createRoot(dispose => {
      const { permission } = createNotificationPermission();
      expect(permission()).toBe("unknown");
      dispose();
    });
  });

  test("permission resolves to current state after query", async () => {
    mockPermStatus.state = "granted";

    const { permission, dispose } = createRoot(dispose => {
      const { permission } = createNotificationPermission();
      return { permission, dispose };
    });

    expect(permission()).toBe("unknown");
    await Promise.resolve();
    flush();
    expect(permission()).toBe("granted");

    dispose();
  });

  test("permission updates reactively when state changes externally", async () => {
    mockPermStatus.state = "granted";

    const { permission, dispose } = createRoot(dispose => {
      const { permission } = createNotificationPermission();
      return { permission, dispose };
    });

    await Promise.resolve();
    flush();
    expect(permission()).toBe("granted");

    mockPermStatus.dispatchChange("denied");
    flush();
    expect(permission()).toBe("denied");

    dispose();
  });

  test("requestPermission calls Notification.requestPermission", async () => {
    const { requestPermission, dispose } = createRoot(dispose => {
      const { requestPermission } = createNotificationPermission();
      return { requestPermission, dispose };
    });

    await requestPermission();
    expect(MockNotification.requestPermission).toHaveBeenCalledOnce();

    dispose();
  });

  test("permission reflects resolved value after requestPermission", async () => {
    mockPermStatus.state = "granted";
    MockNotification.requestPermission.mockResolvedValue("granted");

    const { permission, requestPermission, dispose } = createRoot(dispose => {
      const { permission, requestPermission } = createNotificationPermission();
      return { permission, requestPermission, dispose };
    });

    await Promise.resolve();
    flush();
    await requestPermission();
    flush();
    expect(permission()).toBe("granted");

    dispose();
  });

  test("pending is false initially", () => {
    createRoot(dispose => {
      const { pending } = createNotificationPermission();
      expect(pending()).toBe(false);
      dispose();
    });
  });

  test("pending is true while requestPermission is in flight", async () => {
    let resolve!: (v: NotificationPermission) => void;
    MockNotification.requestPermission.mockImplementation(
      () => new Promise<NotificationPermission>(r => (resolve = r)),
    );

    const { requestPermission, pending, dispose } = createRoot(dispose => {
      const { requestPermission, pending } = createNotificationPermission();
      return { requestPermission, pending, dispose };
    });

    const promise = requestPermission();
    flush();
    expect(pending()).toBe(true);

    resolve("granted");
    await promise;
    flush();
    expect(pending()).toBe(false);

    dispose();
  });
});

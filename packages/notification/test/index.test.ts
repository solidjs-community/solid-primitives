import { describe, test, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
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

  /** Test helper: simulate the OS dismissing the notification externally. */
  simulateClose() {
    this.listeners.get("close")?.forEach(fn => fn());
  }
}

beforeAll(() => {
  Object.defineProperty(window, "Notification", {
    value: MockNotification,
    configurable: true,
    writable: true,
  });
});

afterAll(() => {
  Object.defineProperty(window, "Notification", {
    value: undefined,
    configurable: true,
  });
});

beforeEach(() => {
  MockNotification.instances = [];
  MockNotification.permission = "granted";
  MockNotification.requestPermission.mockClear().mockResolvedValue("granted");
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
    const n = show();
    expect(n).toBeInstanceOf(MockNotification);
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
    instance.simulateClose(); // OS dismissed it
    instance.close.mockClear();
    close(); // should be a no-op — reference already cleared
    expect(instance.close).not.toHaveBeenCalled();
  });

  test("close removes the event listener before closing", () => {
    const [show, close] = makeNotification("Hello");
    show();
    const instance = MockNotification.instances[0]!;
    close();
    expect(instance.removeEventListener).toHaveBeenCalledWith("close", expect.any(Function));
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

  test("show returns the Notification instance", () => {
    const { show, dispose } = createRoot(dispose => {
      const { show } = createNotification("Hello");
      return { show, dispose };
    });

    const n = show();
    expect(n).toBeInstanceOf(MockNotification);

    dispose();
  });

  test("show returns null and does not update signal when permission is denied", () => {
    MockNotification.permission = "denied";

    const { show, notification, dispose } = createRoot(dispose => {
      const { show, notification } = createNotification("Hello");
      return { show, notification, dispose };
    });

    const result = show();
    flush();
    expect(result).toBeNull();
    expect(notification()).toBeNull();

    dispose();
  });

  test("close dismisses the notification and sets signal to null", () => {
    const { show, close, notification, dispose } = createRoot(dispose => {
      const { show, close, notification } = createNotification("Hello");
      return { show, close, notification, dispose };
    });

    show();
    flush();
    expect(notification()).not.toBeNull();

    close();
    flush();
    expect(notification()).toBeNull();
    expect(MockNotification.instances[0]!.close).toHaveBeenCalled();

    dispose();
  });

  test("external close (OS dismiss) sets signal to null", () => {
    const { show, notification, dispose } = createRoot(dispose => {
      const { show, notification } = createNotification("Hello");
      return { show, notification, dispose };
    });

    show();
    flush();
    expect(notification()).not.toBeNull();

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
    const second = notification();

    expect(first).not.toBe(second);
    expect((first as MockNotification).close).toHaveBeenCalled();
    expect(MockNotification.instances).toHaveLength(2);

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

  test("close removes the event listener before closing", () => {
    const { show, close, dispose } = createRoot(dispose => {
      const { show, close } = createNotification("Hello");
      return { show, close, dispose };
    });

    show();
    flush();
    const instance = MockNotification.instances[0]!;
    close();
    expect(instance.removeEventListener).toHaveBeenCalledWith("close", expect.any(Function));

    dispose();
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
    // title signal changed but notification is still showing "First" — re-show not automatic
    expect((notification() as MockNotification).title).toBe("First");

    // calling show() again reads the updated title
    show();
    flush();
    expect((notification() as MockNotification).title).toBe("Second");

    dispose();
  });
});

// ── createNotificationPermission ──────────────────────────────────────────────

describe("createNotificationPermission", () => {
  test("permission reflects Notification.permission on creation", () => {
    MockNotification.permission = "default";

    createRoot(dispose => {
      const { permission } = createNotificationPermission();
      expect(permission()).toBe("default");
      dispose();
    });
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

  test("permission updates after requestPermission resolves to granted", async () => {
    MockNotification.permission = "default";
    MockNotification.requestPermission.mockResolvedValue("granted");

    const { permission, requestPermission, dispose } = createRoot(dispose => {
      const { permission, requestPermission } = createNotificationPermission();
      return { permission, requestPermission, dispose };
    });

    expect(permission()).toBe("default");
    await requestPermission();
    flush();
    expect(permission()).toBe("granted");

    dispose();
  });

  test("permission updates after requestPermission resolves to denied", async () => {
    MockNotification.permission = "default";
    MockNotification.requestPermission.mockResolvedValue("denied");

    const { permission, requestPermission, dispose } = createRoot(dispose => {
      const { permission, requestPermission } = createNotificationPermission();
      return { permission, requestPermission, dispose };
    });

    await requestPermission();
    flush();
    expect(permission()).toBe("denied");

    dispose();
  });

  test("requestPermission returns the resolved permission value", async () => {
    MockNotification.requestPermission.mockResolvedValue("granted");

    const { requestPermission, dispose } = createRoot(dispose => {
      const { requestPermission } = createNotificationPermission();
      return { requestPermission, dispose };
    });

    const result = await requestPermission();
    expect(result).toBe("granted");

    dispose();
  });
});

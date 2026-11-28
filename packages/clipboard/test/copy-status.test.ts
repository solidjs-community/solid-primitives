import "./setup";
import { createRoot, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCopyToClipboard } from "../src/index.js";

const setup = (options?: Parameters<typeof createCopyToClipboard>[0]) => {
  let api!: ReturnType<typeof createCopyToClipboard>;
  const dispose = createRoot(d => {
    api = createCopyToClipboard(options);
    return d;
  });
  return { api, dispose };
};

describe("createCopyToClipboard", () => {
  let writeText: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.useFakeTimers();
    writeText = vi.spyOn(navigator.clipboard, "writeText");
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts idle", () => {
    const { api, dispose } = setup();
    expect(api.status()).toBe("idle");
    expect(api.copied()).toBe(false);
    expect(api.error()).toBeUndefined();
    dispose();
  });

  it("copies, reports copied, then resets after 2000ms", async () => {
    const onCopied = vi.fn();
    const { api, dispose } = setup({ onCopied });
    const p = api.copy("hi");
    await expect(p).resolves.toBe(true);
    flush();
    expect(writeText).toHaveBeenCalledWith("hi");
    expect(api.status()).toBe("copied");
    expect(api.copied()).toBe(true);
    expect(onCopied).toHaveBeenCalledWith("hi");
    vi.advanceTimersByTime(1999);
    flush();
    expect(api.copied()).toBe(true);
    vi.advanceTimersByTime(1);
    flush();
    expect(api.status()).toBe("idle");
    dispose();
  });

  it("honors a custom resetAfter and disables with 0", async () => {
    const a = setup({ resetAfter: 100 });
    await a.api.copy("x");
    flush();
    vi.advanceTimersByTime(100);
    flush();
    expect(a.api.status()).toBe("idle");
    a.dispose();

    const b = setup({ resetAfter: 0 });
    await b.api.copy("x");
    flush();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(100000);
    flush();
    expect(b.api.status()).toBe("copied");
    b.dispose();
  });

  it("handles rejection: status error, onError, resolves false, resets", async () => {
    const err = new Error("denied");
    writeText.mockRejectedValueOnce(err);
    const onError = vi.fn();
    const onCopied = vi.fn();
    const { api, dispose } = setup({ onError, onCopied });
    await expect(api.copy("x")).resolves.toBe(false);
    flush();
    expect(api.status()).toBe("error");
    expect(api.copied()).toBe(false);
    expect(api.error()).toBe(err);
    expect(onError).toHaveBeenCalledWith(err);
    expect(onCopied).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    flush();
    expect(api.status()).toBe("idle");
    expect(api.error()).toBeUndefined();
    dispose();
  });

  it("a successful copy clears a previous error", async () => {
    writeText.mockRejectedValueOnce(new Error("no"));
    const { api, dispose } = setup();
    await api.copy("a");
    flush();
    expect(api.status()).toBe("error");
    await api.copy("b");
    flush();
    expect(api.status()).toBe("copied");
    expect(api.error()).toBeUndefined();
    dispose();
  });

  it("re-copy within the window restarts the timer", async () => {
    const { api, dispose } = setup();
    await api.copy("a");
    flush();
    vi.advanceTimersByTime(1500);
    await api.copy("b");
    flush();
    vi.advanceTimersByTime(1500); // 3000 total, but only 1500 since last copy
    flush();
    expect(api.copied()).toBe(true);
    vi.advanceTimersByTime(500);
    flush();
    expect(api.status()).toBe("idle");
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });

  it("copy() supports ClipboardItem arrays", async () => {
    const { api, dispose } = setup();
    const item = {} as ClipboardItem;
    const write = vi.spyOn(navigator.clipboard, "write");
    await expect(api.copy([item])).resolves.toBe(true);
    expect(write).toHaveBeenCalledWith([item]);
    flush();
    expect(api.status()).toBe("copied");
    dispose();
  });

  it("reset() returns to idle and cancels the timer", async () => {
    const { api, dispose } = setup();
    await api.copy("a");
    flush();
    api.reset();
    flush();
    expect(api.status()).toBe("idle");
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });

  it("reset() during an in-flight copy discards its result", async () => {
    let resolveWrite!: () => void;
    writeText.mockImplementationOnce(() => new Promise<void>(r => (resolveWrite = r)));
    const onCopied = vi.fn();
    const { api, dispose } = setup({ onCopied });
    const p = api.copy("a");
    api.reset();
    resolveWrite();
    await expect(p).resolves.toBe(true);
    flush();
    expect(api.status()).toBe("idle");
    expect(onCopied).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });

  it("an older in-flight copy does not override a newer one", async () => {
    let resolveFirst!: () => void;
    writeText.mockImplementationOnce(() => new Promise<void>(r => (resolveFirst = r)));
    const onCopied = vi.fn();
    const { api, dispose } = setup({ onCopied });
    const first = api.copy("a");
    await api.copy("b");
    flush();
    resolveFirst();
    await first;
    flush();
    expect(onCopied).toHaveBeenCalledTimes(1);
    expect(onCopied).toHaveBeenCalledWith("b");
    dispose();
  });

  it("dispose mid-window clears the timer", async () => {
    const { api, dispose } = setup();
    await api.copy("a");
    flush();
    expect(vi.getTimerCount()).toBe(1);
    dispose();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("dispose while a write is in flight: no status change, no timer, callbacks skipped", async () => {
    let resolveWrite!: () => void;
    writeText.mockImplementationOnce(() => new Promise<void>(r => (resolveWrite = r)));
    const onCopied = vi.fn();
    const { api, dispose } = setup({ onCopied });
    const p = api.copy("a");
    dispose();
    resolveWrite();
    await expect(p).resolves.toBe(true);
    flush();
    expect(api.status()).toBe("idle");
    expect(onCopied).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("dispose while a write is rejecting: onError skipped", async () => {
    let rejectWrite!: (e: unknown) => void;
    writeText.mockImplementationOnce(() => new Promise<void>((_, r) => (rejectWrite = r)));
    const onError = vi.fn();
    const { api, dispose } = setup({ onError });
    const p = api.copy("a");
    dispose();
    rejectWrite(new Error("x"));
    await expect(p).resolves.toBe(false);
    expect(onError).not.toHaveBeenCalled();
    expect(api.status()).toBe("idle");
  });

  it.each(["onCopied", "onError"] as const)(
    "a throwing %s callback does not break copy",
    async name => {
      const err = vi.spyOn(console, "error").mockImplementation(() => {});
      if (name === "onError") writeText.mockRejectedValueOnce(new Error("denied"));
      const { api, dispose } = setup({
        [name]: () => {
          throw new Error("x");
        },
      });
      await expect(api.copy("a")).resolves.toBe(name === "onCopied");
      flush();
      expect(api.status()).toBe(name === "onCopied" ? "copied" : "error");
      vi.advanceTimersByTime(2000);
      flush();
      expect(api.status()).toBe("idle");
      expect(err).toHaveBeenCalled();
      dispose();
    },
  );
});

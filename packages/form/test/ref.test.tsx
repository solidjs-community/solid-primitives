import { describe, it, expect, vi, afterEach } from "vitest";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { createForm } from "../src/index.js";

// Regression for #1143. Calling form.bind("x")(el) directly bypasses the context where Solid 2
// forbids onCleanup and creating primitives in a ref callback, so these tests mount real JSX refs.

let disposers: Array<() => void> = [];

function mount(App: () => any) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(App, container);
  const unmount = () => {
    dispose();
    container.remove();
  };
  disposers.push(unmount);
  return { container, unmount };
}

afterEach(() => {
  disposers.forEach(d => d());
  disposers = [];
});

describe("createForm as JSX ref callbacks", () => {
  it("mounts the documented README usage without throwing", () => {
    expect(() =>
      mount(() => {
        const form = createForm({ fields: { email: { initial: "" } } });
        return (
          <form ref={form.ref}>
            <input ref={form.bind("email")} />
            <button type="submit">Submit</button>
          </form>
        );
      }),
    ).not.toThrow();
  });

  it("intercepts the native submit event", async () => {
    const onSubmit = vi.fn();
    const { container } = mount(() => {
      const form = createForm({
        fields: { email: { initial: "a@b.c" } },
        onSubmit,
      });
      return (
        <form ref={form.ref}>
          <input ref={form.bind("email")} />
        </form>
      );
    });

    const formEl = container.querySelector("form")!;
    const event = new Event("submit", { cancelable: true, bubbles: true });
    formEl.dispatchEvent(event);
    await Promise.resolve();
    flush();

    expect(event.defaultPrevented).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]![0]).toEqual({ email: "a@b.c" });
  });

  it("syncs the DOM to the field in both directions", () => {
    let form!: ReturnType<typeof createForm<{ email: { initial: string } }>>;
    const { container } = mount(() => {
      form = createForm({ fields: { email: { initial: "start" } } });
      return (
        <form ref={form.ref}>
          <input ref={form.bind("email")} />
        </form>
      );
    });
    const input = container.querySelector("input")!;

    // initial value is written synchronously by the ref callback
    expect(input.value).toBe("start");

    // DOM -> field
    input.value = "typed";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    flush();
    expect(form.fields.email.value()).toBe("typed");

    // field -> DOM
    form.fields.email.setValue("from-code");
    flush();
    expect(input.value).toBe("from-code");
  });

  it("tracks touched state on blur", () => {
    let form!: ReturnType<typeof createForm<{ email: { initial: string } }>>;
    const { container } = mount(() => {
      form = createForm({ fields: { email: { initial: "" } } });
      return <input ref={form.bind("email")} />;
    });
    const input = container.querySelector("input")!;

    expect(form.fields.email.touched()).toBe(false);
    input.dispatchEvent(new Event("blur"));
    flush();
    expect(form.fields.email.touched()).toBe(true);
  });

  it("supports checkable inputs", () => {
    let form!: ReturnType<typeof createForm<{ agree: { initial: boolean } }>>;
    const { container } = mount(() => {
      form = createForm({ fields: { agree: { initial: false } } });
      return <input type="checkbox" ref={form.bind("agree")} />;
    });
    const input = container.querySelector("input")!;

    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    flush();
    expect(form.fields.agree.value()).toBe(true);

    form.fields.agree.setValue(false);
    flush();
    expect(input.checked).toBe(false);
  });

  it("removes every listener when the ref is cleaned up", () => {
    let form!: ReturnType<typeof createForm<{ email: { initial: string } }>>;
    const onSubmit = vi.fn();
    const { container, unmount } = mount(() => {
      form = createForm({ fields: { email: { initial: "" } }, onSubmit });
      return (
        <form ref={form.ref}>
          <input ref={form.bind("email")} />
        </form>
      );
    });
    const formEl = container.querySelector("form")!;
    const input = container.querySelector("input")!;

    unmount();

    // listeners are gone: nothing reaches the form state or the submit handler any more
    input.value = "after-unmount";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("blur"));
    const event = new Event("submit", { cancelable: true, bubbles: true });
    formEl.dispatchEvent(event);
    flush();

    expect(form.fields.email.value()).toBe("");
    expect(form.fields.email.touched()).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

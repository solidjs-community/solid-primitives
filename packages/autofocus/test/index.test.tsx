import { describe, test, expect } from "vitest";
import { createSignal } from "solid-js";
import { autofocus, createAutofocus } from "../src";
import { render } from "@solidjs/testing-library";

autofocus;

describe("use:autofocus", () => {
  test("use:autofocus focuses the element", async () => {
    const result = render(() => (
      <button use:autofocus autofocus>
        Autofocused
      </button>
    ));
    await new Promise(r => setTimeout(r, 1)); // Wait for the internal setTimeout() to run.
    expect(document.activeElement).toBe(result.container.querySelector("button"));
  });

  test("use:autofocus doesn't focus when autofocus={false}", async () => {
    const result = render(() => (
      <button use:autofocus autofocus={false}>
        Not Autofocused
      </button>
    ));
    await new Promise(r => setTimeout(r, 1)); // Wait for the internal setTimeout() to run.
    expect(document.activeElement).toBe(document.body);
  });

  test("doesn't focus with use:autofocus={false}", async () => {
    const result = render(() => (
      <button use:autofocus={false} autofocus>
        Not Autofocused
      </button>
    ));
    await new Promise(r => setTimeout(r, 1)); // Wait for the internal setTimeout() to run.
    expect(document.activeElement).toBe(document.body);
  });
});

describe("createAutofocus", () => {
  test("createAutofocus focuses the element", async () => {
    const result = render(() => {
      let ref!: HTMLButtonElement;

      createAutofocus(() => ref);

      return <button ref={ref}>Autofocused</button>;
    });

    await new Promise(r => setTimeout(r, 1)); // Wait for the internal setTimeout() to run.
    expect(document.activeElement).toBe(result.container.querySelector("button"));
  });

  test("createAutofocus works with signal", async () => {
    const result = render(() => {
      const [ref, setRef] = createSignal<HTMLButtonElement>();

      createAutofocus(ref);

      return <button ref={setRef}>Autofocused</button>;
    });

    await new Promise(r => setTimeout(r, 1)); // Wait for the internal setTimeout() to run.
    expect(document.activeElement).toBe(result.container.querySelector("button"));
  });

  test("createAutofocus doesn't focus when autofocus is passed false", async () => {
    const result = render(() => {
      let ref!: HTMLButtonElement;

      createAutofocus(() => ref, false);

      return <button ref={ref}>Autofocused</button>;
    });

    await new Promise(r => setTimeout(r, 1)); // Wait for the internal setTimeout() to run.
    expect(document.activeElement).toBe(document.body);
  });
});

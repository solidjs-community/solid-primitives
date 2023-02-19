import { describe, test, expect } from "vitest";
import type { JSX } from "solid-js";
import { createRoot } from "solid-js";
import { render } from "solid-js/web";
import { createStoreFactory } from "../src";

const initialState = { value: true };


const [FactoryProvider, {useStore, produce, unwrapped, state}] = createStoreFactory(
  initialState,
  (state, setState) => ({
    toggle: () => setState(val => ({...val, value: !val.value})),
    get: () => state.value,
  })
);

describe("createStoreFactory", () => {
  test("render state value", () => {
    const [_, {get}] = useStore();
    const TestChild = () => <div>{get().toString()}</div>;
    const container = document.createElement("div");
    document.body.appendChild(container);

    const unmount = render(
      () => (
        <FactoryProvider>
          <TestChild />
        </FactoryProvider>
      ),
      container
    );

    expect(container.innerHTML, "Not correctly rendered").toBe(`<div>${initialState.value.toString()}</div>`);

    unmount();
    document.body.removeChild(container);
  });

  test("toggle state value with actions", () => {
    const [_, {toggle, get}] = useStore();
    const TestChild = () => <div>{get().toString()}</div>;
    const container = document.createElement("div");
    document.body.appendChild(container);

    const unmount = render(
      () => (
        <FactoryProvider>
          <TestChild />
        </FactoryProvider>
      ),
      container
    );

    expect(container.innerHTML, "Not correctly rendered").toBe(`<div>${initialState.value.toString()}</div>`);
    toggle();
    expect(container.innerHTML, "Not correctly rendered").toBe(`<div>${!initialState.value.toString()}</div>`);

    unmount();
    document.body.removeChild(container);
  });

  test("toggle state value with localized mutation via `produce`", () => {
    const [_, {get}] = useStore();
    const TestChild = () => <div>{get().toString()}</div>;
    const container = document.createElement("div");
    document.body.appendChild(container);

    const unmount = render(
      () => (
        <FactoryProvider>
          <TestChild />
        </FactoryProvider>
      ),
      container
    );

    expect(container.innerHTML, "Not correctly rendered").toBe(`<div>${initialState.value.toString()}</div>`);
    produce(s => ({...s, value: !s.value}));
    expect(container.innerHTML, "Not correctly rendered").toBe(`<div>${!initialState.value.toString()}</div>`);

    unmount();
    document.body.removeChild(container);
  });

  test("unwrapped", () => {
    const [_, {get}] = useStore();
    const TestChild = () => <div>{get().toString()}</div>;
    const container = document.createElement("div");
    document.body.appendChild(container);

    const unmount = render(
      () => (
        <FactoryProvider>
          <TestChild />
        </FactoryProvider>
      ),
      container
    );

    expect(container.innerHTML, "Not correctly rendered").toBe(`<div>${initialState.value.toString()}</div>`);

    expect(state, "Should return a proxy to the data").to.not.eq(initialState);

    const unwrappedState = unwrapped();
    expect(unwrappedState, "Should return underlying data without a proxy").toBe(initialState);

    unmount();
    document.body.removeChild(container);
  });



});





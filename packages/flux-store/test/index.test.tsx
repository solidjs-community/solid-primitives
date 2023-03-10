import { describe, test, expect } from "vitest";
import { produce } from "solid-js/store";
import { createFluxStoreFactory, createFluxStore } from "../src";

const id = "test id";
const initialState = { id, value: true };
const testState = { id, value: true };

const fluxFactory = createFluxStoreFactory(initialState, {
  actions: (setState, state) => ({
    set: setState,
    toggle: () => setState("value", !state.value),
  }),
  getters: state => ({
    get: () => state.value,
    getId: () => state.id,
  }),
});

describe("createFluxFactory", () => {
  test("get default state value", () => {
    const { state, getters } = fluxFactory();

    expect(state.value).toBe(testState.value);
    expect(getters.get()).toBe(testState.value);
  });

  test("toggle state value with actions", () => {
    const { state, getters, actions } = fluxFactory();

    expect(state.value).toBe(testState.value);
    expect(getters.get()).toBe(testState.value);
    actions.toggle();
    expect(state.value).toBe(!testState.value);
    expect(getters.get()).toBe(!testState.value);
  });

  test("override default state value", () => {
    const { state, getters } = fluxFactory({ id, value: false });

    expect(state.value).toBe(!testState.value);
    expect(getters.get()).toBe(!testState.value);
  });

  test("create multiple instances with factory using initial state", () => {
    const { state: state1, getters: getters1, actions: actions1 } = fluxFactory();
    const { state: state2, getters: getters2, actions: actions2 } = fluxFactory();

    expect(state1.value).toBe(testState.value);
    expect(state2.value).toBe(testState.value);
    expect(getters1.get()).toBe(testState.value);
    expect(getters2.get()).toBe(testState.value);
    actions2.toggle();
    expect(state1.value).toBe(testState.value);
    expect(state2.value).toBe(!testState.value);
    expect(getters1.get()).toBe(testState.value);
    expect(getters2.get()).toBe(!testState.value);
    actions1.toggle();
    expect(state1.value).toBe(!testState.value);
    expect(state2.value).toBe(!testState.value);
    expect(getters1.get()).toBe(!testState.value);
    expect(getters2.get()).toBe(!testState.value);
  });

  test("create multiple instances with factory using object to override", () => {
    const overrideState = { id, value: false };
    const { state: state1, getters: getters1, actions: actions1 } = fluxFactory(overrideState);
    const { state: state2, getters: getters2, actions: actions2 } = fluxFactory(overrideState);

    expect(state1.value).toBe(!testState.value);
    expect(state2.value).toBe(!testState.value);
    expect(getters1.get()).toBe(!testState.value);
    expect(getters2.get()).toBe(!testState.value);
    actions2.toggle();
    expect(state1.value).toBe(!testState.value);
    expect(state2.value).toBe(testState.value);
    expect(getters1.get()).toBe(!testState.value);
    expect(getters2.get()).toBe(testState.value);
    actions1.toggle();
    expect(state1.value).toBe(testState.value);
    expect(state2.value).toBe(testState.value);
    expect(getters1.get()).toBe(testState.value);
    expect(getters2.get()).toBe(testState.value);
  });

  test("create multiple instances with factory using function to override", () => {
    const {
      state: state1,
      getters: getters1,
      actions: actions1,
    } = fluxFactory(s => ({ ...s, value: false }));
    const {
      state: state2,
      getters: getters2,
      actions: actions2,
    } = fluxFactory(s => ({ ...s, value: false }));

    expect(state1.value).toBe(!testState.value);
    expect(state2.value).toBe(!testState.value);
    expect(getters1.get()).toBe(!testState.value);
    expect(getters2.get()).toBe(!testState.value);
    actions2.toggle();
    expect(state1.value).toBe(!testState.value);
    expect(state2.value).toBe(testState.value);
    expect(getters1.get()).toBe(!testState.value);
    expect(getters2.get()).toBe(testState.value);
    actions1.toggle();
    expect(state1.value).toBe(testState.value);
    expect(state2.value).toBe(testState.value);
    expect(getters1.get()).toBe(testState.value);
    expect(getters2.get()).toBe(testState.value);
  });

  test("manually change multiple instances with factory using initial state", () => {
    const { state: state1, getters: getters1, actions: actions1 } = fluxFactory();
    const { state: state2, getters: getters2, actions: actions2 } = fluxFactory();

    expect(state1.value).toBe(testState.value);
    expect(state2.value).toBe(testState.value);
    expect(getters1.get()).toBe(testState.value);
    expect(getters2.get()).toBe(testState.value);
    actions2.set("value", !testState.value);
    expect(state1.value).toBe(testState.value);
    expect(state2.value).toBe(!testState.value);
    expect(getters1.get()).toBe(testState.value);
    expect(getters2.get()).toBe(!testState.value);
    actions1.set("value", !testState.value);
    expect(state1.value).toBe(!testState.value);
    expect(state2.value).toBe(!testState.value);
    expect(getters1.get()).toBe(!testState.value);
    expect(getters2.get()).toBe(!testState.value);
  });

  test("locally change multiple instances with factory using initial state", () => {
    const { state: state1, getters: getters1, actions: actions1 } = fluxFactory();
    const { state: state2, getters: getters2, actions: actions2 } = fluxFactory();

    expect(state1.value).toBe(testState.value);
    expect(state2.value).toBe(testState.value);
    expect(getters1.get()).toBe(testState.value);
    expect(getters2.get()).toBe(testState.value);
    actions2.set(produce(s => (s.value = !s.value)));
    expect(state1.value).toBe(testState.value);
    expect(state2.value).toBe(!testState.value);
    expect(getters1.get()).toBe(testState.value);
    expect(getters2.get()).toBe(!testState.value);
    actions1.set(produce(s => (s.value = !s.value)));
    expect(state1.value).toBe(!testState.value);
    expect(state2.value).toBe(!testState.value);
    expect(getters1.get()).toBe(!testState.value);
    expect(getters2.get()).toBe(!testState.value);
  });

  test("manually change state value", () => {
    const { state, getters, actions } = fluxFactory();

    expect(state.value).toBe(testState.value);
    expect(getters.get()).toBe(testState.value);
    actions.set("value", !testState.value);
    expect(state.value).toBe(!testState.value);
    expect(getters.get()).toBe(!testState.value);
    expect(state.id).toBe(id);
    expect(getters.getId()).toBe(id);
  });

  test("locally change state value", () => {
    const { state, getters, actions } = fluxFactory();

    expect(state.value).toBe(testState.value);
    expect(getters.get()).toBe(testState.value);
    actions.set(produce(s => (s.value = !s.value)));
    expect(state.value).toBe(!testState.value);
    expect(getters.get()).toBe(!testState.value);
    expect(state.id).toBe(id);
    expect(getters.getId()).toBe(id);
  });
});

describe("createFluxStore", () => {
  const getInitialState = () => ({ ...initialState });

  test("get default state value", () => {
    const { state, getters } = createFluxStore(getInitialState(), {
      actions: (setState, state) => ({
        set: setState,
        toggle: () => setState("value", !state.value),
      }),
      getters: state => ({
        get: () => state.value,
        getId: () => state.id,
      }),
    });

    expect(state.value).toBe(testState.value);
    expect(getters.get()).toBe(testState.value);
  });

  test("toggle state value with actions", () => {
    const { state, getters, actions } = createFluxStore(getInitialState(), {
      actions: (setState, state) => ({
        set: setState,
        toggle: () => setState("value", !state.value),
      }),
      getters: state => ({
        get: () => state.value,
        getId: () => state.id,
      }),
    });

    expect(state.value).toBe(testState.value);
    expect(getters.get()).toBe(testState.value);
    expect(state.id).toBe(id);
    expect(getters.getId()).toBe(id);
    actions.toggle();
    expect(state.value).toBe(!testState.value);
    expect(getters.get()).toBe(!testState.value);
    expect(state.id).toBe(id);
    expect(getters.getId()).toBe(id);
  });

  test("manually change state value with actions", () => {
    const { state, getters, actions } = createFluxStore(getInitialState(), {
      actions: (setState, state) => ({
        set: setState,
        toggle: () => setState("value", !state.value),
      }),
      getters: state => ({
        get: () => state.value,
        getId: () => state.id,
      }),
    });

    expect(state.value).toBe(testState.value);
    expect(getters.get()).toBe(testState.value);
    expect(state.id).toBe(id);
    expect(getters.getId()).toBe(id);
    actions.set("value", !testState.value);
    expect(state.value).toBe(!testState.value);
    expect(getters.get()).toBe(!testState.value);
    expect(state.id).toBe(id);
    expect(getters.getId()).toBe(id);
  });

  test("locally change state value with actions", () => {
    const { state, getters, actions } = createFluxStore(getInitialState(), {
      actions: (setState, state) => ({
        set: setState,
        toggle: () => setState("value", !state.value),
      }),
      getters: state => ({
        get: () => state.value,
        getId: () => state.id,
      }),
    });

    expect(state.value).toBe(testState.value);
    expect(getters.get()).toBe(testState.value);
    actions.set(produce(s => (s.value = !s.value)));
    expect(state.value).toBe(!testState.value);
    expect(getters.get()).toBe(!testState.value);
    expect(state.id).toBe(id);
    expect(getters.getId()).toBe(id);
  });
});

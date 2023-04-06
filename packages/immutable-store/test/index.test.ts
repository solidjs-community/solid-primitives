import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createImmutable } from "../src";
import { unwrap } from "solid-js/store";

describe("createImmutable", () => {
  test("Reconcile a simple object", () => {
    createRoot(() => {
      const [data, setData] = createSignal<{ data: number; missing?: string }>({
        data: 2,
        missing: "soon",
      });
      const state = createImmutable(data);
      expect(state.data).toBe(2);
      expect(state.missing).toBe("soon");
      setData({ data: 5 });
      expect(state.data).toBe(5);
      expect(state.missing).toBeUndefined();
    });
  });

  test("Reconcile array with nulls", () => {
    createRoot(() => {
      const [data, setData] = createSignal([null, "a"]);
      const state = createImmutable(data);
      expect(state[0]).toBe(null);
      expect(state[1]).toBe("a");
      setData(["b", null]);
      expect(state[0]).toBe("b");
      expect(state[1]).toBe(null);
    });
  });

  test("Reconcile a simple object on a nested path", () => {
    createRoot(() => {
      const [data, setData] = createSignal<{
        data: { user: { firstName: string; middleName: string; lastName?: string } };
      }>({
        data: { user: { firstName: "John", middleName: "", lastName: "Snow" } },
      });
      const state = createImmutable(data);
      expect(state.data.user.firstName).toBe("John");
      expect(state.data.user.lastName).toBe("Snow");
      setData({ data: { user: { firstName: "Jake", middleName: "R" } } });
      expect(state.data.user.firstName).toBe("Jake");
      expect(state.data.user.middleName).toBe("R");
      expect(state.data.user.lastName).toBeUndefined();
    });
  });

  test("Reconcile a simple object on a nested path with no prev state", () => {
    createRoot(() => {
      const [data, setData] = createSignal<{ user?: { firstName: string; middleName: string } }>(
        {},
      );
      const state = createImmutable(data);
      expect(state.user).toBeUndefined();
      setData({ user: { firstName: "Jake", middleName: "R" } });
      expect(state.user!.firstName).toBe("Jake");
      expect(state.user!.middleName).toBe("R");
    });
  });

  test("Reconcile reorder a keyed array", () => {
    createRoot(() => {
      const JOHN = { id: 1, firstName: "John", lastName: "Snow" },
        NED = { id: 2, firstName: "Ned", lastName: "Stark" },
        BRANDON = { id: 3, firstName: "Brandon", lastName: "Start" },
        ROBERT = { id: 4, firstName: "Robert", lastName: "Start" };
      const [data, setData] = createSignal({ users: [JOHN, NED, BRANDON] });
      const state = createImmutable(data);
      expect(Object.is(unwrap(state.users[0]), JOHN)).toBe(true);
      expect(Object.is(unwrap(state.users[1]), NED)).toBe(true);
      expect(Object.is(unwrap(state.users[2]), BRANDON)).toBe(true);
      setData({ users: [NED, JOHN, BRANDON] });
      expect(Object.is(unwrap(state.users[0]), NED)).toBe(true);
      expect(Object.is(unwrap(state.users[1]), JOHN)).toBe(true);
      expect(Object.is(unwrap(state.users[2]), BRANDON)).toBe(true);
      setData({ users: [NED, BRANDON, JOHN] });
      expect(Object.is(unwrap(state.users[0]), NED)).toBe(true);
      expect(Object.is(unwrap(state.users[1]), BRANDON)).toBe(true);
      expect(Object.is(unwrap(state.users[2]), JOHN)).toBe(true);
      setData({ users: [NED, BRANDON, JOHN, ROBERT] });
      expect(Object.is(unwrap(state.users[0]), NED)).toBe(true);
      expect(Object.is(unwrap(state.users[1]), BRANDON)).toBe(true);
      expect(Object.is(unwrap(state.users[2]), JOHN)).toBe(true);
      expect(Object.is(unwrap(state.users[3]), ROBERT)).toBe(true);
      setData({ users: [BRANDON, JOHN, ROBERT] });
      expect(Object.is(unwrap(state.users[0]), BRANDON)).toBe(true);
      expect(Object.is(unwrap(state.users[1]), JOHN)).toBe(true);
      expect(Object.is(unwrap(state.users[2]), ROBERT)).toBe(true);
    });
  });

  test("Reconcile overwrite in non-keyed merge mode", () => {
    createRoot(() => {
      const JOHN = { id: 1, firstName: "John", lastName: "Snow" },
        NED = { id: 2, firstName: "Ned", lastName: "Stark" },
        BRANDON = { id: 3, firstName: "Brandon", lastName: "Start" };
      const [data, setData] = createSignal({
        users: [{ ...JOHN }, { ...NED }, { ...BRANDON }],
      });
      const state = createImmutable(data, {
        merge: true,
        key: null,
      });
      expect(state.users[0]!.id).toBe(1);
      expect(state.users[0]!.firstName).toBe("John");
      expect(state.users[1]!.id).toBe(2);
      expect(state.users[1]!.firstName).toBe("Ned");
      expect(state.users[2]!.id).toBe(3);
      expect(state.users[2]!.firstName).toBe("Brandon");
      setData({ users: [{ ...NED }, { ...JOHN }, { ...BRANDON }] });
      expect(state.users[0]!.id).toBe(2);
      expect(state.users[0]!.firstName).toBe("Ned");
      expect(state.users[1]!.id).toBe(1);
      expect(state.users[1]!.firstName).toBe("John");
      expect(state.users[2]!.id).toBe(3);
      expect(state.users[2]!.firstName).toBe("Brandon");
    });
  });

  test("Reconcile top level key mismatch", () => {
    createRoot(() => {
      const JOHN = { id: 1, firstName: "John", lastName: "Snow" },
        NED = { id: 2, firstName: "Ned", lastName: "Stark" };

      const [data, setData] = createSignal(JOHN);
      const user = createImmutable(data);
      expect(user.id).toBe(1);
      expect(user.firstName).toBe("John");
      setData(NED);
      expect(user.id).toBe(2);
      expect(user.firstName).toBe("Ned");
    });
  });

  test("Reconcile nested top level key mismatch", () => {
    createRoot(() => {
      const JOHN = { id: 1, firstName: "John", lastName: "Snow" },
        NED = { id: 2, firstName: "Ned", lastName: "Stark" };

      const [data, setData] = createSignal({ user: JOHN });
      const user = createImmutable(data);
      expect(user.user.id).toBe(1);
      expect(user.user.firstName).toBe("John");
      setData({ user: NED });
      expect(user.user.id).toBe(2);
      expect(user.user.firstName).toBe("Ned");
    });
  });

  test("Reconcile top level key missing", () => {
    createRoot(() => {
      const [data, setData] = createSignal<{ id?: number; value?: string }>({
        id: 0,
        value: "value",
      });
      const store = createImmutable(data);
      setData({});
      expect(store.id).toBe(undefined);
      expect(store.value).toBe(undefined);
    });
  });
});

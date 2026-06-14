import { describe, test, expect } from "vitest";
import * as solid from "solid-js";
import { $PROXY, flush } from "solid-js";
import { createMutable } from "../src/index.js";

describe("State Mutability", () => {
  test("Setting a property", () => {
    const user = createMutable({ name: "John" });
    expect(user.name).toBe("John");
    user.name = "Jake";
    expect(user.name).toBe("Jake");
  });

  test("Deleting a property", () => {
    const user = createMutable({ name: "John" });
    expect(user.name).toBe("John");
    // @ts-ignore
    delete user.name;
    expect(user.name).toBeUndefined();
  });
});

describe("State Getter/Setters", () => {
  test("Testing an update from state", () => {
    let user: any;
    solid.createRoot(() => {
      user = createMutable({
        name: "John",
        get greeting(): string {
          return `Hi, ${this.name}`;
        },
      });
    });
    expect(user.greeting).toBe("Hi, John");
    user.name = "Jake";
    expect(user.greeting).toBe("Hi, Jake");
  });

  test("setting a value with setters", () => {
    let user: any;
    solid.createRoot(() => {
      user = createMutable({
        firstName: "John",
        lastName: "Smith",
        get fullName(): string {
          return `${this.firstName} ${this.lastName}`;
        },
        set fullName(value) {
          const parts = value.split(" ");
          this.firstName = parts[0]!;
          this.lastName = parts[1]!;
        },
      });
    });
    expect(user.fullName).toBe("John Smith");
    user.fullName = "Jake Murray";
    expect(user.firstName).toBe("Jake");
    expect(user.lastName).toBe("Murray");
  });
});

describe("Simple update modes", () => {
  test("Simple Key Value", () => {
    const state = createMutable({ key: "" });
    state.key = "value";
    expect(state.key).toBe("value");
  });

  test("Nested update", () => {
    const state = createMutable({ data: { starting: 1, ending: 1 } });
    state.data.ending = 2;
    expect(state.data.starting).toBe(1);
    expect(state.data.ending).toBe(2);
  });

  test("Test Array", () => {
    const todos = createMutable([
      { id: 1, title: "Go To Work", done: true },
      { id: 2, title: "Eat Lunch", done: false },
    ]);
    todos[1]!.done = true;
    todos.push({ id: 3, title: "Go Home", done: false });
    expect(Array.isArray(todos)).toBe(true);
    expect(todos[1]!.done).toBe(true);
    expect(todos[2]!.title).toBe("Go Home");
  });
});

describe("Unwrapping Edge Cases", () => {
  test("Nested frozen state object is not wrapped", () => {
    const state = createMutable({
      data: Object.freeze({ user: { firstName: "John", lastName: "Snow" } }),
    });
    // frozen objects are not wrapped as reactive proxies
    expect(state.data.user.firstName).toBe("John");
    expect(state.data.user.lastName).toBe("Snow");
    // @ts-ignore check if not proxy
    expect(state.data.user[$PROXY]).toBeUndefined();
  });
  test("Nested frozen array elements are accessible", () => {
    const state = createMutable({
      data: [{ user: { firstName: "John", lastName: "Snow" } }],
    });
    expect(state.data[0]!.user.firstName).toBe("John");
    expect(state.data[0]!.user.lastName).toBe("Snow");
  });
  test("Nested frozen state array is not wrapped", () => {
    const state = createMutable({
      data: Object.freeze([{ user: { firstName: "John", lastName: "Snow" } }]),
    });
    // frozen arrays are not wrapped
    expect(state.data[0]!.user.firstName).toBe("John");
    expect(state.data[0]!.user.lastName).toBe("Snow");
  });
});

describe("Tracking State changes", () => {
  test("Track a state change", () => {
    let state: { data: number };
    solid.createRoot(() => {
      state = createMutable({ data: 2 });
      let executionCount = 0;

      expect.assertions(2);
      solid.createEffect(
        () => state!.data,
        data => {
          if (executionCount === 0) expect(data).toBe(2);
          else if (executionCount === 1) {
            expect(data).toBe(5);
          } else {
            // should never get here
            expect(executionCount).toBe(-1);
          }
          executionCount++;
        },
      );
    });
    flush();
    state!.data = 5;
    flush();
    // same value again should not retrigger
    state!.data = 5;
  });

  test("Deleting an undefined property", () => {
    let state: { firstName: string; lastName: string | undefined };
    let executionCount = 0;
    solid.createRoot(() => {
      state = createMutable({
        firstName: "John",
        lastName: undefined,
      });

      solid.createEffect(
        () => state!.lastName,
        () => {
          executionCount++;
        },
      );
    });
    flush(); // initial effect run
    delete state!.lastName;
    flush(); // re-run after delete
    expect(executionCount).toBe(2);
  });

  test("Track a nested state change", () => {
    let executionCount = 0;
    let state: { user: { firstName: string; lastName: string } };
    solid.createRoot(() => {
      state = createMutable({
        user: { firstName: "John", lastName: "Smith" },
      });
      expect.assertions(2);
      solid.createEffect(
        () => state!.user.firstName,
        firstName => {
          if (executionCount === 0) {
            expect(firstName).toBe("John");
          } else if (executionCount === 1) {
            expect(firstName).toBe("Jake");
          } else {
            // should never get here
            expect(executionCount).toBe(-1);
          }
          executionCount++;
        },
      );
    });
    flush();
    state!.user.firstName = "Jake";
    flush();
  });
});

describe("Handling functions in state", () => {
  test("Array Native Methods: Array.Filter", () => {
    solid.createRoot(() => {
      const list = createMutable([0, 1, 2]),
        getFiltered = solid.createMemo(() => list.filter(i => i % 2));
      expect(getFiltered()).toStrictEqual([1]);
    });
  });

  test("Track function change", () => {
    solid.createRoot(() => {
      const state = createMutable<{ fn: () => number }>({
          fn: () => 1,
        }),
        getValue = solid.createMemo(() => state.fn());
      state.fn = () => 2;
      flush();
      expect(getValue()).toBe(2);
    });
  });
});

describe("Setting state from Effects", () => {
  test("Setting state from signal", () => {
    let state: { data: string };
    let getData: solid.Accessor<string>, setData: solid.Setter<string>;
    solid.createRoot(() => {
      ([getData, setData] = solid.createSignal("init")), (state = createMutable({ data: "" }));
      solid.createEffect(
        () => getData(),
        data => {
          state!.data = data;
        },
      );
    });
    flush(); // initial effect: sets state.data = "init"
    setData!("signal");
    flush();
    expect(state!.data).toBe("signal");
  });

  test("set async", () => {
    const state = createMutable({ data: "" });
    state.data = "promised";
    expect(state.data).toBe("promised");
  });
});

describe("State wrapping", () => {
  test("Setting plain object", () => {
    const data = { withProperty: "y" },
      state = createMutable({ data });
    // not wrapped
    expect(state.data).not.toBe(data);
  });
  test("Setting plain array", () => {
    const data = [1, 2, 3],
      state = createMutable({ data });
    // not wrapped
    expect(state.data).not.toBe(data);
  });
  test("Setting non-wrappable", () => {
    const date = new Date(),
      state = createMutable({ time: date });
    // not wrapped
    expect(state.time).toBe(date);
  });
  test("Array operations are consistent", () => {
    const state = createMutable([1, 2, 3]);
    expect(state.length).toBe(3);
    const move = state.splice(1, 1);
    expect(state.length).toBe(2);
    state.splice(0, 0, ...move);
    expect(state.length).toBe(3);
    expect(state).toEqual([2, 1, 3]);
    expect(state.length).toBe(3);
    expect(state).toEqual([2, 1, 3]);
  });
});

describe("In Operator", () => {
  test("wrapped nested class", () => {
    let access = 0;
    const store = createMutable<{ a?: number; b?: number; c?: number }>({
      a: 1,
      get b() {
        access++;
        return 2;
      },
    });

    expect("a" in store).toBe(true);
    expect("b" in store).toBe(true);
    expect("c" in store).toBe(false);
    expect(access).toBe(0);

    const [a, b, c] = solid.createRoot(() => {
      return [
        solid.createMemo(() => "a" in store),
        solid.createMemo(() => "b" in store),
        solid.createMemo(() => "c" in store),
      ];
    });

    expect(a()).toBe(true);
    expect(b()).toBe(true);
    expect(c()).toBe(false);
    expect(access).toBe(0);

    store.c = 3;
    flush();

    expect(a()).toBe(true);
    expect(b()).toBe(true);
    expect(c()).toBe(true);
    expect(access).toBe(0);

    delete store.a;
    flush();
    expect(a()).toBe(false);
    expect(b()).toBe(true);
    expect(c()).toBe(true);
    expect(access).toBe(0);

    expect("a" in store).toBe(false);
    expect("b" in store).toBe(true);
    expect("c" in store).toBe(true);
    expect(access).toBe(0);
  });
});

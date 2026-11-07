import { describe, expect, test } from "vitest";
import {
  createRoot,
  createSignal,
  createEffect,
  createMemo,
  getOwner,
  createStore,
  reconcile,
  type Store,
  snapshot,
} from "solid-js";
import { createErrorBoundary } from "solid-js/internal";
import {
  createDeepSignal,
  type Resource,
  type ResourceFetcherInfo,
  createResource
} from "../src/index.ts"

describe("Simulate a dynamic fetch", () => {
  let resolve: (v: string) => void,
    reject: (r: string) => void,
    trigger: (v: string) => void,
    value: Resource<string | undefined>,
    error: Error;
  function fetcher(_id: string) {
    return new Promise<string>((r, f) => {
      resolve = r;
      reject = f;
    });
  }

  test("initial async resource", async () => {
    createRoot(() => {
      const [id, setId] = createSignal("1");
      trigger = setId;
      createErrorBoundary(
        () => {
          value = createResource(id, fetcher)[0];
          createEffect(value, _ => {});
        },
        e => (error = e() as Error)
      );
    });
    expect(value()).toBeUndefined();
    expect(value.latest).toBeUndefined();
    expect(value.loading).toBe(true);
    resolve("John");
    await Promise.resolve();
    expect(value()).toBe("John");
    expect(value.latest).toBe("John");
    expect(value.loading).toBe(false);
  });

  test("test out of order", async () => {
    trigger("2");
    expect(value.loading).toBe(true);
    const resolve1 = resolve;
    trigger("3");
    const resolve2 = resolve;
    resolve2("Jake");
    resolve1("Jo");
    await Promise.resolve();
    expect(value()).toBe("Jake");
    expect(value.loading).toBe(false);
  });

  test("promise rejection", async () => {
    trigger("4");
    expect(value.loading).toBe(true);
    expect(value.error).toBeUndefined();
    reject("Because I said so");
    await Promise.resolve();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Because I said so");
    expect(value.error).toBeInstanceOf(Error);
    expect(value.error.message).toBe("Because I said so");
    expect(value.loading).toBe(false);
  });
});

describe("Simulate a dynamic fetch with state and reconcile", () => {
  interface User {
    firstName: string;
    address: {
      streetNumber: number;
      streetName: string;
    };
  }
  let resolve: (v: User) => void,
    refetch: (info?: unknown) => void,
    user: Resource<User | undefined>,
    state: { user?: User; userLoading: boolean },
    count = 0;
  function fetcher(_: unknown, { value }: ResourceFetcherInfo<Store<User>>) {
    expect(getOwner()).toBeDefined();
    return new Promise<User>(r => {
      resolve = r;
    }).then(next => reconcile(next)(value!));
  }
  const data: User[] = [];
  data.push({ firstName: "John", address: { streetNumber: 4, streetName: "Grindel Rd" } });
  data.push({ ...data[0], firstName: "Joseph" } as User);

  test("initial async resource", async () => {
    createRoot(async () => {
      [user, { refetch }] = createResource(fetcher);
      [state] = createStore<{ user?: User; userLoading: boolean }>({
        get user() {
          return user();
        },
        get userLoading() {
          return user.loading;
        }
      });
      createEffect(() => state.user, () => { count++; });
    });
    expect(state.user).toBeUndefined();
    expect(state.userLoading).toBe(true);
    resolve(data[0]!);
    await Promise.resolve();
    await Promise.resolve();
    expect(snapshot(state.user)).toStrictEqual(data[0]);
    expect(state.userLoading).toBe(false);
    expect(count).toBe(2);

    refetch();
    expect(state.userLoading).toBe(true);
    resolve(data[1]!);
    await Promise.resolve();
    await Promise.resolve();
    expect(snapshot(state.user)).toStrictEqual(data[0]);
    expect(state.user?.firstName).toBe("Joseph");
    expect(snapshot(state.user?.address)).toStrictEqual(data[0]!.address);
    expect(state.userLoading).toBe(false);
    expect(count).toBe(2);
  });
});

describe("using Resource with no root", () => {
  test("loads default value", () => {
    expect(() => {
      let resolve: (v: string) => void;
      createResource("error", () => new Promise(r => (resolve = r)));
      resolve!("Hi");
    }).not.toThrow();
  });
});

describe("using Resource with initial Value", () => {
  let resolve: (v: string) => void,
    reject: (r: unknown) => void,
    value: Resource<string>,
    error: unknown;
  function fetcher(_id: string) {
    return new Promise<string>((r, f) => {
      resolve = r;
      reject = f;
    });
  }
  test("loads default value", async () => {
    createRoot(() => {
      const [id] = createSignal("1");
      createErrorBoundary(
        () => {
          [value] = createResource(id, fetcher, { initialValue: "Loading" });
          createEffect(value, () => {});
        },
        e => {
          error = e();
          reject(error);
        }
      );
    });
    expect(value()).toBe("Loading");
    expect(value.loading).toBe(true);
    resolve("John");
    await Promise.resolve();
    expect(value()).toBe("John");
    expect(value.loading).toBe(false);
  });
});

describe("using Resource with errors", () => {
  let reject: (e: any) => void,
    value: Resource<string | undefined>,
    error: unknown;
  function fetcher(_id: string) {
    return new Promise<string>((_r, f) => {
      reject = f;
    });
  }
  test("works with falsy errors", async () => {
    createRoot(() => {
      const [id] = createSignal("1");
      createErrorBoundary(
        () => {
          [value] = createResource(id, fetcher);
          createEffect(value, () => {});
        },
        e => (error = e())
      );
    });
    expect(value()).toBeUndefined();
    expect(value.state === "pending").toBe(true);
    expect(value.error).toBeUndefined();
    reject(null);
    await Promise.resolve();
    expect(value.state === "errored").toBe(true);
    expect(error).toBe(null);
    expect(value.error.message).toBe("Unknown error");
  });
});

describe("using Resource with synchronous error", () => {
  let value: Resource<number | undefined>;
  let error: Error;
  test("catches the error", async () => {
    createRoot(() => {
      createErrorBoundary(
        () => {
          [value] = createResource(() => {
            throw new Error("Fetcher error");
          });
          createEffect(value, () => {});
        },
        e => {
          error = e() as Error;
        }
      );
    });
    expect(value.state === "errored").toBe(true);
    expect(value.error).toBe(error);
    expect(value.error.message).toBe("Fetcher error");
  });
});

describe("using Resource with custom store", () => {
  type User = {
    firstName: string;
    lastName: string;
    address: {
      streetNumber: number;
      streetName: string;
      city: string;
      state: string;
      zip: number;
    };
  };
  let resolve: (v: User) => void;
  let value: Resource<User>;
  function fetcher() {
    return new Promise<User>(r => {
      resolve = r;
    });
  }  
  test("loads and diffs", async () => {
    let first = 0;
    let last = 0;
    let addr = 0;
    let street = 0;
    createRoot(() => {
      [value] = createResource(fetcher, {
        initialValue: {
          firstName: "John",
          lastName: "Smith",
          address: {
            streetNumber: 4,
            streetName: "Grindel Rd",
            city: "New York",
            state: "NY",
            zip: 10001
          }
        },
        storage: createDeepSignal
      });
      createEffect(() => value()?.firstName, () => { first++; });
      createEffect(() => value()?.lastName, () => { last++; });
      const address = createMemo(() => (addr++, value()?.address));
      createEffect(() => address()?.streetName, () => { street++; });
    });
    expect(value()).toEqual({
      firstName: "John",
      lastName: "Smith",
      address: {
        streetNumber: 4,
        streetName: "Grindel Rd",
        city: "New York",
        state: "NY",
        zip: 10001
      }
    });
    expect(value.loading).toBe(true);
    expect(first).toBe(1);
    expect(last).toBe(1);
    expect(addr).toBe(1);
    expect(street).toBe(1);
    resolve({
      firstName: "Matt",
      lastName: "Smith",
      address: {
        streetNumber: 4,
        streetName: "Central Rd",
        city: "New York",
        state: "NY",
        zip: 10001
      }
    });
    await Promise.resolve();
    expect(value()).toEqual({
      firstName: "Matt",
      lastName: "Smith",
      address: {
        streetNumber: 4,
        streetName: "Central Rd",
        city: "New York",
        state: "NY",
        zip: 10001
      }
    });
    expect(value.loading).toBe(false);
    expect(first).toBe(2);
    expect(last).toBe(1);
    expect(addr).toBe(1);
    expect(street).toBe(2);
  });

  test("mutates", async () => {
    let first = 0;
    let last = 0;
    let addr = 0;
    let street = 0;
    let mutate: <T>(v: T) => T;
    createRoot(() => {
      [value, { mutate }] = createResource(false, fetcher, {
        initialValue: {
          firstName: "John",
          lastName: "Smith",
          address: {
            streetNumber: 4,
            streetName: "Grindel Rd",
            city: "New York",
            state: "NY",
            zip: 10001
          }
        },
        storage: createDeepSignal
      });
      createEffect(() => value()?.firstName, () => { first++; });
      createEffect(() => value()?.lastName, () => { last++; });
      const address = createMemo(() => (addr++, value()?.address));
      createEffect(() => address()?.streetName, () => { street++; });
    });
    expect(value()).toEqual({
      firstName: "John",
      lastName: "Smith",
      address: {
        streetNumber: 4,
        streetName: "Grindel Rd",
        city: "New York",
        state: "NY",
        zip: 10001
      }
    });
    expect(value.loading).toBe(false);
    expect(first).toBe(1);
    expect(last).toBe(1);
    expect(addr).toBe(1);
    expect(street).toBe(1);
    mutate!({
      firstName: "Matt",
      lastName: "Smith",
      address: {
        streetNumber: 4,
        streetName: "Central Rd",
        city: "New York",
        state: "NY",
        zip: 10001
      }
    });
    await Promise.resolve();
    expect(value()).toEqual({
      firstName: "Matt",
      lastName: "Smith",
      address: {
        streetNumber: 4,
        streetName: "Central Rd",
        city: "New York",
        state: "NY",
        zip: 10001
      }
    });
    expect(value.loading).toBe(false);
    expect(first).toBe(2);
    expect(last).toBe(1);
    expect(addr).toBe(1);
    expect(street).toBe(2);
  });
});

describe("createResource can be wrapped", () => {
  const fns: [name: string, function: typeof createResource][] = [
    ["original createResource", createResource],
    // @ts-ignore
    ["createResource(...args)", (...args) => createResource(...args)],
    // @ts-ignore
    ["createResource(a, b, c)", (a, b, c) => createResource(a, b, c)]
  ];

  for (const [name, fn] of fns) {
    test(`only fetcher in ${name}`, () => {
      const [[data], dispose] = createRoot(dispose => [fn(() => 123), dispose]);
      expect(data()).toBe(123);
      dispose();
    });

    test(`fetcher and source in ${name}`, () => {
      const [source, setSource] = createSignal(1);

      const [[data], dispose] = createRoot(dispose => [fn(source, v => v), dispose]);
      expect(data()).toBe(1);

      setSource(2);
      expect(data()).toBe(2);

      dispose();
    });
  }
});
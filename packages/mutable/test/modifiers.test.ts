import { describe, test, expect } from "vitest";
import { createMutable, modifyMutable } from "../src/index.js";

describe("modifyMutable", () => {
  test("Modify a simple object", () => {
    const state = createMutable<{ data: number; missing?: string }>({
      data: 2,
      missing: "soon",
    });
    expect(state.data).toBe(2);
    expect(state.missing).toBe("soon");

    modifyMutable(state, s => {
      s.data = 5;
      delete (s as any).missing;
    });

    expect(state.data).toBe(5);
    expect(state.missing).toBeUndefined();
  });

  test("Modify a simple object on a nested path", () => {
    const state = createMutable<{
      data: { user: { firstName: string; middleName: string; lastName?: string } };
    }>({
      data: { user: { firstName: "John", middleName: "", lastName: "Snow" } },
    });
    expect(state.data.user.firstName).toBe("John");
    expect(state.data.user.lastName).toBe("Snow");

    modifyMutable(state.data.user, u => {
      u.firstName = "Jake";
      u.middleName = "R";
      delete (u as any).lastName;
    });

    expect(state.data.user.firstName).toBe("Jake");
    expect(state.data.user.middleName).toBe("R");
    expect(state.data.user.lastName).toBeUndefined();
  });

  test("Modify an array by reordering elements", () => {
    const state = createMutable({
      users: [
        { id: 1, firstName: "John" },
        { id: 2, firstName: "Ned" },
        { id: 3, firstName: "Brandon" },
      ],
    });

    expect(state.users[0]!.firstName).toBe("John");
    expect(state.users[1]!.firstName).toBe("Ned");
    expect(state.users[2]!.firstName).toBe("Brandon");

    modifyMutable(state.users, users => {
      const temp = users[0]!;
      users[0] = users[1]!;
      users[1] = temp;
    });

    expect(state.users[0]!.firstName).toBe("Ned");
    expect(state.users[1]!.firstName).toBe("John");
    expect(state.users[2]!.firstName).toBe("Brandon");
  });

  test("Modify multiple properties in one call", () => {
    const state = createMutable({ a: 1, b: 2, c: 3 });

    modifyMutable(state, s => {
      s.a = 10;
      s.b = 20;
      s.c = 30;
    });

    expect(state.a).toBe(10);
    expect(state.b).toBe(20);
    expect(state.c).toBe(30);
  });
});

import { describe, expect, test } from "vitest";
import * as i18n from "../src/new-i18n.js";

describe("resolved values", () => {
  test("function", () => {
    const fn = (a: number, b: string, c: object): number => a + b.length + Object.keys(c).length;
    const translated = i18n.resolved(fn, 1, "two", { foo: "bar" });
    expect(translated).toBe(5);
  });

  test("string", () => {
    expect(i18n.resolved("hello!")).toBe("hello!");
    expect(i18n.resolved("hello {{name}}!", { name: "Tester" })).toBe("hello Tester!");
    expect(i18n.resolved("hello {{name}} and {{extra}}!", { name: "Tester", extra: "John" })).toBe(
      "hello Tester and John!",
    );
  });

  test("other value", () => {
    expect(i18n.resolved(1)).toBe(1);
    expect(i18n.resolved(true)).toBe(true);
    expect(i18n.resolved(null)).toBe(null);
    expect(i18n.resolved(undefined)).toBe(undefined);
  });
});

class MyClass {
  constructor(public name: string) {}
}

const en_dict = {
  hello: "Hello {{name}}! How is your {{thing}}?",
  numbers: {
    1: "one",
    2: "two",
    3: "three",
  },
  data: {
    class: new MyClass("hello"), // test classes
    currency: {
      name: "dollar",
      symbol: "$",
      iso: "USD",
      "to.usd": 1, // test dot notation
    },
    users: [{ name: "John" }, { name: "Kate" }],
    formatList(list: string[]) {
      const last = list.pop();
      return `${list.join(", ")} and ${last}`;
    },
  },
};

describe("flatDict", () => {
  test("flatDict", () => {
    const flat = i18n.flatDict(en_dict);

    expect(flat).toEqual({
      ...en_dict,
      "numbers.1": "one",
      "numbers.2": "two",
      "numbers.3": "three",
      "data.class": en_dict.data.class,
      "data.currency": en_dict.data.currency,
      "data.currency.name": "dollar",
      "data.currency.symbol": "$",
      "data.currency.iso": "USD",
      "data.currency.to.usd": 1,
      "data.users": en_dict.data.users,
      "data.users.0": en_dict.data.users[0],
      "data.users.0.name": "John",
      "data.users.1": en_dict.data.users[1],
      "data.users.1.name": "Kate",
      "data.formatList": en_dict.data.formatList,
    } satisfies typeof flat);
  });
});

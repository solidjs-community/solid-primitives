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
    expect(i18n.resolved("hello {{name}} and {{extra}}!" as string)).toBe(
      "hello {{name}} and {{extra}}!",
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

describe("dict", () => {
  // test("flatDict", () => {
  //   const flat = i18n.flatDict(en_dict);

  //   expect(flat).toEqual({
  //     ...en_dict,
  //     "numbers.1": "one",
  //     "numbers.2": "two",
  //     "numbers.3": "three",
  //     "data.class": en_dict.data.class,
  //     "data.currency": en_dict.data.currency,
  //     "data.currency.name": "dollar",
  //     "data.currency.symbol": "$",
  //     "data.currency.iso": "USD",
  //     "data.currency.to.usd": 1,
  //     "data.users": en_dict.data.users,
  //     "data.users.0": en_dict.data.users[0],
  //     "data.users.0.name": "John",
  //     "data.users.1": en_dict.data.users[1],
  //     "data.users.1.name": "Kate",
  //     "data.formatList": en_dict.data.formatList,
  //   } satisfies typeof flat);
  // });

  test("resolverDict", () => {
    const resolvers = i18n.resolverDict(en_dict);

    const hello = resolvers.hello({ name: "Tester", thing: "day" });
    expect(hello).toBe("Hello Tester! How is your day?");

    const numbers = resolvers.numbers();
    expect(numbers).toEqual(en_dict.numbers);

    const number1 = resolvers["numbers.1"]();
    expect(number1).toBe("one");

    const data = resolvers.data();
    expect(data).toEqual(en_dict.data);

    const data_class = resolvers["data.class"]();
    expect(data_class).toBe(en_dict.data.class);

    const currency = resolvers["data.currency"]();
    expect(currency).toEqual(en_dict.data.currency);

    const currency_name = resolvers["data.currency.name"]();
    expect(currency_name).toBe("dollar");

    const currency_to_usd = resolvers["data.currency.to.usd"]();
    expect(currency_to_usd).toBe(1);

    const users = resolvers["data.users"]();
    expect(users).toEqual(en_dict.data.users);

    const users_0 = resolvers["data.users.0"]!();
    expect(users_0).toEqual(en_dict.data.users[0]);

    const users_0_name = resolvers["data.users.0.name"]!();
    expect(users_0_name).toBe("John");

    const users_69_resolver = resolvers["data.users.69"];
    expect(users_69_resolver).toBeUndefined();

    const users_69_name_resolver = resolvers["data.users.69.name"];
    expect(users_69_name_resolver).toBeUndefined();

    const format_list = resolvers["data.formatList"](["John", "Kate", "Tester"]);
    expect(format_list).toBe("John, Kate and Tester");
  });
});

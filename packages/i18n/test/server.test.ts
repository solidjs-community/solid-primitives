import { describe, expect, test } from "vitest";
import * as i18n from "../src/new-i18n.js";
import { en_dict } from "./setup.js";

describe("template", () => {
  test("identity template resolver", () => {
    expect(i18n.identityResolveTemplate("hello!")).toBe("hello!");

    expect(i18n.identityResolveTemplate("hello {{name}}!", { name: "Tester" })).toBe(
      "hello {{name}}!",
    );
  });

  test("default template resolver", () => {
    expect(i18n.resolveTemplate("hello!")).toBe("hello!");

    expect(i18n.resolveTemplate("hello {{name}}!", { name: "Tester" })).toBe("hello Tester!");
  });
});

describe("flatDict", () => {
  test("flatDict", () => {
    const flat = i18n.flatten(en_dict);

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

describe("chainedResolver", () => {
  test("initial", () => {
    const flat_dict = i18n.flatten(en_dict);
    const t = i18n.translator(() => flat_dict, i18n.resolveTemplate);

    const chained = i18n.chained(en_dict, t);
    const hello = chained.hello({ name: "Tester", thing: "day" });
    expect(hello).toBe("Hello Tester! How is your day?");

    const number1 = chained.numbers[1]();
    expect(number1).toBe("one");

    const data_class = chained.data.class();
    expect(data_class).toBe(en_dict.data.class);

    const currency_name = chained.data.currency.name();
    expect(currency_name).toBe("dollar");

    const currency_to_usd = chained.data.currency["to.usd"]();
    expect(currency_to_usd).toBe(1);

    const users = chained.data.users();
    expect(users).toEqual(en_dict.data.users);

    const format_list = chained.data.formatList(["John", "Kate", "Tester"]);
    expect(format_list).toBe("John, Kate and Tester");
  });
});

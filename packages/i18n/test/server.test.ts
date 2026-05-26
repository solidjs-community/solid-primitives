import { describe, expect, test } from "vitest";
import * as i18n from "../src/index.js";
import { enDict } from "./setup.js";

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
    const flat = i18n.flatten(enDict);

    expect(flat).toEqual({
      ...enDict,
      "numbers.1": "one",
      "numbers.2": "two",
      "numbers.3": "three",
      "data.class": enDict.data.class,
      "data.currency": enDict.data.currency,
      "data.currency.name": "dollar",
      "data.currency.symbol": "$",
      "data.currency.iso": "USD",
      "data.currency.to.usd": 1,
      "data.users": enDict.data.users,
      "data.users.0": enDict.data.users[0],
      "data.users.0.name": "John",
      "data.users.1": enDict.data.users[1],
      "data.users.1.name": "Kate",
      "data.formatList": enDict.data.formatList,
    } satisfies typeof flat);
  });
});

describe("chainedResolver", () => {
  test("initial", () => {
    const flatDict = i18n.flatten(enDict);
    const t = i18n.translator(() => flatDict, i18n.resolveTemplate);

    const chained = i18n.chainedTranslator(enDict, t);
    const hello = chained.hello({ name: "Tester", thing: "day" });
    expect(hello).toBe("Hello Tester! How is your day?");

    const number1 = chained.numbers[1]();
    expect(number1).toBe("one");

    const dataClass = chained.data.class();
    expect(dataClass).toBe(enDict.data.class);

    const currencyName = chained.data.currency.name();
    expect(currencyName).toBe("dollar");

    const currencyToUsd = chained.data.currency["to.usd"]();
    expect(currencyToUsd).toBe(1);

    const users = chained.data.users();
    expect(users).toEqual(enDict.data.users);

    const formatList = chained.data.formatList(["John", "Kate", "Tester"]);
    expect(formatList).toBe("John, Kate and Tester");

    const jsx = chained.jsx("Tester");
    expect(jsx).toBeInstanceOf(Object);
  });
});

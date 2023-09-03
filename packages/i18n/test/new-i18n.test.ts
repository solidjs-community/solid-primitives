import { describe, expect, test } from "vitest";
import * as i18n from "../src/new-i18n.js";
import { createEffect, createResource, createRoot, createSignal } from "solid-js";

const options_with_template: i18n.ResolverOptions = {
  resolveTemplate: i18n.resolveTemplate,
};

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

    expect(i18n.resolveTemplate("hello {{ name }}!", { name: "Tester" })).toBe("hello Tester!");

    expect(
      i18n.resolveTemplate("hello {{name}} and {{extra}}!", { name: "Tester", extra: "John" }),
    ).toBe("hello Tester and John!");

    expect(
      i18n.resolveTemplate("hello {{ name }} and {{ extra }}!", { name: "Tester", extra: "John" }),
    ).toBe("hello Tester and John!");

    expect(i18n.resolveTemplate("hello {{name}} and {{extra}}!")).toBe(
      "hello {{name}} and {{extra}}!",
    );
  });
});

class MyClass {
  constructor(public name: string) {}
}

const en_dict = {
  hello: i18n.template<{ name: string; thing: string }>("Hello {{name}}! How is your {{thing}}?"),
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

type Dict = typeof en_dict;
type Locale = "en" | "pl";

const pl_dict = {
  hello: i18n.template("Cześć {{name}}!"),
  numbers: {
    1: "jeden",
    2: "dwa",
    3: "trzy",
  },
  data: {
    class: new MyClass("cześć"),
    currency: {
      name: "złoty",
      symbol: "zł",
      iso: "PLN",
      "to.usd": 0.27,
    },
    users: [{ name: "Jan" }, { name: "Kasia" }, { name: "Tester" }],
    formatList(list: string[]) {
      const last = list.pop();
      return `${list.join(", ")} i ${last}`;
    },
  },
} satisfies Dict;

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

describe("chainedResolver", () => {
  let flat_dict = i18n.flatDict(en_dict);

  const t = i18n.translator(() => flat_dict, options_with_template);

  const chained = i18n.chained(en_dict, t);

  test("initial", () => {
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

  test("after change", () => {
    flat_dict = i18n.flatDict(pl_dict);

    const hello = chained.hello({ name: "Tester", thing: "dzień" });
    expect(hello).toBe("Cześć Tester!");

    const number1 = chained.numbers[1]();
    expect(number1).toBe("jeden");

    const data_class = chained.data.class();
    expect(data_class).toBe(pl_dict.data.class);

    const currency_name = chained.data.currency.name();
    expect(currency_name).toBe("złoty");

    const currency_to_usd = chained.data.currency["to.usd"]();
    expect(currency_to_usd).toBe(0.27);

    const users = chained.data.users();
    expect(users).toEqual(pl_dict.data.users);

    const format_list = chained.data.formatList(["John", "Kate", "Tester"]);
    expect(format_list).toBe("John, Kate i Tester");
  });
});

describe("reactive", () => {
  test("with translator", async () => {
    const [locale, setLocale] = createSignal<Locale>("en");
    let hello = "";
    let to_usd = 0;

    const dispose = createRoot(dispose => {
      const [dict] = createResource(
        locale,
        async locale => {
          const dict = locale === "en" ? en_dict : pl_dict;
          return i18n.flatDict(dict);
        },
        { initialValue: i18n.flatDict(en_dict) },
      );

      const t = i18n.translator(dict, options_with_template);
      const chained = i18n.chained(en_dict, t);

      createEffect(() => {
        hello = t("hello", { name: "Tester", thing: "day" });
        to_usd = chained.data.currency["to.usd"]();
      });

      return dispose;
    });

    expect(hello).toBe("Hello Tester! How is your day?");
    expect(to_usd).toBe(1);

    setLocale("pl");
    await Promise.resolve();
    expect(hello).toBe("Cześć Tester!");
    expect(to_usd).toBe(0.27);

    dispose();
  });
});

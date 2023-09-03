import * as i18n from "../src/new-i18n.js";

export class MyClass {
  constructor(public name: string) {}
}

export const en_dict = {
  hello: i18n.template<{ name: string; thing: string }>("Hello {{name}}! How is your {{thing}}?"),
  numbers: {
    1: "one",
    2: "two",
    3: "three",
  },
  data: {
    class: new MyClass("hello"),
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

export type Dict = typeof en_dict;
export type Locale = "en" | "pl";

export const pl_dict = {
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

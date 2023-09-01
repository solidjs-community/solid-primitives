import { Component } from "solid-js";
import * as i18n from "../src/new-i18n.js";

const pl_dict = {
  hello: "Cześć {{name}}!",
  numbers: {
    1: "jeden",
    2: "dwa",
    3: "trzy",
  },
  data: {
    currency: {
      name: "złoty",
      symbol: "zł",
      iso: "PLN",
      to_usd: 0.27,
    },
    users: ["Jan", "Kasia", "Marek"],
    formatList(list: string[]): string {
      const last = list.pop();
      return `${list.join(", ")} i ${last}`;
    },
  },
} satisfies i18n.Dict;

type MyDict = typeof pl_dict;

const en_dict: MyDict = {
  hello: "Hello {{name}}!",
  numbers: {
    1: "one",
    2: "two",
    3: "three",
  },
  data: {
    currency: {
      name: "dollar",
      symbol: "$",
      iso: "USD",
      to_usd: 1,
    },
    users: ["John", "Kate", "Mark", "Paul", "Anna"],
    formatList(list) {
      const last = list.pop();
      return `${list.join(", ")} and ${last}`;
    },
  },
};

const flat_dict = i18n.flatDict(en_dict);
//       ^?

console.log(flat_dict);

export const NewI18nApp: Component = () => {
  return (
    <div>
      <h1>TODO: NewI18nApp</h1>
    </div>
  );
};

import * as i18n from "../src/index.js";

export const dict = {
  hello: i18n.template<{ name: string }>("hello {{ name }}, how are you?"),
  goodbye: ({ name }: { name: string }) => `goodbye ${name}`,
  food: {
    meat: "meat",
  },
};

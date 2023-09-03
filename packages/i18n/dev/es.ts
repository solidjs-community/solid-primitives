import type { I18nDict } from "./index.jsx";

export const dict: I18nDict = {
  hello: "hola {{ name }}, como usted?" as any,
  goodbye: ({ name }: { name: string }) => `adios ${name}`,
  food: {
    meat: "carne",
  },
};

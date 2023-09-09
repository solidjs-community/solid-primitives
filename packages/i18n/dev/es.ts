import type { RawDictionary } from "./index.jsx";

export const dict: RawDictionary = {
  hello: "hola {{ name }}, como usted?" as any,
  goodbye: ({ name }: { name: string }) => `adios ${name}`,
  food: {
    meat: "carne",
  },
};

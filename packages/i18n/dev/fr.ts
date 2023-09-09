import type { RawDictionary } from "./index.jsx";

export const dict: RawDictionary = {
  hello: "bonjour {{ name }}, comment vas-tu ?" as any,
  goodbye: ({ name }: { name: string }) => `au revoir ${name}`,
  food: {
    meat: "viande",
  },
};

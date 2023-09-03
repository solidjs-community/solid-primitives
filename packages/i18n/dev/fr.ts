import type { I18nDict } from "./index.jsx";

export const dict: I18nDict = {
  hello: "bonjour {{ name }}, comment vas-tu ?" as any,
  goodbye: ({ name }: { name: string }) => `au revoir ${name}`,
  food: {
    meat: "viande",
  },
};

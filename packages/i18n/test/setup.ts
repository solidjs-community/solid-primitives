export const dict = {
  fr: {
    hello: "bonjour {{ name }}, comment vas-tu ?",
    goodbye: ({ name }: { name: string }) => `au revoir ${name}`,
    food: {
      meat: "viande",
    },
    "keys.with.dots": "salut"
  },
  en: {
    hello: "hello {{ name }}, how are you?",
    goodbye: ({ name }: { name: string }) => `goodbye ${name}`,
    food: {
      meat: "meat",
    },
    "keys.with.dots": "hi"
  },
  es: {
    hello: "hola {{ name }}, como usted?",
    goodbye: ({ name }: { name: string }) => `adios ${name}`,
    food: {
      meat: "carne",
    },
    "keys.with.dots": "hola"
  },
};

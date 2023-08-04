export const dict = {
  fr: {
    hello: "bonjour {{ name }}, comment vas-tu ?",
    goodbye: ({ name }: { name: string }) => `au revoir ${name}`,
    food: {
      meat: "viande",
    },
  },
  en: {
    hello: "hello {{ name }}, how are you?",
    "hello.name": "hello {{ name }}, how are you?",
    goodbye: ({ name }: { name: string }) => `goodbye ${name}`,
    food: {
      meat: "meat",
    },
  },
  es: {
    hello: "hola {{ name }}, como usted?",
    goodbye: ({ name }: { name: string }) => `adios ${name}`,
    food: {
      meat: "carne",
    },
  },
};

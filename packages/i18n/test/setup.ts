export const dict = {
  fr: {
    hello: "bonjour {{ name }}, comment vas-tu ?",
    goodbye: ({ name }: { name: string }) => `au revoir ${name}`
  },
  en: {
    hello: "hello {{ name }}, how are you?",
    goodbye: ({ name }: { name: string }) => `goodbye ${name}`
  },
  es: {
    hello: "hola {{ name }}, como usted?",
    goodbye: ({ name }: { name: string }) => `adios ${name}`
  }
};

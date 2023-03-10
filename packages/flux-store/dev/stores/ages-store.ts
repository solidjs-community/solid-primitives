import { createFluxStoreFactory } from "../../src/index";

const agesFluxFactory = createFluxStoreFactory(
  {
    age: 0,
    mana: 100,
    name: "unknown",
  },
  {
    getters: state => ({
      days: () => state.age * 365,
      yearsOld: () => `${state.age} years old`,
      isWizard: () => state.mana > 100 || state.age >= 50,
    }),
    actions: (setState, state) => ({
      birthday: () => setState("age", state.age + 1),
    }),
  },
);

export type Person = ReturnType<typeof agesFluxFactory>;

export const aliceAge: Person = agesFluxFactory(init => ({ ...init, age: 45, name: "Alice" }));
export const bobAge: Person = agesFluxFactory({ age: 40, mana: 200, name: "Bob" });
export const tomAge: Person = agesFluxFactory(init => ({ ...init, age: 35, name: "Tom" }));

export const getPeople: () => Person[] = () => [aliceAge, bobAge, tomAge];
export const getWizards: () => Person[] = () =>
  getPeople().filter(person => person.getters.isWizard());

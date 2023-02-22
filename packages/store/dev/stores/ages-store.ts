import { createStoreFactory } from "../../dist";

const agesStoreFactory = createStoreFactory(
  {
    age: 0
  },
  {
    getters: state => ({
      days: () => state.age * 365,
      yearsOld: () => `${state.age} years old`
    }),
    actions: (setState, state) => ({
      birthday: () => setState("age", state.age + 1)
    })
  }
);

export const tomAge = agesStoreFactory({ age: 35 });
export const bobAge = agesStoreFactory({ age: 40 });
export const aliceAge = agesStoreFactory({ age: 45 });

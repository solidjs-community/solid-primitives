import * as API from ".";

export const createPrimitiveTemplate: typeof API.createPrimitiveTemplate = v => [
  () => v,
  () => undefined
];

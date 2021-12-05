import { Accessor, Setter, createSignal } from 'solid-js';

/**
 * A template example of how to create a new primitive.
 *
 * @param param An example of an introductory parameter
 * @return Returns the same parameter as an accessor
 */
const createPrimitiveTemplate = (init: string): [
  get: Accessor<string>,
  set: Setter<string>
] => {
  const [value, setValue] = createSignal(init);
  return [value, setValue];
};

export default createPrimitiveTemplate;

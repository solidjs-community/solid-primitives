import { Accessor, Setter, createSignal } from 'solid-js';

/**
 * A template example of how to create a new primitive.
 *
 * @param param An example of an introductory parameter
 * @return Returns the same parameter as an accessor
 */
const createPrimitiveTemplate = (param: boolean): [
  get: Accessor<boolean>,
  set: Setter<boolean>
] => {
  const [value, setValue] = createSignal(param);
  return [value, setValue];
};

export default createPrimitiveTemplate;

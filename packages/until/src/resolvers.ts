import { access, MaybeAccessor, MaybeAccessorValue } from "@solid-primitives/utils";
import { Accessor } from "solid-js";

// For now "resolvers" is an idea to explore

export function changed(source: Accessor<any>, times = 1): Accessor<boolean> {
  times += 1;
  return () => {
    source();
    return !--times;
  };
}

export function includes<A extends MaybeAccessor<any>>(
  list: MaybeAccessor<MaybeAccessorValue<A>[]>,
  item: A
): Accessor<boolean> {
  return () => access(list).includes(access(item));
}

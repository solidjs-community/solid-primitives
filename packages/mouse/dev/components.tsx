import { access, MaybeAccessor } from "solid-fns";
import { Component, For } from "solid-js";

export const DisplayRecord: Component<{ record: Record<string, MaybeAccessor<any>> }> = props => (
  <For each={Object.keys(props.record)}>
    {k => (
      <p>
        {k}:{" "}
        {() => {
          const val = access(props.record[k]);
          return typeof val === "number" ? parseInt(val as any) : String(val);
        }}
      </p>
    )}
  </For>
);

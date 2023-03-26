import { Component, onCleanup } from "solid-js";
import { isServer, NoHydration } from "solid-js/web";

export const DocumentClass: Component<{ class: string }> = props => {
  if (!isServer) {
    document.documentElement.classList.add(props.class);
    onCleanup(() => {
      document.documentElement.classList.remove(props.class);
    });
  }

  return (
    <NoHydration>
      <script>{`document.documentElement.classList.add("${props.class}")`}</script>
    </NoHydration>
  );
};

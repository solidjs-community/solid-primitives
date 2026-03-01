import type { Component } from "solid-js";
import { createResource, Show } from "solid-js";

const PackageReadme: Component<{ name: string }> = props => {
  const [html] = createResource(
    () => props.name,
    async name => {
      const mod = await import(`~/_generated/readme/${name}.html?raw`);
      return (mod as any).default as string;
    },
  );

  return (
    <Show when={html()}>
      {content => (
        <div
          class="readme-content"
          innerHTML={content()}
          style={{ "margin-top": "1.5rem" }}
        />
      )}
    </Show>
  );
};

export default PackageReadme;

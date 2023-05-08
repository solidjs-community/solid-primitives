import { Component, Suspense, lazy } from "solid-js";
import { Title } from "solid-start";
import { useParams } from "@solidjs/router";
import { Dynamic } from "solid-js/web";

const modules = Object.entries(import.meta.glob("~/../../packages/*/dev/index.tsx")).reduce(
  (acc, [path, fn]) => {
    const name = path.split("/").at(-3);
    if (name) acc[name] = lazy(fn as any);
    return acc;
  },
  {} as Record<string, Component>,
);

export default function Playground() {
  const params = useParams<{ name: string }>();

  return (
    <main class="pt-[60px]">
      <Title>Solid Primitives Playground</Title>

      <h2>Solid Primitives Playground</h2>

      <div>
        <Suspense>
          <Dynamic component={modules[params.name]} />
        </Suspense>
      </div>
    </main>
  );
}

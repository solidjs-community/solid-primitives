import { Component, Suspense, createMemo, lazy } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Title, useParams } from "solid-start";
import { HEADER_HEIGHT } from "~/components/Header/Header";
import "./playground.scss";
import { kebabCaseToCapitalized } from "~/utils/utils";

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

  const formattedName = createMemo(() => kebabCaseToCapitalized(params.name));

  return (
    <main style={{ "padding-top": `${HEADER_HEIGHT}px` }}>
      <Title>{formattedName()} — Playground</Title>

      <div class="m-8">
        <h1 class="text-3xl font-bold capitalize sm:text-4xl">{formattedName()} — Playground</h1>
      </div>

      <div class="package-playground">
        <Suspense>
          <Dynamic component={modules[params.name]} />
        </Suspense>
      </div>
    </main>
  );
}

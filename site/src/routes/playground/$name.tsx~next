import { type Component, Suspense, lazy } from "solid-js";
import { Dynamic } from "solid-js/web";
import { createFileRoute, notFound } from "@tanstack/solid-router";
import { HEADER_HEIGHT } from "~/components/Header/Header.jsx";
import NotFound from "~/components/NotFound.jsx";
import { ClientOnly } from "~/primitives/client-only.js";
import { kebabCaseToCapitalized } from "~/utils.js";
import "./-playground.scss";

const modules = Object.entries(
  import.meta.glob([
    "../../../../packages/*/dev/index.tsx",
    // `filesystem` pulls in `chokidar`/`fsevents` which are Node-only and
    // cannot be bundled for the browser.
    "!../../../../packages/filesystem/**",
  ]),
).reduce(
  (acc, [path, fn]) => {
    const name = path.split("/").at(-3);
    if (name) acc[name] = lazy(fn as any);
    return acc;
  },
  {} as Record<string, Component>,
);

export const Route = createFileRoute("/playground/$name")({
  component: PlaygroundPage,
  // Render the 404 page for unknown package names (e.g. /playground/wefwe)
  // instead of an empty playground. The loader checks the glob-generated
  // `modules` map and throws `notFound()` when there's no match.
  notFoundComponent: NotFound,
  loader: ({ params }) => {
    if (!(params.name in modules)) throw notFound();
    return null;
  },
  head: ({ params, loaderData }) => ({
    meta: [
      {
        title:
          loaderData === null
            ? `${kebabCaseToCapitalized(params.name)} — Playground`
            : "Not Found — Solid Primitives",
      },
    ],
  }),
});

function PlaygroundPage() {
  const params = Route.useParams();
  const formattedName = () => kebabCaseToCapitalized(params().name);

  return (
    <main style={{ "padding-top": `${HEADER_HEIGHT}px` }}>
      <div class="m-8">
        <h1 class="text-3xl font-bold capitalize sm:text-4xl">{formattedName()} — Playground</h1>
      </div>

      <div class="package-playground">
        <ClientOnly>
          <Suspense>
            <Dynamic component={modules[params().name]} />
          </Suspense>
        </ClientOnly>
      </div>
    </main>
  );
}

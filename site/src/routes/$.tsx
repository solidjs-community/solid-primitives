import { createFileRoute, notFound } from "@tanstack/solid-router";
import NotFound from "~/components/NotFound.jsx";

// Catch-all route — matches any URL not handled by another file route. We
// define it as a real route (with its own `head` and `notFoundComponent`) so
// the 404 page gets the right `<title>` even on direct SSR hits — TanStack runs
// the matched route's `head` config during SSR. Throwing `notFound()` from the
// loader propagates a 404 HTTP status and routes rendering through this route's
// own `notFoundComponent` (not the root's).
export const Route = createFileRoute("/$")({
  loader: () => {
    throw notFound();
  },
  notFoundComponent: NotFound,
  head: () => ({
    meta: [{ title: "Not Found — Solid Primitives" }],
  }),
});

import { debounce } from "@solid-primitives/scheduled";
import { hydrate } from "@solidjs/web";
import { hydrateStart, StartClient } from "@tanstack/solid-start/client";

// Primitives/Table.tsx produces a lot of hydration warnings in development mode.
// Batch them into a single collapsed group so the dev console stays usable.
if (import.meta.env.MODE === "development") {
  const keys: string[] = [];
  // eslint-disable-next-line no-console
  const cw = console.warn;
  // eslint-disable-next-line no-console
  console.warn = (...args) => {
    if (args[0] === "Unable to find DOM nodes for hydration key:") {
      keys.push(args[1]);
      logStoredWarnings();
    } else cw(...args);
  };
  const logStoredWarnings = debounce(() => {
    // eslint-disable-next-line no-console
    console.groupCollapsed(`There were ${keys.length} hydration warnings.`);
    keys.forEach(key => cw("Unable to find DOM nodes for hydration key:", key));
    // eslint-disable-next-line no-console
    console.groupEnd();
    keys.length = 0;
  }, 1000);
}

hydrateStart().then(router => {
  hydrate(() => <StartClient router={router} />, document);
});

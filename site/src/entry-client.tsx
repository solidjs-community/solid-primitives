import { debounce } from "@solid-primitives/scheduled";
import { mount, StartClient } from "solid-start/entry-client";

// Primitives/Table.tsx produces a lot of hydration warnings in development mode.
if (import.meta.env.MODE === "development") {
  const keys: string[] = [];
  const cw = console.warn;
  console.warn = (...args) => {
    if (args[0] === "Unable to find DOM nodes for hydration key:") {
      keys.push(args[1]);
      logStoredWarnings();
    } else cw(...args);
  };
  const logStoredWarnings = debounce(() => {
    console.groupCollapsed(`There were ${keys.length} hydration warnings.`);
    keys.forEach(key => cw("Unable to find DOM nodes for hydration key:", key));
    console.groupEnd();
    keys.length = 0;
  }, 1000);
}

mount(() => <StartClient />, document);

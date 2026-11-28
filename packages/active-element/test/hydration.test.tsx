import { describe, it, expect, afterEach } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

// A client-side owner created in the factory needs a matching server owner, or the hydration
// ids of everything after it shift and later elements miss their server-rendered twins.
const app = (imports: string, setup: string, tag: string) => `
import { createUniqueId } from "solid-js";
${imports}
export default function App() {
  ${setup}
  const id = createUniqueId();
  return (
    <div>
      <${tag} id="a" ref={ref}>box</${tag}>
      <span id="uid">{id}</span>
    </div>
  );
}
`;

let result: HydrationRoundTripResult | undefined;
afterEach(() => {
  result?.cleanup();
  result = undefined;
});

async function expectAligned(source: string) {
  result = await renderHydrationRoundTrip(source, import.meta.dirname);
  const serverId = /id="uid">([^<]*)</.exec(result.html)?.[1];
  expect(result.container.querySelector("#uid")!.textContent).toBe(serverId);
  expect(result.consoleMessages).toEqual([]);
}

describe("focus() hydration", () => {
  it("keeps hydration ids aligned", () =>
    expectAligned(
      app(
        `import { focus } from "@solid-primitives/active-element";`,
        `const ref = focus(() => {});`,
        "input",
      ),
    ));
});

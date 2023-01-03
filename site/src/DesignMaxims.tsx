import { For } from "solid-js";

const DesignMaxims = () => {
  const primitives = [
    "Documented and follow a consistent style guide",
    "Be well tested",
    "Small, concise and practical as possible",
    "A single primitive for a single purpose",
    "No dependencies or as few as possible",
    "SSR safe entries (or short-circuits where needed) provided",
    "Wrap base level Browser APIs",
    "Should be progressively improved for future features",
    "Be focused on composition vs. isolation of logic",
    "Community voice and needs guide road map and planning",
    "Strong TypeScript support",
    "Support for both CJS and ESM",
    "Solid performance!"
  ];
  return (
    <>
      <h2 class="text-2xl sm:text-3xl font-semibold mb-[25px]">Design Maxims</h2>
      <p class="my-2">
        Other frameworks have large and extremely well established ecosystems. Notably React which
        has a vast array of component and hooks. The amount of choice within the ecosystem is great
        but often these tools are built as one-offs resulting in often un-tested logic or are
        designed with narrow needs. Over time the less concise these building blocks are the more
        they tend to repeat themselves. Our goal with Primitives is to bring the community together
        to contribute, evolve and utilize a powerful centralize primitive foundation.
      </p>
      <p class="my-2">
        All our primitives are meant to be consistent and sustain a level of quality. We guarantee
        that each is created with the utmost care. Our primitives are:
      </p>

      <ol class="pl-10 list-decimal my-4">
        <For each={primitives}>{primitive => <li>{primitive}</li>}</For>
      </ol>
    </>
  );
};

export default DesignMaxims;

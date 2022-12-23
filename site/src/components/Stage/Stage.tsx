import { For, onCleanup, onMount } from "solid-js";
import StageBadge from "../Primitives/StageBadge";

const Stage = () => {
  const items = [
    {
      stage: "X",
      description: "Deprecated or rejected"
    },
    {
      stage: "0",
      description: "Initial Submission"
    },
    {
      stage: "1",
      description: "Demonstrations and examples"
    },
    {
      stage: "2",
      description: "General use (experimental)"
    },
    {
      stage: "3",
      description: "Pre-shipping (final effort)"
    },
    {
      stage: "4",
      description: "Accepted/Shipped"
    }
  ];

  onMount(() => {
    onCleanup(() => {
      console.log("CLEANUP onMount");
    });
  });
  onCleanup(() => {
    console.log("CLEANUP component");
  });

  return (
    <div class="bg-white rounded-md p-2 pt-3 max-w-[800px] sm:p-4">
      <h3 class="font-semibold text-lg pb-1 border-b border-slate-300">Contribution Procress</h3>
      <div class="overflow-auto max-h-[60vh]">
        <div class="max-w-[420px] rounded-xl overflow-clip relative bg-[#e5ecf3]">
          <div class="absolute top-0 left-0 right-0 bottom-0 border-[#e5ecf3] border-2 rounded-xl pointer-events-none"></div>
          <table class="w-full my-4" style="border-collapse: separate; border-spacing: 2px 2px;">
            <thead>
              <tr class="bg-white font-semibold text-[#49494B]">
                <th class="p-2 pb-1">Stage</th>
                <th class="p-2 pb-1">Description</th>
              </tr>
            </thead>
            <tbody>
              <For each={items}>
                {({ stage, description }) => {
                  return (
                    <tr class="odd:bg-[#f6fbff] even:bg-white">
                      <td class="p-1 px-2">
                        <StageBadge type="static" value={stage as any} />
                      </td>
                      <td class="p-1 px-2">{description}</td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
        <div class="leading-[28px]">
          <p class="my-4">
            Solid Primitives strives to provide idiomatic Solid principles but also allow room for
            innovation and experimentation. In a growing community many opinions and patterns merge
            together to produce a de facto standard. Managing opinions and expectations can be
            difficult. As a result, in November 2021 Solid Primitives implemented a
            ratification/approval tracking process roughly modelled on{" "}
            <a class="anchor-tag" href="https://tc39.es/process-document/" target="_blank">
              TC39 Proposal Stage Process
            </a>
            . The following summarizes these stages briefly:
          </p>

          <p class="my-4">
            Any primitive Stage 0-1 should be used with caution and with the understanding that the
            design or implementation may change. Beyond Stage 2 we make an effort to mitigate
            changes. If a primitive reaches Stage 2 it's likely to remain an official package with
            additional approvement until fully accepted and shipped.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stage;

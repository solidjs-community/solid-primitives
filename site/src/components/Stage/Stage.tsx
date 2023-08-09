import { For } from "solid-js";
import StageBadge from "../Primitives/StageBadge.js";

const Stage = () => {
  return (
    <div class="bg-page-main-bg max-w-[800px] rounded-md p-2 pt-3 sm:p-4">
      <h2 class="border-b border-slate-300 pb-1 text-lg font-semibold dark:border-slate-600">
        Contribution Procress
      </h2>
      <Content />
    </div>
  );
};

const Content = () => {
  const items = [
    {
      stage: "X",
      description: "Deprecated or rejected",
    },
    {
      stage: "0",
      description: "Initial Submission",
    },
    {
      stage: "1",
      description: "Demonstrations and examples",
    },
    {
      stage: "2",
      description: (
        <>
          General use <span class="opacity-60">(experimental)</span>
        </>
      ),
    },
    {
      stage: "3",
      description: (
        <>
          Pre-shipping <span class="opacity-60">(final effort)</span>
        </>
      ),
    },
    {
      stage: "4",
      description: "Accepted/Shipped",
    },
  ];
  return (
    <div>
      <div class="relative max-w-[420px] overflow-clip rounded-xl bg-[#e5ecf3] dark:bg-[#2b455a]">
        <div class="pointer-events-none absolute bottom-0 left-0 right-0 top-0 rounded-xl border-2 border-[#e5ecf3] dark:border-[#2b455a]"></div>
        <table class="my-4 w-full" style="border-collapse: separate; border-spacing: 2px 2px;">
          <thead>
            <tr class="bg-page-main-bg font-semibold text-[#49494B] dark:text-[#b7c1d0]">
              <th class="p-2 pb-1 text-center">Stage</th>
              <th class="p-2 pb-1">Description</th>
            </tr>
          </thead>
          <tbody>
            <For each={items}>
              {({ stage, description }) => {
                return (
                  <tr class="even:bg-page-main-bg odd:bg-[#f6fbff] dark:odd:bg-[#2b3f4a]">
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
          Any primitive Stage{" "}
          <span class="inline-flex">
            <StageBadge type="static" size="small" value={0} />
          </span>{" "}
          &#8212;{" "}
          <span class="inline-flex">
            <StageBadge type="static" size="small" value={1} />
          </span>{" "}
          should be used with caution and with the understanding that the design or implementation
          may change. Beyond Stage{" "}
          <span class="inline-flex">
            <StageBadge type="static" size="small" value={2} />
          </span>{" "}
          <span>we make an effort to mitigate changes. If a primitive reaches Stage </span>
          <span class="inline-flex">
            <StageBadge type="static" size="small" value={2} />
          </span>{" "}
          it's likely to remain an official package with additional approvement until fully accepted
          and shipped.
        </p>
      </div>
    </div>
  );
};

export { Content as StageContent };

export default Stage;

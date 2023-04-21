import { createMediaQuery } from "@solid-primitives/media";
import { useWindowScrollPosition } from "@solid-primitives/scroll";
import { A } from "@solidjs/router";
import Fuse from "fuse.js";
import { FiChevronLeft, FiSearch, FiX } from "solid-icons/fi";
import { Component, createMemo, createResource, createSignal, For, Show } from "solid-js";
import { fetchPackageList } from "~/api";
import { PackageListItem } from "~/types";
import { focusInputAndKeepVirtualKeyboardOpen } from "~/utils/focusInputAndKeepVirtualKeyboardOpen";
import { createHighlight } from "~/primitives/highlight";

let inputEl: HTMLInputElement | undefined;

export function focusSearchInput() {
  inputEl && focusInputAndKeepVirtualKeyboardOpen(inputEl);
}

const MAX_PRIMITIVES_COUNT = 5;

const FUSE_PRIMITIVES_OPTIONS: Fuse.IFuseOptions<unknown> = {
  findAllMatches: true,
  threshold: 0.9,
  ignoreLocation: true,
};

const FUSE_OPTION_KEYS: (
  | keyof PackageListItem
  | ({ name: keyof PackageListItem } & Fuse.FuseOptionKey<unknown>)
)[] = [
  { name: "name", weight: 2 },
  "description",
  { name: "primitives", weight: 2 },
  { name: "category", weight: 1 },
  { name: "tags", weight: 0.75 },
];

const FUSE_OPTIONS: Fuse.IFuseOptions<unknown> = {
  threshold: 0.9,
  ignoreLocation: true,
  // includeScore: true,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: FUSE_OPTION_KEYS,
};

const Search: Component<{
  setOpen: (value: boolean) => void;
}> = props => {
  const isSmall = createMediaQuery("(max-width: 767px)");
  const [search, setSearch] = createSignal("");

  let listContainer!: HTMLUListElement;
  let input!: HTMLInputElement;

  const [packages] = createResource(fetchPackageList, {
    initialValue: [],
  });

  const searchablePackages = createMemo(() =>
    packages().map(pkg => ({
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      tags: pkg.tags,
      primitives: pkg.primitives.map(({ name }) => name),
      data: pkg,
    })),
  );

  const fuse = createMemo(() => new Fuse(searchablePackages(), FUSE_OPTIONS));

  const result = createMemo(() => {
    const fuseValue = fuse();
    const searchValue = search();

    return fuseValue
      .search(searchValue)
      .slice(0, 12)
      .map(({ item }) => ({
        ...item,
        // order the primitives by search match
        primitives: new Fuse(item.primitives, FUSE_PRIMITIVES_OPTIONS)
          .search(searchValue)
          .map(item => item.item),
      }));
  });

  const scroll = useWindowScrollPosition();
  const showShadow = () => scroll.y > 60;

  const rawHighlight = createHighlight(text => <mark>{text()}</mark>);
  const toHighlight = createMemo(() => {
    const searchValue = search();
    return searchValue.length > 1 ? searchValue : "";
  });
  const highlight = (text: string) => rawHighlight(text, toHighlight());

  return (
    <div class="xs:w-full flex w-[calc(100vw-32px)] max-w-[800px] items-center justify-center">
      <div class="bg-page-main-bg w-full rounded-lg">
        <div
          class="z-1 sticky"
          classList={{
            "top-0": isSmall(),
            "top-[60px]": !isSmall(),
          }}
        >
          <div class="bg-page-main-bg flex gap-2 rounded-lg p-2">
            <div
              id="search-input-container"
              class="w-max-[350px] dark:bg-page-main-bg after:dashed-border-[color(#00006E)_dasharray(1,7)_width(4px)_radius(8px)] dark:after:dashed-border-[color(#7ea2cf)_dasharray(1,7)_width(4px)_radius(8px)] relative flex flex-grow cursor-text items-center rounded-md border-2 border-[#bdd3f2] px-2 py-2 font-sans text-[#306FC4] after:pointer-events-none after:absolute after:inset-[-6px] after:hidden after:content-[''] focus-within:text-[#063983] focus-within:after:block hover:border-[#7ea2cf] hover:text-[#063983] dark:border-[#59728d] dark:text-[#c2d5ee] dark:hover:border-[#d0e4ff87] dark:hover:text-white"
              tabindex="-1"
              onFocus={() => input.focus()}
            >
              <div class="mr-2">
                <FiSearch />
              </div>
              <input
                class="dark:bg-page-main-bg flex-grow outline-none"
                placeholder="Quick Search ..."
                value={search()}
                type="text"
                onInput={e => setSearch(e.currentTarget.value)}
                ref={el => ((input = el), (inputEl = el))}
              />
            </div>
            <button
              class="flex h-[45px] w-[45px] items-center justify-center rounded-lg text-[#306FC4] dark:text-[#c2d5ee] dark:hover:text-white"
              onClick={() => props.setOpen(false)}
            >
              <FiX size={25} />
            </button>
          </div>

          <div
            class="bg-page-main-bg relative border-b border-slate-300 px-2 dark:border-slate-600"
            classList={{ hidden: !result().length }}
          >
            <div
              class="-z-1 absolute left-4 right-4 top-[-16px]  h-[16px] shadow-lg shadow-[#24405966] transition dark:shadow-[#05121dbf]"
              classList={{
                "opacity-0": !showShadow(),
                "opacity-100": showShadow(),
              }}
            />
          </div>
        </div>
        <div class="p-2 sm:p-4" classList={{ hidden: !result().length }}>
          <div class=""></div>
          <ul class="flex flex-col gap-y-6" ref={listContainer}>
            <For each={result()}>
              {match => {
                const [showRest, setShowRest] = createSignal(false);
                const toggleShowRest = () => setShowRest(p => !p);

                return (
                  <li>
                    <h4
                      class="text-lg font-semibold text-[#49494B] dark:text-[#bec5cf]"
                      data-ignore-mark-title
                    >
                      <A href={`/package/${match.name.toLowerCase()}`}>{highlight(match.name)}</A>
                    </h4>
                    <p class="my-[6px] text-[14px]">{highlight(match.description)}</p>

                    <div class="flex justify-between gap-2">
                      <ul class="flex flex-wrap gap-2 self-start">
                        <For each={match.primitives}>
                          {(primitive, idx) => (
                            <Show when={showRest() || idx() < MAX_PRIMITIVES_COUNT}>
                              <li>
                                <A
                                  href={`/package/${match.name.toLowerCase()}#${primitive.toLowerCase()}`}
                                  class="[&>mark]:background-[linear-gradient(0deg,#ffaf1d,#ffaf1d)_center_/_100%_75%_no-repeat] inline-block rounded-md bg-[#e6f0ff] px-2 py-[2px] text-[14px] font-semibold text-[#063983] transition-colors hover:text-black dark:bg-[#30455b] dark:text-[#b9d6ff] dark:hover:text-[#fff] sm:text-base"
                                >
                                  {highlight(primitive)}
                                </A>
                              </li>
                            </Show>
                          )}
                        </For>
                        <Show when={!showRest() && MAX_PRIMITIVES_COUNT < match.primitives.length}>
                          <li class="flex items-center text-[14px] text-slate-500 transition hover:text-black dark:text-white">
                            <button onClick={toggleShowRest}>
                              + {match.primitives.length - MAX_PRIMITIVES_COUNT}
                            </button>
                          </li>
                        </Show>
                      </ul>
                      <Show when={MAX_PRIMITIVES_COUNT < match.primitives.length}>
                        <button
                          class="flex h-[28px] w-[45px] flex-shrink-0 items-center justify-center rounded-md text-[#063983] hover:bg-[#f4f9ff] hover:text-black dark:text-[#b9d6ff] dark:hover:bg-[#3c5364]"
                          onClick={toggleShowRest}
                        >
                          <div
                            class="transition duration-200"
                            classList={{
                              "-rotate-90": showRest(),
                            }}
                          >
                            <FiChevronLeft size={24} />
                          </div>
                        </button>
                      </Show>
                    </div>
                    <Show when={match.tags.length}>
                      <ul class="flex flex-wrap gap-4 gap-y-2 self-start pt-2">
                        <For each={match.tags}>
                          {item => (
                            <li>
                              <span class="text-[12px] text-slate-500 dark:text-slate-400 sm:text-[14px]">
                                <span class="opacity-50">{"#"}</span>
                                {highlight(item)}
                              </span>
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Search;

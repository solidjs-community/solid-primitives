import { deepTrack } from "@solid-primitives/deep";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createMediaQuery } from "@solid-primitives/media";
import { defer } from "@solid-primitives/utils";
import { A } from "@solidjs/router";
import Fuse from "fuse.js";
import Mark from "mark.js";
import { FiChevronLeft, FiSearch, FiX } from "solid-icons/fi";
import {
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  onMount,
  Show,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { fetchPackageList } from "~/api";
import CheckBox from "./CheckBox/CheckBox";

let _inputEl!: HTMLInputElement;
export const getSearchInput = () => {
  return _inputEl;
};

const MAX_PRIMITIVES_COUNT = 5;

const FUSE_PRIMITIVES_OPTIONS = {
  findAllMatches: true,
  threshold: 0.9,
  ignoreLocation: true,
};

const FUSE_OPTIONS = {
  threshold: 0.9,
  ignoreLocation: true,
  // includeScore: true,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: [
    {
      name: "name",
      weight: 2,
    },
    // "description",
    {
      name: "primitives",
      weight: 2,
    },
    {
      name: "category",
      weight: 1,
    },
    // {
    //   name: "tags",
    //   weight: 0.75,
    // },
  ],
};

const Search: Component<{
  setOpen: (value: boolean) => void;
}> = props => {
  const isSmall = createMediaQuery("(max-width: 767px)");
  const [search, setSearch] = createSignal("");
  const [showShadow, setShowShadow] = createSignal(false);
  const [config, setConfig] = createStore({
    highlight: {
      title: { checked: false },
      description: { checked: true },
      primitive: { checked: true },
      tag: { checked: true },
    },
  });

  let listContainer!: HTMLUListElement;
  let input!: HTMLInputElement;

  const [packages] = createResource(fetchPackageList, {
    initialValue: [],
  });

  const searchablePackages = createMemo(() =>
    packages().map(pkg => ({
      name: pkg.name,
      category: pkg.category,
      primitives: pkg.primitives.map(primitive => primitive.name),
      pkg,
    })),
  );

  const fuse = createMemo(() => new Fuse(searchablePackages(), FUSE_OPTIONS));

  const result = createMemo(() => {
    const fuseValue = fuse();
    const searchValue = search();

    const result = fuseValue.search(searchValue).slice(0, 12);

    return result.map(({ item }) => {
      const fusePrim = new Fuse(item.primitives, FUSE_PRIMITIVES_OPTIONS);
      return {
        ...item,
        // order the primitives by search match
        primitives: fusePrim.search(searchValue).map(item => item.item),
      };
    });
  });

  let markInstance: Mark;

  onMount(() => {
    markInstance = new Mark(listContainer);

    makeEventListener(
      window,
      "scroll",
      () => {
        setShowShadow(window.scrollY > 60);
      },
      { passive: true },
    );
  });

  const highlightText = (value: string) => {
    const exclude = Object.entries(config.highlight)
      .filter(([, item]) => !item.checked)
      .flatMap(([key]) => [`[data-ignore-mark-${key}]`, `[data-ignore-mark-${key}] *`]);
    markInstance.mark(value, {
      exclude,
      separateWordSearch: false,
    });
  };
  const reHighlightTextFromSearch = () => {
    markInstance.unmark();
    highlightText(search());
  };

  createEffect(() => {
    const value = search();
    if (value.length > 1) {
      requestAnimationFrame(() => highlightText(value));
    }
  });

  createEffect(
    defer(
      () => deepTrack(config.highlight),
      () => {
        reHighlightTextFromSearch();
      },
    ),
  );

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
                ref={el => ((input = el), (_inputEl = el))}
              />
            </div>
            <button
              class="flex h-[45px] w-[45px] items-center justify-center rounded-lg text-[#306FC4] dark:text-[#c2d5ee] dark:hover:text-white"
              onClick={() => props.setOpen(false)}
            >
              <FiX size={25} />
            </button>
          </div>

          <div class="bg-page-main-bg flex items-center gap-3 rounded-b-lg p-2">
            <div class="xs:text-base text-[13px] font-semibold">Highlight</div>
            <div class="xxs:text-[14px] xs:text-[15px] flex gap-[4px] overflow-auto py-[2px] text-[12px] md:gap-4">
              <For each={Object.keys(config.highlight) as (keyof typeof config.highlight)[]}>
                {item => {
                  const value = () => config.highlight[item];
                  return (
                    <CheckBox
                      checked={value().checked}
                      onChange={checked => {
                        // setConfig("highlight", item, checked)
                        setConfig(produce(state => (state.highlight[item].checked = checked)));
                      }}
                    >
                      <span class="capitalize opacity-80">{item}</span>
                    </CheckBox>
                  );
                }}
              </For>
            </div>
          </div>
          <div
            class="bg-page-main-bg relative border-b border-slate-300 px-2 dark:border-slate-600"
            classList={{ hidden: !result().length }}
          >
            <div
              class="-z-1 absolute top-[-16px] left-4 right-4  h-[16px] shadow-lg shadow-[#24405966] transition dark:shadow-[#05121dbf]"
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

                createEffect(() => {
                  showRest();
                  requestAnimationFrame(reHighlightTextFromSearch);
                });

                return (
                  <li>
                    <h4
                      class="text-lg font-semibold text-[#49494B] dark:text-[#bec5cf]"
                      data-ignore-mark-title
                    >
                      <A href={`/package/${match.name.toLowerCase()}`}>{match.name}</A>
                    </h4>
                    <p class="my-[6px] text-[14px]" data-ignore-mark-description>
                      "There is no description yet"
                    </p>

                    <div class="flex justify-between gap-2">
                      <ul class="flex flex-wrap gap-2 self-start" data-ignore-mark-primitive>
                        <For each={match.primitives}>
                          {(primitive, idx) => {
                            return (
                              <Show when={showRest() || idx() < MAX_PRIMITIVES_COUNT}>
                                <li>
                                  <A
                                    href={`/package/${match.name.toLowerCase()}#${primitive.toLowerCase()}`}
                                    class="[&>mark]:background-[linear-gradient(0deg,#ffaf1d,#ffaf1d)_center_/_100%_75%_no-repeat] inline-block rounded-md bg-[#e6f0ff] px-2 py-[2px] text-[14px] font-semibold text-[#063983] transition-colors hover:text-black dark:bg-[#30455b] dark:text-[#b9d6ff] dark:hover:text-[#fff] sm:text-base"
                                  >
                                    {primitive}
                                  </A>
                                </li>
                              </Show>
                            );
                          }}
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
                    {/* <Show when={tags.length}>
                      <ul class="flex flex-wrap gap-4 gap-y-2 self-start pt-2" data-ignore-mark-tag>
                        <For each={tags}>
                          {item => {
                            return (
                              <li>
                                <span class="text-[12px] text-slate-500 dark:text-slate-400 sm:text-[14px]">
                                  <span class="opacity-50">{"#"}</span>
                                  {item}
                                </span>
                              </li>
                            );
                          }}
                        </For>
                      </ul>
                    </Show> */}
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

import { createMediaQuery } from "@solid-primitives/media";
import { defer } from "@solid-primitives/utils";
import { A } from "@solidjs/router";
import Fuse from "fuse.js";
import Mark from "mark.js";
import { FiChevronLeft, FiSearch, FiX } from "solid-icons/fi";
import { Component, createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { TPrimitiveJson } from "~/ts/primitivesJson";
import _primitivesJSON from "~/_generated/primitives.json";
import CheckBox from "./CheckBox/CheckBox";

const primitivesJSON: TPrimitiveJson = _primitivesJSON;

type TPrimitive = {
  name: string;
  category: string;
  description: string;
  primitives: string[];
  primitivesTotalCount: number;
  tags: string[];
};

let _inputEl!: HTMLInputElement;
export const getSearchInput = () => {
  return _inputEl;
};

const Search: Component<{
  setOpen: (value: boolean) => void;
}> = props => {
  const isSmall = createMediaQuery("(max-width: 767px)");
  const [search, setSearch] = createSignal("");
  const [searchResult, setSearchResult] = createStore<TPrimitive[]>([]);
  const [showShadow, setShowShadow] = createSignal(false);
  const maxPrimitiveCount = 5;
  const [config, setConfig] = createStore({
    highlight: {
      title: { checked: false },
      description: { checked: true },
      primitive: { checked: true },
      tag: { checked: true },
    },
  });
  let markInstance: Mark;
  let listContainer!: HTMLUListElement;
  let input!: HTMLInputElement;

  const fuseOptions = {
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
      "description",
      {
        name: "primitives",
        weight: 2,
      },
      {
        name: "tags",
        weight: 0.75,
      },
    ],
  };

  const fusePrimitivesOptions = {
    findAllMatches: true,
    threshold: 0.9,
    ignoreLocation: true,
  };

  const fuse = new Fuse(
    structuredClone(primitivesJSON).map(item => {
      item.primitives = item.primitives.map(item => item.name);
      return item;
    }),
    fuseOptions,
  );

  const onInput = (value: string) => {
    setSearch(value);
    if (value.length <= 1) return;
    requestAnimationFrame(() => {
      highlightText(value);
    });
  };

  const highlightText = (value: string) => {
    const exclude = Object.entries(config.highlight)
      .filter(([_, item]) => !item.checked)
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

  const onScroll = () => {
    setShowShadow(window.scrollY > 60);
  };

  onMount(() => {
    markInstance = new Mark(listContainer);
    window.addEventListener("scroll", onScroll, { passive: true });

    onCleanup(() => {
      window.removeEventListener("scroll", onScroll);
    });
  });

  createEffect(
    defer(
      () => [
        config.highlight.description.checked,
        config.highlight.title.checked,
        config.highlight.primitive.checked,
        config.highlight.tag.checked,
      ],
      () => {
        reHighlightTextFromSearch();
      },
    ),
  );

  createEffect(
    defer(search, search => {
      const result = fuse.search(search);

      setSearchResult(
        result.slice(0, 12).map((_item, _, arr) => {
          const item = { ...(_item.item as any) } as TPrimitive;
          const fusePrimitives = new Fuse(item.primitives, fusePrimitivesOptions);
          const result = fusePrimitives.search(search);
          item.primitivesTotalCount = item.primitives.length;
          // item.primitives = result.slice(0, 5).map(item => (item.item));
          item.primitives = result.map(item => item.item);

          return item;
        }),
      );
    }),
  );

  return (
    <div class="flex justify-center items-center w-[calc(100vw-32px)] xs:w-full max-w-[800px]">
      <div class="w-full rounded-lg bg-page-main-bg">
        <div
          class="sticky z-1"
          classList={{
            "top-0": isSmall(),
            "top-[60px]": !isSmall(),
          }}
        >
          <div class="flex gap-2 p-2 bg-page-main-bg rounded-lg">
            <div
              id="search-input-container"
              class="relative flex flex-grow w-max-[350px] font-sans px-2 py-2 items-center dark:bg-page-main-bg border-[#bdd3f2] border-2 rounded-md text-[#306FC4] hover:text-[#063983] hover:border-[#7ea2cf] focus-within:text-[#063983] cursor-text dark:text-[#c2d5ee] dark:border-[#59728d] dark:hover:border-[#d0e4ff87] dark:hover:text-white focus-within:after:block after:hidden after:content-[''] after:absolute after:inset-[-6px] after:pointer-events-none after:dashed-border-[color(#00006E)_dasharray(1,7)_width(4px)_radius(8px)] dark:after:dashed-border-[color(#7ea2cf)_dasharray(1,7)_width(4px)_radius(8px)]"
              tabindex="-1"
              onFocus={() => {
                input.focus();
              }}
            >
              <div class="mr-2">
                <FiSearch />
              </div>
              <input
                class="flex-grow outline-none dark:bg-page-main-bg"
                placeholder="Quick Search ..."
                value={search()}
                type="text"
                onInput={e => onInput(e.currentTarget.value)}
                ref={el => {
                  input = el;
                  _inputEl = el;
                }}
              />
            </div>
            <button
              class="w-[45px] h-[45px] rounded-lg text-[#306FC4] flex justify-center items-center dark:text-[#c2d5ee] dark:hover:text-white"
              onClick={() => {
                props.setOpen(false);
              }}
            >
              <FiX size={25} />
            </button>
          </div>

          <div class="flex gap-3 p-2 bg-page-main-bg items-center rounded-b-lg">
            <div class="font-semibold text-[13px] xs:text-base">Highlight</div>
            <div class="flex gap-[4px] overflow-auto py-[2px] md:gap-4 text-[12px] xxs:text-[14px] xs:text-[15px]">
              <For each={Object.entries(config.highlight)}>
                {([item, value]) => (
                  <CheckBox
                    checked={value.checked}
                    onChange={checked => {
                      // setConfig("highlight", item as "title", checked)
                      setConfig(
                        produce(state => (state.highlight[item as "title"].checked = checked)),
                      );
                    }}
                  >
                    <span class="capitalize opacity-80">{item}</span>
                  </CheckBox>
                )}
              </For>
            </div>
          </div>
          <div
            class="relative border-b border-slate-300 px-2 bg-page-main-bg dark:border-slate-600"
            classList={{ hidden: !searchResult.length }}
          >
            <div
              class="absolute top-[-16px] h-[16px] left-4 right-4  shadow-lg shadow-[#24405966] dark:shadow-[#05121dbf] transition -z-1"
              classList={{
                "opacity-0": !showShadow(),
                "opacity-100": showShadow(),
              }}
            />
          </div>
        </div>
        <div class="p-2 sm:p-4" classList={{ hidden: !searchResult.length }}>
          <div class=""></div>
          <ul class="flex flex-col gap-y-6" ref={listContainer}>
            <For each={searchResult}>
              {({ name, category, description, primitives, primitivesTotalCount, tags }, idx) => {
                const [showRest, setShowRest] = createSignal(false);

                const onClickToggle = () => {
                  if (!showRest()) {
                    requestAnimationFrame(() => {
                      reHighlightTextFromSearch();
                    });
                  }
                  if (primitives.length < primitivesTotalCount) {
                    const primitivesList = [
                      ...new Set([
                        ...primitives,
                        ...primitivesJSON[idx()].primitives.map(item => item.name),
                      ]),
                    ];
                    setSearchResult(idx(), "primitives", primitivesList);
                  }
                  setShowRest(() => !showRest());
                };

                return (
                  <li>
                    <h4
                      class="text-lg font-semibold text-[#49494B] dark:text-[#bec5cf]"
                      data-ignore-mark-title
                    >
                      <A href={`/package/${name.toLowerCase()}`}>{name}</A>
                    </h4>
                    <p class="text-[14px] my-[6px]" data-ignore-mark-description>
                      {description}
                    </p>

                    <div class="flex justify-between gap-2">
                      <ul class="flex gap-2 flex-wrap self-start" data-ignore-mark-primitive>
                        <For each={primitives}>
                          {(item, idx) => {
                            return (
                              <Show when={showRest() || idx() < maxPrimitiveCount}>
                                <li>
                                  <A
                                    href={`/package/${name}#${item.toLowerCase()}`}
                                    class="text-[14px] sm:text-base text-[#063983] hover:text-black font-semibold px-2 py-[2px] bg-[#e6f0ff] dark:text-[#b9d6ff] dark:bg-[#30455b] dark:hover:text-[#fff] rounded-md inline-block transition-colors [&>mark]:background-[linear-gradient(0deg,#ffaf1d,#ffaf1d)_center_/_100%_75%_no-repeat]"
                                  >
                                    {item}
                                  </A>
                                </li>
                              </Show>
                            );
                          }}
                        </For>
                        <Show when={!showRest() && maxPrimitiveCount < primitivesTotalCount}>
                          <li class="flex items-center text-slate-500 text-[14px] hover:text-black dark:text-white transition">
                            <button onClick={onClickToggle}>
                              + {primitivesTotalCount - maxPrimitiveCount}
                            </button>
                          </li>
                        </Show>
                      </ul>
                      <Show when={maxPrimitiveCount < primitivesTotalCount}>
                        <button
                          class="flex-shrink-0 flex justify-center items-center w-[45px] h-[28px] text-[#063983] rounded-md hover:text-black hover:bg-[#f4f9ff] dark:hover:bg-[#3c5364] dark:text-[#b9d6ff]"
                          onClick={onClickToggle}
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
                    <Show when={tags.length}>
                      <ul class="flex gap-4 gap-y-2 flex-wrap self-start pt-2" data-ignore-mark-tag>
                        <For each={tags}>
                          {item => {
                            return (
                              <li>
                                <span class="text-[12px] sm:text-[14px] text-slate-500 dark:text-slate-400">
                                  <span class="opacity-50">{"#"}</span>
                                  {item}
                                </span>
                              </li>
                            );
                          }}
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

import { createMediaQuery } from "@solid-primitives/media";
import { A, useLocation } from "@solidjs/router";
import Fuse from "fuse.js";
import Mark from "mark.js";
import { FiSearch, FiX } from "solid-icons/fi";
import {
  $TRACK,
  Component,
  createEffect,
  createSignal,
  For,
  on,
  onMount,
  ParentComponent,
  Show
} from "solid-js";
import { createStore, produce } from "solid-js/store";
// @ts-ignore
import primitivesJSON from "~/primitives.json";
import CheckBox from "./CheckBox/CheckBox";

type TPrimitive = {
  name: string;
  category: string;
  description: string;
  primitives: string[];
  primitivesCount: number;
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
  const [config, setConfig] = createStore({
    highlight: {
      title: { checked: false },
      description: { checked: true },
      primitive: { checked: false }
    }
  });
  let markInstance: Mark;
  let listContainer!: HTMLUListElement;
  let input!: HTMLInputElement;

  const fuseOptions = {
    threshold: 0.9,
    ignoreLocation: true,
    includeScore: true,
    // ignoreFieldNorm: false,
    // fieldNormWeight: 1,
    keys: [
      {
        name: "name",
        weight: 2
      },
      // "category",
      "description",
      {
        name: "primitives",
        weight: 2
      }
    ]
  };

  const fusePrimitivesOptions = {
    findAllMatches: true,
    threshold: 0.9,
    ignoreLocation: true
  };

  const fuse = new Fuse(primitivesJSON, fuseOptions);

  const onInput = (value: string) => {
    setSearch(value);
    if (value.length <= 1) return;
    requestAnimationFrame(() => {
      highlightTextFromSearch(value);
    });
  };

  const highlightTextFromSearch = (value: string) => {
    const exclude = Object.entries(config.highlight)
      .filter(([_, item]) => !item.checked)
      .flatMap(([key]) => [`[data-ignore-mark-${key}]`, `[data-ignore-mark-${key}] *`]);
    console.log(exclude);
    markInstance.mark(value, {
      exclude,
      separateWordSearch: false
    });
  };

  onMount(() => {
    markInstance = new Mark(listContainer);
  });

  createEffect(
    on(
      () => [
        config.highlight.description.checked,
        config.highlight.title.checked,
        config.highlight.primitive.checked
      ],
      () => {
        markInstance.unmark();
        highlightTextFromSearch(search());
      },
      { defer: true }
    )
  );

  createEffect(
    on(
      search,
      search => {
        const result = fuse.search(search);

        setSearchResult(
          result.slice(0, 12).map((_item, _, arr) => {
            // console.log(arr);
            const item = { ...(_item.item as any) } as TPrimitive;
            const fusePrimitives = new Fuse(item.primitives, fusePrimitivesOptions);
            const result = fusePrimitives.search(search);
            item.primitivesCount = item.primitives.length;
            item.primitives = result.slice(0, 5).map(item => ({ ...item }.item));

            return item;
          })
        );
        //         setSearchResult(
        //           produce(prev => {
        //             // @ts-ignore
        //             prev = result.slice(0, 1).map(_item => {
        //               const item = _item.item as unknown as TPrimitive;
        //               const fusePrimitives = new Fuse(item.primitives, fusePrimitivesOptions);
        //               const result = fusePrimitives.search(search);
        //               item.primitives = result.map(item => item.item);
        //               console.log(item.primitives);
        //
        //               return { ...item };
        //             });
        //           })
        //         );
      },
      { defer: true }
    )
  );

  return (
    <div class="flex justify-center items-center w-full max-w-[800px]">
      <div class="w-full rounded-lg bg-page-main-bg">
        <div
          class="sticky"
          classList={{
            "top-0": isSmall(),
            "top-[60px]": !isSmall()
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
            <div class="flex gap-[4px] md:gap-4 text-[12px] xxs:text-[14px] xs:text-[15px]">
              <For each={Object.entries(config.highlight)}>
                {([item, value]) => (
                  <CheckBox
                    checked={value.checked}
                    onChange={checked => {
                      // setConfig("highlight", item as "title", checked)
                      setConfig(
                        produce(state => (state.highlight[item as "title"].checked = checked))
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
            <div class="absolute top-[-16px] h-[16px] left-4 right-4  shadow-lg shadow-[#24405966] dark:shadow-[#05121dbf] -z-1" />
          </div>
        </div>
        <div class="p-2 sm:p-4" classList={{ hidden: !searchResult.length }}>
          <div class=""></div>
          <ul ref={listContainer}>
            <For each={searchResult}>
              {({ name, category, description, primitives, primitivesCount }) => {
                return (
                  <li class="py-2">
                    <h4
                      class="font-semibold text-[#49494B] dark:text-[#bec5cf]"
                      data-ignore-mark-title
                    >
                      <A href={`/${name.toLowerCase()}`}>{name}</A>
                    </h4>
                    <p class="text-[14px] my-[6px]" data-ignore-mark-description>
                      {description}
                    </p>
                    <ul class="flex gap-2 flex-wrap" data-ignore-mark-primitive>
                      <For each={primitives}>
                        {item => {
                          return (
                            <li>
                              <A
                                href={`/${name}#${item.toLowerCase()}`}
                                class="text-[14px] sm:text-base text-[#063983] hover:text-black font-semibold px-2 pb-0 bg-[#e6f0ff] dark:text-[#b9d6ff] dark:bg-[#30455b] dark:hover:text-[#fff] rounded-md inline-block transition-colors"
                              >
                                {item}
                              </A>
                            </li>
                          );
                        }}
                      </For>
                      <Show when={primitives.length && primitivesCount > primitives.length}>
                        <li class="flex items-center text-slate-500 text-[14px]">
                          + {primitivesCount - primitives.length}
                        </li>
                      </Show>
                    </ul>
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

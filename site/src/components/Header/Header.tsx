import { makeEventListener } from "@solid-primitives/event-listener";
import { isMobile, isSafari } from "@solid-primitives/platform";
import { createScrollPosition } from "@solid-primitives/scroll";
import { createTween } from "@solid-primitives/tween";
import { defer, tryOnCleanup } from "@solid-primitives/utils";
import Dismiss from "solid-dismiss";
import {
  Accessor,
  batch,
  Component,
  createEffect,
  createMemo,
  createSignal,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";
import { A, useLocation } from "solid-start";
import { pageWidthClass } from "~/constants";
import Hamburger from "../Icons/Hamburger";
import { PRIMITIVE_PAGE_PADDING_TOP } from "../Primitives/PrimitivePageMain";
import SearchBtn from "../Search/SearchBtn";
import SearchModal from "../Search/SearchModal";
import NavMenu from "./NavMenu";
import ThemeBtn from "./ThemeBtn";

export const [isScrollEnabled, setScrollEnabled] = createSignal(false);

const [signalOverridingShadow, setSignalOverridingShadow] = createSignal<Accessor<boolean>>();
const isOverridingShadow = () => signalOverridingShadow()?.() ?? false;

export function overrideShadow(signal: Accessor<boolean>) {
  setSignalOverridingShadow(() => signal);
  tryOnCleanup(() => setSignalOverridingShadow(p => (p === signal ? undefined : p)));
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const OPEN_NAV_DURATION = 500;
const HEADER_HEIGHT = 60;

const Header: Component = () => {
  const windowScroll = createScrollPosition(() => window);
  const location = useLocation();

  const [isNavOpen, setIsNavOpen] = createSignal(false);
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [from, setFrom] = createSignal(0);

  createEffect(
    defer(
      createMemo(() => location.hash),
      () => setIsNavOpen(false),
    ),
  );

  const [styles, setStyles] = createStore({
    gradientOverflow: { "--header-gradient-overflow-start": "60px", height: "", transform: "" },
    headerOpaqueBgContainer: { height: "", top: "" },
    headerOpaqueBg: {
      transform: "",
      display: "",
      height: "",
      top: "",
    },
    headerBottomGradientBorder: { transform: "" },
    headerShadow: { transform: "" },
  });

  let menuButtonSearch!: HTMLButtonElement;
  let menuButtonNavMenu!: HTMLButtonElement;
  let navMenu!: HTMLDivElement;

  // might remove this, hopefully this issue is temp, not that big deal of an issue,
  // but the issue is that when safari scroll 'rubberbands' at top of page there's a big white background that covers header.
  // It's caused by header element containing blur in backdrop-filter.
  if (isSafari && !isMobile) {
    const checkScroll = () => {
      if (!isNavOpen() && !isSearchOpen()) {
        setStyles("headerOpaqueBg", "display", window.scrollY > 2 ? "" : "none");
      }
    };

    createEffect(() => {
      if (isScrollEnabled()) {
        untrack(checkScroll);
        makeEventListener(window, "scroll", checkScroll, { passive: true });
      }
    });
  }

  let navMenuHeight = 0;

  createEffect(
    defer(
      createTween(from, { ease: easeInOutCubic, duration: OPEN_NAV_DURATION }),
      tweenedValue => {
        const tweenedTranslateWithoutHeight = `translateY(${-navMenuHeight + tweenedValue}px)`;
        navMenu.style.transform = tweenedTranslateWithoutHeight;
        setStyles(
          ["headerBottomGradientBorder", "headerShadow"],
          "transform",
          `translateY(${tweenedValue}px)`,
        );
        setStyles(
          ["gradientOverflow", "headerOpaqueBg"],
          "transform",
          tweenedTranslateWithoutHeight,
        );
      },
    ),
  );

  // effect is needed to read from `navMenu` ref after it's added to DOM
  createEffect(
    defer(isNavOpen, isNavOpen => {
      if (isNavOpen) {
        navMenuHeight = navMenu.clientHeight;

        const newTransform = `translateY(${-navMenuHeight}px)`,
          newHeight = `${navMenuHeight + HEADER_HEIGHT}px`;

        setStyles("headerOpaqueBg", {
          display: "",
          height: newHeight,
          transform: newTransform,
          top: "-1px",
        });

        setStyles("gradientOverflow", {
          height: `${navMenuHeight + 220}px`,
          "--header-gradient-overflow-start": `${navMenuHeight + 60}px`,
          transform: newTransform,
        });

        setStyles("headerOpaqueBgContainer", {
          height: newHeight,
          top: "1px",
        });

        requestAnimationFrame(() => {
          setFrom(navMenuHeight);
        });
        return;
      }

      setFrom(0);
    }),
  );

  return (
    <>
      <header
        class="fixed top-0 left-0 right-0 z-10 h-[60px]"
        classList={{
          "md:z-[1001]": isSearchOpen(),
        }}
      >
        <div class="relative h-full">
          <div
            class={`${pageWidthClass} mx-auto flex h-full w-full items-center justify-between gap-2 px-4 sm:px-8`}
          >
            <div
              class={`${pageWidthClass} box-shadow-[var(--header-box-shadow)] -z-1 duration-250
              absolute top-0 left-0 bottom-0 right-0 mx-auto w-full opacity-0 transition-opacity`}
              classList={{
                // show the shadow when scrolled down or when the nav menu is open,
                // but not when the search modal is open or when the table-sub-nav is shown
                "opacity-100":
                  isNavOpen() ||
                  (!isSearchOpen() &&
                    !isOverridingShadow() &&
                    windowScroll.y > PRIMITIVE_PAGE_PADDING_TOP + 50),
              }}
              style={styles.headerShadow}
            >
              <div
                class="box-shadow-[var(--header-big-box-shadow)] -z-1 transition-composite duration-250 h-full opacity-0"
                classList={{
                  "opacity-100": isNavOpen(),
                }}
              />
            </div>
            <A href="/">
              <img
                class="hidden h-[28px] dark:hidden sm:block sm:h-[40px]"
                src="/img/solid-primitives-logo.svg"
                alt=""
              />
              <img
                class="hidden h-[28px] sm:h-[40px] dark:sm:block"
                src="/img/solid-primitives-dark-logo.svg"
                alt=""
              />
              <img
                class="h-[28px] dark:hidden sm:hidden sm:h-[40px]"
                src="/img/solid-primitives-stacked-logo.svg"
                alt=""
              />
              <img
                class="hidden h-[28px] dark:block sm:!hidden sm:h-[40px]"
                src="/img/solid-primitives-stacked-dark-logo.svg"
                alt=""
              />
            </A>
            <nav>
              <ul class="flex items-center gap-3">
                <li class="transition" classList={{ "opacity-0": isSearchOpen() }}>
                  <SearchBtn ref={menuButtonSearch} />
                </li>
                <li>
                  <ThemeBtn />
                </li>
                <li>
                  <Hamburger active={isNavOpen()} ref={menuButtonNavMenu} />
                </li>
              </ul>
            </nav>
          </div>
          <SearchModal
            menuButton={menuButtonSearch}
            open={isSearchOpen()}
            setOpen={setIsSearchOpen}
          />
        </div>
        {/* fixes weird shimmering top dark shadow blur during openNavMenu animation in Chrome  */}
        {/* Still shows up in Safari, no fix  */}
        <div
          class="-z-1 pointer-events-none absolute inset-0 overflow-clip"
          style={styles.headerOpaqueBgContainer}
        >
          <div
            class="absolute inset-0 translate-y-[calc(-100%+60px)]
            bg-white/50 backdrop-blur-md
            transition-[background-color,backdrop-filter] dark:bg-[#293843]/70"
            style={styles.headerOpaqueBg}
          />
        </div>
        <div class="bg-page-main-bg z-1 absolute top-0 left-0 right-0 h-[1px]" />
        <div
          class={`${pageWidthClass} background-[var(--header-border-bottom)] duration-250 mx-auto h-[2px] opacity-0 transition-opacity`}
          classList={{ "opacity-100": isOverridingShadow() && !isSearchOpen() }}
          style={styles.headerBottomGradientBorder}
        />
        <div class={`${pageWidthClass} relative top-[-2px] mx-auto overflow-clip`}>
          <Dismiss
            menuButton={menuButtonNavMenu}
            open={isNavOpen}
            setOpen={state => setIsNavOpen(state)}
            class="-translate-y-full"
            animation={{
              onEnter: (_, done) => {
                setTimeout(done, OPEN_NAV_DURATION);
              },
              onExit: (_, done) => {
                setTimeout(done, OPEN_NAV_DURATION);
              },
              onAfterExit: () => {
                // clear the styles only if the nav menu is closed
                if (isNavOpen()) return;

                batch(() => {
                  setStyles("headerOpaqueBg", { top: "" });
                  setStyles("headerOpaqueBgContainer", { top: "", height: "" });
                });
              },
            }}
            ref={navMenu}
          >
            <NavMenu onClose={() => setIsNavOpen(false)} />
          </Dismiss>
        </div>
      </header>
      <div class="-z-1 pointer-events-none fixed top-0 left-0 right-0 hidden md:flex">
        <div
          class="-order-1 h-[220px] flex-grow bg-[linear-gradient(to_bottom,var(--page-main-bg)_var(--header-gradient-overflow-start),transparent)]"
          style={styles.gradientOverflow}
        />

        <div class={`${pageWidthClass} w-full flex-shrink-0 flex-grow`} />
        <div
          class="h-[220px] flex-grow bg-[linear-gradient(to_bottom,var(--page-main-bg)_var(--header-gradient-overflow-start),transparent)]"
          style={styles.gradientOverflow}
        />
      </div>
    </>
  );
};

export default Header;

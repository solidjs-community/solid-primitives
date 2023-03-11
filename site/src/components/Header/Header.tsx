import { makeEventListener } from "@solid-primitives/event-listener";
import { isMobile, isSafari } from "@solid-primitives/platform";
import { createElementSize } from "@solid-primitives/resize-observer";
import { createScrollPosition } from "@solid-primitives/scroll";
import { defer, tryOnCleanup } from "@solid-primitives/utils";
import Dismiss from "solid-dismiss";
import { Accessor, Component, createEffect, createMemo, createSignal, untrack } from "solid-js";
import { A, useLocation } from "solid-start";
import { pageWidthClass } from "~/constants";
import Hamburger from "../Icons/Hamburger";
import { PRIMITIVE_PAGE_PADDING_TOP } from "../Primitives/PrimitivePageMain";
import SearchBtn from "../Search/SearchBtn";
import SearchModal from "../Search/SearchModal";
import NavMenu from "./NavMenu";
import ThemeBtn from "./ThemeBtn";
import clsx from "clsx";

export const [isScrollEnabled, setScrollEnabled] = createSignal(false);

const [signalOverridingShadow, setSignalOverridingShadow] = createSignal<Accessor<boolean>>();
const isOverridingShadow = () => signalOverridingShadow()?.() ?? false;

export function overrideShadow(signal: Accessor<boolean>) {
  setSignalOverridingShadow(() => signal);
  tryOnCleanup(() => setSignalOverridingShadow(p => (p === signal ? undefined : p)));
}

const OPEN_NAV_DURATION = 500;
const HEADER_HEIGHT = 60;

const Header: Component = () => {
  const windowScroll = createScrollPosition(() => window);
  const location = useLocation();

  const [isNavOpen, setIsNavOpen] = createSignal(false);
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);

  createEffect(
    defer(
      createMemo(() => location.hash),
      () => setIsNavOpen(false),
    ),
  );

  const [navMenu, setNavMenu] = createSignal<HTMLDivElement>();

  const navMenuSize = createElementSize(navMenu);
  const navMenuHeight = createMemo(() => navMenuSize.height ?? 0);

  // might remove this, hopefully this issue is temp, not that big deal of an issue,
  // but the issue is that when safari scroll 'rubberbands' at top of page there's a big white background that covers header.
  // It's caused by header element containing blur in backdrop-filter.
  if (isSafari && !isMobile) {
    const checkScroll = () => {
      if (!isNavOpen() && !isSearchOpen()) {
        // TODO
        // setStyles("headerOpaqueBg", "display", window.scrollY > 2 ? "" : "none");
      }
    };

    createEffect(() => {
      if (isScrollEnabled()) {
        untrack(checkScroll);
        makeEventListener(window, "scroll", checkScroll, { passive: true });
      }
    });
  }

  // because navMenu ref is dynamic - a new element is added to DOM when nav is opened
  // the transform needs to be applied in the next frame instead of instantly with a class
  // so that the enter transition is visible
  createEffect(() => {
    const el = navMenu();
    if (el) {
      const open = isNavOpen();
      requestAnimationFrame(() => (el.style.transform = `translateY(${open ? 0 : "-100%"})`));
    }
  });

  let menuButtonSearch!: HTMLButtonElement;
  let menuButtonNavMenu!: HTMLButtonElement;
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
              class={`${pageWidthClass} box-shadow-[var(--header-box-shadow)] -z-1 
              transition-composite absolute top-0 left-0 bottom-0 right-0 mx-auto w-full opacity-0
              duration-300 ease-out`}
              classList={{
                // show the shadow when scrolled down or when the nav menu is open,
                // but not when the search modal is open or when the table-sub-nav is shown
                "opacity-100":
                  isNavOpen() ||
                  (!isSearchOpen() &&
                    !isOverridingShadow() &&
                    windowScroll.y > PRIMITIVE_PAGE_PADDING_TOP + 50),
              }}
              style={{
                transform: `translateY(${isNavOpen() ? navMenuHeight() : 0}px)`,
              }}
            >
              <div
                class="box-shadow-[var(--header-big-box-shadow)] -z-1 h-full opacity-0 transition-opacity duration-300 ease-out"
                classList={{ "opacity-100": isNavOpen() }}
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
          class="-z-1 pointer-events-none absolute inset-0 top-px overflow-clip"
          style={{
            height: `${navMenuHeight() + HEADER_HEIGHT}px`,
          }}
        >
          <div
            class="absolute inset-0 translate-y-[calc(-100%+60px)]
            bg-white/50 backdrop-blur-md 
            transition-transform duration-300 ease-out
            dark:bg-[#293843]/70"
            style={{
              height: `${navMenuHeight() + HEADER_HEIGHT}px`,
              transform: isNavOpen() ? `translateY(0)` : "",
            }}
          />
        </div>
        <div class="bg-page-main-bg z-1 absolute top-0 left-0 right-0 h-px" />
        <div
          class={`${pageWidthClass} background-[var(--header-border-bottom)] duration-250 mx-auto h-[2px] opacity-0 transition-opacity`}
          classList={{ "opacity-100": isOverridingShadow() && !isSearchOpen() }}
          style={{
            transform: `translateY(${isNavOpen() ? navMenuHeight() : 0}px)`,
          }}
        />
        <div class={`${pageWidthClass} relative top-[-2px] mx-auto overflow-clip`}>
          <Dismiss
            menuButton={menuButtonNavMenu}
            open={isNavOpen}
            setOpen={state => setIsNavOpen(state)}
            class="-translate-y-full transition-transform duration-300 ease-out"
            animation={{
              onEnter(_, done) {
                setTimeout(done, OPEN_NAV_DURATION);
              },
              onExit(_, done) {
                setTimeout(done, OPEN_NAV_DURATION);
              },
            }}
            ref={setNavMenu}
          >
            <NavMenu onClose={() => setIsNavOpen(false)} />
          </Dismiss>
        </div>
      </header>
      <div class="-z-1 pointer-events-none fixed top-0 left-0 right-0 hidden md:flex">
        {untrack(() => {
          const Gradient = (props: { class?: string }) => (
            <div
              class={clsx(
                props.class,
                "h-[220px] flex-grow bg-[linear-gradient(to_bottom,var(--page-main-bg)_var(--header-gradient-overflow-start),transparent)]",
                "transition-[height] duration-300 ease-out",
              )}
              style={{
                "--header-gradient-overflow-start": `${(isNavOpen() ? navMenuHeight() : 0) + 60}px`,
                height: `${(isNavOpen() ? navMenuHeight() : 0) + 220}px`,
              }}
            />
          );
          return (
            <>
              <Gradient class="-order-1" />
              <div class={`${pageWidthClass} w-full flex-shrink-0 flex-grow`} />
              <Gradient />
            </>
          );
        })}
      </div>
    </>
  );
};

export default Header;

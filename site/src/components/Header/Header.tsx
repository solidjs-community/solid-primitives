import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createSignal,
  untrack,
  onCleanup,
} from "solid-js";
import { makeEventListener } from "@solid-primitives/event-listener";
import { isMobile, isSafari } from "@solid-primitives/platform";
import { createScrollPosition } from "@solid-primitives/scroll";
import { defer } from "@solid-primitives/utils";
import Dismiss from "solid-dismiss";
import { A, useLocation } from "solid-start";
import { pageWidthClass } from "~/constants";
import Hamburger from "../Icons/Hamburger";
import SearchBtn from "../Search/SearchBtn";
import NavMenu from "./NavMenu";
import ThemeBtn from "./ThemeBtn";
import clsx from "clsx";
import { createTween } from "@solid-primitives/tween";
import SearchModal from "../Search/SearchModal";

export const [isScrollEnabled, setScrollEnabled] = createSignal(false);

const [signalOverridingShadow, setSignalOverridingShadow] = createSignal<Accessor<boolean>>();
const isOverridingShadow = () => signalOverridingShadow()?.() ?? false;

export function overrideShadow(signal: Accessor<boolean>) {
  setSignalOverridingShadow(() => signal);
  onCleanup(() => setSignalOverridingShadow(p => (p === signal ? undefined : p)));
}

const OPEN_NAV_DURATION = 500;
export const HEADER_HEIGHT = 60;
export const PRIMITIVE_PAGE_PADDING_TOP = 140;

const Header: Component = () => {
  const windowScroll = createScrollPosition(() => window);
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);
  const [isNavOpen, setIsNavOpen] = createSignal(false);
  const [from, setFrom] = createSignal(0);
  const easeInOutCubic = (x: number): number => {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };
  const tweenedValue = createTween(from, { ease: easeInOutCubic, duration: OPEN_NAV_DURATION });
  const location = useLocation();
  let gradientOverflowLeftBG!: HTMLDivElement;
  let gradientOverflowRightBG!: HTMLDivElement;
  let menuButtonSearch!: HTMLButtonElement;
  let menuButtonNavMenu!: HTMLButtonElement;
  let headerOpaqueBg!: HTMLDivElement;
  let headerSolidBg!: HTMLDivElement;
  let headerOpaqueBgContainer!: HTMLDivElement;
  let headerBottomGradientBorder!: HTMLDivElement;
  let headerShadow!: HTMLDivElement;
  let navMenu!: HTMLDivElement;
  let navMenuHeight = 0;

  // Issue is that when safari scroll 'rubberbands' at top of page there's a big white background that temporary covers header.
  // It's caused by header elements, one containing blur in backdrop-filter and other containing solid white background.
  if (isSafari && !isMobile) {
    const checkScroll = () => {
      if (!isNavOpen() && !isSearchOpen()) {
        if (window.scrollY > 2) {
          headerOpaqueBg.style.display = "";
          headerSolidBg.style.display = "";
        } else {
          headerOpaqueBg.style.display = "none";
          headerSolidBg.style.display = "none";
        }
      }
    };

    createEffect(() => {
      if (isScrollEnabled()) {
        untrack(checkScroll);
        makeEventListener(window, "scroll", checkScroll, { passive: true });
      }
    });
  }

  createEffect(
    defer(tweenedValue, tweenedValue => {
      navMenu.style.transform = `translateY(${-navMenuHeight + tweenedValue}px)`;
      headerBottomGradientBorder.style.transform = `translateY(${tweenedValue}px)`;
      headerShadow.style.transform = `translateY(${tweenedValue}px)`;
      headerOpaqueBg.style.transform = `translateY(${-navMenuHeight + tweenedValue}px)`;
      gradientOverflowLeftBG.style.transform = `translateY(${-navMenuHeight + tweenedValue}px)`;
      gradientOverflowRightBG.style.transform = `translateY(${-navMenuHeight + tweenedValue}px)`;
    }),
  );

  createEffect(
    defer(isNavOpen, isNavOpen => {
      if (isNavOpen) {
        navMenuHeight = navMenu.clientHeight;

        headerOpaqueBg.style.height = `${navMenuHeight + HEADER_HEIGHT}px`;
        gradientOverflowLeftBG.style.height = `${navMenuHeight + 220}px`;
        gradientOverflowRightBG.style.height = `${navMenuHeight + 220}px`;
        gradientOverflowLeftBG.style.setProperty(
          "--header-gradient-overflow-start",
          `${navMenuHeight + 60}px`,
        );
        gradientOverflowRightBG.style.setProperty(
          "--header-gradient-overflow-start",
          `${navMenuHeight + 60}px`,
        );
        headerOpaqueBgContainer.style.height = `${navMenuHeight + HEADER_HEIGHT}px`;
        headerOpaqueBg.style.transform = `translateY(${-navMenuHeight}px)`;
        gradientOverflowLeftBG.style.transform = `translateY(${-navMenuHeight}px)`;
        gradientOverflowRightBG.style.transform = `translateY(${-navMenuHeight}px)`;
        headerOpaqueBg.style.top = "-1px";
        headerOpaqueBgContainer.style.top = "1px";

        requestAnimationFrame(() => {
          setFrom(navMenuHeight);
        });
        return;
      }
      setFrom(0);
    }),
  );

  createEffect(
    defer(
      createMemo(() => location.hash),
      () => setIsNavOpen(false),
    ),
  );

  return (
    <>
      <header
        class="fixed left-0 right-0 top-0 z-10 h-[60px]"
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
              absolute bottom-0 left-0 right-0 top-0 mx-auto w-full opacity-0 transition-opacity
              duration-200`}
              classList={{
                // show the shadow when scrolled down or when the nav menu is open,
                // but not when the search modal is open or when the table-sub-nav is shown
                "opacity-100":
                  isNavOpen() ||
                  (!isSearchOpen() &&
                    !isOverridingShadow() &&
                    windowScroll.y > PRIMITIVE_PAGE_PADDING_TOP + 50),
              }}
              ref={headerShadow}
            >
              <div
                class="box-shadow-[var(--header-big-box-shadow)] -z-1 duration-250 h-full opacity-0 transition-opacity"
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
          class="-z-1 pointer-events-none absolute inset-0 overflow-clip"
          ref={headerOpaqueBgContainer}
        >
          <div
            class="absolute inset-0 translate-y-[calc(-100%+60px)]
            bg-white/50 backdrop-blur-md
            dark:bg-[#293843]/70"
            ref={headerOpaqueBg}
          />
        </div>
        <div
          class="bg-page-main-bg z-1 absolute left-0 right-0 top-0 h-[1px]"
          ref={headerSolidBg}
        />
        <div
          class={`${pageWidthClass} background-[var(--header-border-bottom)] duration-250 mx-auto h-[2px] opacity-0 transition-opacity`}
          classList={{ "opacity-100": isOverridingShadow() && !isSearchOpen() }}
          ref={headerBottomGradientBorder}
        />
        <div class={`${pageWidthClass} relative top-[-2px] mx-auto overflow-clip`}>
          <Dismiss
            menuButton={menuButtonNavMenu}
            open={isNavOpen}
            setOpen={setIsNavOpen}
            class="-translate-y-full"
            animation={{
              onEnter: (_, done) => {
                setTimeout(done, OPEN_NAV_DURATION);
              },
              onExit: (_, done) => {
                setTimeout(done, OPEN_NAV_DURATION);
              },
            }}
            ref={navMenu}
          >
            <NavMenu onClose={() => setIsNavOpen(false)} />
          </Dismiss>
        </div>
      </header>
      <div class="-z-1 pointer-events-none fixed left-0 right-0 top-0 hidden transition md:flex">
        {untrack(() => {
          const Gradient = (props: { class?: string; ref: HTMLDivElement }) => (
            <div
              class={clsx(
                props.class,
                "h-[220px] flex-grow bg-[linear-gradient(to_bottom,var(--page-main-bg)_var(--header-gradient-overflow-start),transparent)]",
              )}
              style={{ "--header-gradient-overflow-start": "60px" }}
              ref={props.ref}
            />
          );
          return (
            <>
              <Gradient class="-order-1" ref={gradientOverflowLeftBG} />
              <div class={`${pageWidthClass} w-full flex-shrink-0 flex-grow`} />
              <Gradient ref={gradientOverflowRightBG} />
            </>
          );
        })}
      </div>
    </>
  );
};

export default Header;

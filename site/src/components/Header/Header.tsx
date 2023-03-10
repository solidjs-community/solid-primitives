import solidPrimitivesLogo from "~/assets/img/solid-primitives-logo.svg";
import solidPrimitivesDarkLogo from "~/assets/img/solid-primitives-dark-logo.svg";
import solidPrimitivesStackedLogo from "~/assets/img/solid-primitives-stacked-logo.svg";
import solidPrimitivesStackedDarkLogo from "~/assets/img/solid-primitives-stacked-dark-logo.svg";
import { createEffect, createRenderEffect, createSignal, on, onMount } from "solid-js";
import SearchModal from "../Search/SearchModal";
import ThemeBtn from "./ThemeBtn";
import SearchBtn from "../Search/SearchBtn";
import { A, useLocation } from "solid-start";
import NavMenu from "./NavMenu";
import { createStore } from "solid-js/store";
import Dismiss from "solid-dismiss";
import { createTween } from "@solid-primitives/tween";
import { isMobile, isSafari } from "@solid-primitives/platform";
import { doesPathnameMatchBase } from "~/utils/doesPathnameMatchBase";
import Hamburger from "../Icons/Hamburger";
import { primitivePagePaddingTop } from "../Primitives/PrimitivePageMain";
import { pageWidthClass } from "~/constants";
import { defer } from "@solid-primitives/utils";

export const [headerState, setHeaderState] = createStore({
  showOpaqueBg: false,
  showShadow: false,
  showGradientBorder: false,
  showGradientOverflow: false,
  disableScroll: false,
  showSearchBtn: true,
  openNavMenu: false,
  zIndex: 10,
});

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const Header = () => {
  const [openSearch, setOpenSearch] = createSignal(false);
  const [openNavMenu, setOpenNavMenu] = createSignal(false);
  const [from, setFrom] = createSignal(0);
  const openNavMenuDuration = 500;
  const tweenedValue = createTween(from, { ease: easeInOutCubic, duration: openNavMenuDuration });
  const location = useLocation();
  const headerHeight = 60;
  let gradientOverflowLeftBG!: HTMLDivElement;
  let gradientOverflowRightBG!: HTMLDivElement;
  let menuButtonSearch!: HTMLButtonElement;
  let menuButtonNavMenu!: HTMLButtonElement;
  let headerOpaqueBg!: HTMLDivElement;
  let headerOpaqueBgContainer!: HTMLDivElement;
  let headerBottomGradientBorder!: HTMLDivElement;
  let headerShadow!: HTMLDivElement;
  let navMenu!: HTMLDivElement;

  const shouldShowShadow = () => window.scrollY > primitivePagePaddingTop + 50;
  const shouldShowOpaqueBg = () => window.scrollY > 30;
  const shouldShowGradientOverflow = () => window.scrollY > primitivePagePaddingTop + 150;

  const checkScroll = () => {
    // might remove this, hopefully this issue is temp, not that big deal of an issue, but the issue is that when safari scroll 'rubberbands' at top of page there's a big white background that covers header. It's caused by header element containing blur in backdrop-filter.
    if (isSafari && !isMobile) {
      if (openNavMenu() || openSearch()) {
        return;
      }
      if (window.scrollY > 2) {
        headerOpaqueBg.style.display = "";
      } else {
        headerOpaqueBg.style.display = "none";
      }
    }

    const showOpaqueBg = shouldShowOpaqueBg();
    const showShadow = shouldShowShadow();
    const showGradientOverflow = shouldShowGradientOverflow();

    setHeaderState("showOpaqueBg", showOpaqueBg);

    if (doesPathnameMatchBase(location.pathname)) {
      return;
    }
    setHeaderState("showShadow", showShadow);
    setHeaderState("showGradientOverflow", showGradientOverflow);
  };

  onMount(() => {
    checkScroll();

    window.addEventListener("scroll", checkScroll, { passive: true });
  });

  let navMenuHeight = 0;

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
    defer(openNavMenu, openNavMenu => {
      if (openNavMenu) {
        navMenuHeight = navMenu.clientHeight;

        headerOpaqueBg.classList.add("!backdrop-blur-md", "!bg-white/50", "dark:!bg-[#293843]/70");
        headerOpaqueBg.style.display = "";
        headerOpaqueBg.style.height = `${navMenuHeight + headerHeight}px`;
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
        headerOpaqueBgContainer.style.height = `${navMenuHeight + headerHeight}px`;
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
      const showOpaqueBg = window.scrollY > 30;

      if (!showOpaqueBg) {
        setHeaderState("showOpaqueBg", true);
        setTimeout(() => {
          const showOpaqueBg = window.scrollY > 30;
          if (!showOpaqueBg) {
            setHeaderState("showOpaqueBg", false);
          }
        }, openNavMenuDuration);
      }
      setFrom(0);
    }),
  );

  createEffect(
    defer(
      () => headerState.disableScroll,
      disableScroll => {
        if (disableScroll) {
          window.removeEventListener("scroll", checkScroll);
          return;
        }
        window.addEventListener("scroll", checkScroll, { passive: true });
      },
    ),
  );

  createEffect(
    defer(
      () => location.hash,
      (currentHash, prevHash) => {
        if (prevHash === currentHash) return;
        setOpenNavMenu(false);
      },
    ),
  );

  createEffect(() => {
    setOpenNavMenu(headerState.openNavMenu);
  });
  createEffect(() => {
    setHeaderState("openNavMenu", openNavMenu());
  });

  createRenderEffect(
    defer(
      () => location.pathname,
      pathname => {
        const showShadow = shouldShowShadow();
        if (!showShadow) return;

        if (doesPathnameMatchBase(pathname)) {
          setHeaderState("showShadow", false);
        }
      },
    ),
  );

  return (
    <>
      <header class="fixed top-0 left-0 right-0 h-[60px]" style={{ "z-index": headerState.zIndex }}>
        <div class="relative h-full">
          <div
            class={`${pageWidthClass} mx-auto w-full h-full flex px-4 sm:px-8 items-center justify-between gap-2`}
          >
            <div
              class={`${pageWidthClass} w-full absolute top-0 left-0 bottom-0 right-0 mx-auto box-shadow-[var(--header-box-shadow)] -z-1 transition-opacity duration-250`}
              classList={{
                "opacity-100": headerState.showShadow || openNavMenu(),
                "opacity-0": !headerState.showShadow,
              }}
              ref={headerShadow}
            >
              <div
                class="h-full box-shadow-[var(--header-big-box-shadow)] -z-1 transition-composite duration-250"
                classList={{
                  "opacity-100": openNavMenu(),
                  "opacity-0": !openNavMenu(),
                }}
              />
            </div>
            <A href="/">
              <img
                class="dark:hidden hidden sm:block h-[28px] sm:h-[40px]"
                src={solidPrimitivesLogo}
                alt=""
              />
              <img
                class="hidden dark:sm:block h-[28px] sm:h-[40px]"
                src={solidPrimitivesDarkLogo}
                alt=""
              />
              <img
                class="dark:hidden sm:hidden h-[28px] sm:h-[40px]"
                src={solidPrimitivesStackedLogo}
                alt=""
              />
              <img
                class="hidden dark:block sm:!hidden h-[28px] sm:h-[40px]"
                src={solidPrimitivesStackedDarkLogo}
                alt=""
              />
            </A>
            <nav>
              <ul class="flex items-center gap-3">
                <li class="transition" classList={{ "opacity-0": !headerState.showSearchBtn }}>
                  <SearchBtn ref={menuButtonSearch} />
                </li>
                <li>
                  <ThemeBtn />
                </li>
                <li>
                  <Hamburger active={openNavMenu()} ref={menuButtonNavMenu} />
                </li>
              </ul>
            </nav>
          </div>
          <SearchModal menuButton={menuButtonSearch} open={openSearch} setOpen={setOpenSearch} />
        </div>
        {/* fixes weird shimmering top dark shadow blur during openNavMenu animation in Chrome  */}
        {/* Still shows up in Safari, no fix  */}
        <div
          class="absolute inset-0 overflow-clip pointer-events-none -z-1"
          ref={headerOpaqueBgContainer}
        >
          <div
            class="absolute inset-0 translate-y-[calc(-100%+60px)] transition-[background-color,backdrop-filter]"
            classList={{
              "backdrop-blur-md bg-white/50 dark:bg-[#293843]/70":
                headerState.showOpaqueBg || openNavMenu(),
              "backdrop-blur-none bg-white/0 dark:bg-[#293843]/0":
                !openNavMenu() && !headerState.showOpaqueBg,
            }}
            ref={headerOpaqueBg}
          />
        </div>
        <div class="absolute h-[1px] top-0 left-0 right-0 bg-page-main-bg z-1" />
        <div
          class={`${pageWidthClass} mx-auto background-[var(--header-border-bottom)] h-[2px] transition-opacity duration-250`}
          classList={{
            "opacity-100": headerState.showGradientBorder,
            "opacity-0": !headerState.showGradientBorder,
          }}
          ref={headerBottomGradientBorder}
        />
        <div class={`${pageWidthClass} relative mx-auto top-[-2px] overflow-clip`}>
          <Dismiss
            menuButton={menuButtonNavMenu}
            open={openNavMenu}
            setOpen={setOpenNavMenu}
            class="-translate-y-full"
            animation={{
              onEnter: (_, done) => {
                setTimeout(done, openNavMenuDuration);
              },
              onExit: (_, done) => {
                setTimeout(done, openNavMenuDuration);
              },
              onAfterExit: () => {
                // clear the styles only if the nav menu is closed
                if (openNavMenu()) return;

                headerShadow.style.display = "";
                headerOpaqueBg.classList.remove(
                  "!backdrop-blur-md",
                  "!bg-white/50",
                  "dark:!bg-[#293843]/70",
                );
                headerOpaqueBg.style.top = "";
                headerOpaqueBgContainer.style.top = "";
                headerOpaqueBgContainer.style.height = "";
              },
            }}
            ref={navMenu}
          >
            <NavMenu />
          </Dismiss>
        </div>
      </header>
      <div
        class="hidden md:flex fixed top-0 left-0 right-0 pointer-events-none -z-1 transition"
        classList={{
          "opacity-0": !headerState.showGradientOverflow,
          "opacity-100": headerState.showGradientOverflow,
          "!transition-none": isSafari,
        }}
      >
        <div
          class="flex-grow h-[220px] bg-[linear-gradient(to_bottom,var(--page-main-bg)_var(--header-gradient-overflow-start),transparent)] -order-1"
          style={{ "--header-gradient-overflow-start": "60px" }}
          ref={gradientOverflowLeftBG}
        />

        <div class={`${pageWidthClass} w-full flex-grow flex-shrink-0`} />
        <div
          class="flex-grow h-[220px] bg-[linear-gradient(to_bottom,var(--page-main-bg)_var(--header-gradient-overflow-start),transparent)]"
          style={{ "--header-gradient-overflow-start": "60px" }}
          ref={gradientOverflowRightBG}
        />
      </div>
    </>
  );
};

export default Header;

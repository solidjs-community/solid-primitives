import solidPrimitivesLogo from "~/assets/img/solid-primitives-logo.svg";
import solidPrimitivesDarkLogo from "~/assets/img/solid-primitives-dark-logo.svg";
import solidPrimitivesStackedLogo from "~/assets/img/solid-primitives-stacked-logo.svg";
import solidPrimitivesStackedDarkLogo from "~/assets/img/solid-primitives-stacked-dark-logo.svg";
import { FiMenu, FiSearch } from "solid-icons/fi";
import { createEffect, createSignal, on, onMount, Show } from "solid-js";
import SearchModal from "../Search/SearchModal";
import ThemeBtn from "./ThemeBtn";
import SearchBtn from "../Search/SearchBtn";
import { useLocation } from "solid-start";
import NavMenu from "./NavMenu";
import { createStore } from "solid-js/store";
import Dismiss from "solid-dismiss";
import { createTween } from "@solid-primitives/tween";

export const [headerState, setHeaderState] = createStore({
  showOpaqueBg: false,
  showShadow: false,
  showGradientBorder: false
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
  let menuButtonSearch!: HTMLButtonElement;
  let menuButtonNavMenu!: HTMLButtonElement;
  let headerOpaqueBg!: HTMLDivElement;
  let headerBottomGradientBorder!: HTMLDivElement;
  let headerShadow!: HTMLDivElement;
  let navMenu!: HTMLDivElement;

  const checkScroll = () => {
    const showOpaqueBg = window.scrollY > 30;
    const showShadow = window.scrollY > 150;

    setHeaderState("showOpaqueBg", showOpaqueBg);

    if (location.pathname === "/") {
      return;
    }
    setHeaderState("showShadow", showShadow);
  };

  onMount(() => {
    checkScroll();

    window.addEventListener(
      "scroll",
      () => {
        checkScroll();
      },
      { passive: true }
    );
  });

  let navMenuHeight = 0;

  createEffect(
    on(
      tweenedValue,
      tweenedValue => {
        navMenu.style.transform = `translateY(${-navMenuHeight + tweenedValue}px)`;
        headerBottomGradientBorder.style.transform = `translateY(${tweenedValue}px)`;
        headerShadow.style.transform = `translateY(${tweenedValue}px)`;
        headerOpaqueBg.style.transform = `translateY(${-navMenuHeight + tweenedValue}px)`;
      },
      { defer: true }
    )
  );

  createEffect(
    on(
      openNavMenu,
      openNavMenu => {
        //     const coords = {y: 0}
        // const tween = new TWEEN.Tween(coords) // Create a new tween that modifies 'coords'.
        // 	.to({y: 200}, 1000) // Move to (300, 200) in 1 second.
        // 	.easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        // 	.onUpdate(() => {
        // 	})
        // 	.start() // Start the tween immediately.
        if (openNavMenu) {
          navMenuHeight = navMenu.clientHeight;

          headerOpaqueBg.style.height = `${navMenuHeight + headerHeight}px`;
          headerOpaqueBg.style.transform = `translateY(${-navMenuHeight}px)`;
          setFrom(navMenuHeight);
          // requestAnimationFrame(() => {
          //   requestAnimationFrame(() => {
          //     headerBottomGradientBorder.style.transform = `translateY(${navMenuHeight}px)`;
          //     headerShadow.style.transform = `translateY(${navMenuHeight}px)`;
          //     headerOpaqueBg.style.transform = "translateY(0px)";
          //   });
          // });
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
      },
      { defer: true }
    )
  );

  return (
    <header class="fixed top-0 left-0 right-0 h-[60px] z-10">
      <div class="relative h-full">
        <div class="max-w-[900px] mx-auto w-full h-full flex px-4 sm:px-8 items-center justify-between gap-2">
          <div
            class="absolute top-0 left-0 bottom-0 right-0 box-shadow-[var(--header-box-shadow)] -z-1 transition-opacity duration-250"
            classList={{
              "opacity-100": headerState.showShadow || openNavMenu(),
              "opacity-0": !headerState.showShadow
            }}
            ref={headerShadow}
          >
            <div
              class="h-full box-shadow-[var(--header-big-box-shadow)] -z-1 transition-composite duration-250"
              classList={{
                "opacity-100": openNavMenu(),
                "opacity-0": !openNavMenu()
              }}
            />
          </div>
          {/* <A href="/"> */}
          <a href="/">
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
          </a>
          {/* </A> */}
          <nav>
            <ul class="flex items-center gap-3">
              <li>
                <SearchBtn ref={menuButtonSearch} />
              </li>
              <li>
                <ThemeBtn />
              </li>
              <li>
                <button
                  class="w-[45px] h-[45px] flex justify-center items-center text-[#306FC4] hover:text-[#063983] mr-[-10px] dark:text-[#c2d5ee] dark:hover:text-white"
                  ref={menuButtonNavMenu}
                >
                  <FiMenu size={24} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <SearchModal menuButton={menuButtonSearch} open={openSearch} setOpen={setOpenSearch} />
      </div>
      <div
        class="absolute h-full top-0 left-0 right-0 transition-[background-color,backdrop-filter] -z-1"
        classList={{
          "backdrop-blur-md bg-white/50 dark:bg-[#293843]/70":
            headerState.showOpaqueBg || openNavMenu(),
          "backdrop-blur-none bg-white/0 dark:bg-[#293843]/0":
            !openNavMenu() && !headerState.showOpaqueBg
        }}
        ref={headerOpaqueBg}
      />
      <div
        class="background-[var(--header-border-bottom)] h-[2px] transition-opacity duration-250"
        classList={{
          "opacity-100": headerState.showGradientBorder,
          "opacity-0": !headerState.showGradientBorder
        }}
        ref={headerBottomGradientBorder}
      />
      <div class="relative top-[-2px] overflow-clip">
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
            }
          }}
          ref={navMenu}
        >
          <NavMenu />
        </Dismiss>
      </div>
    </header>
  );
};

export default Header;

import { usePrefersDark } from "@solid-primitives/media";
import { defer } from "@solid-primitives/utils";
import { createEffect, createSignal, Match, onSettled, Switch } from "solid-js";
import HalfSun from "../Icons/HalfSun.js";

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
  </svg>
);

const ThemeBtn = () => {
  const [theme, setTheme] = createSignal<"light" | "dark" | "os">("os");
  const prefersDark = usePrefersDark();

  const onClickTheme = () => {
    switch (theme()) {
      // 1. OS (default dark)
      // 2. user light
      // 3. user dark
      // 4. OS (default dark)
      case "dark":
        {
          if (prefersDark()) {
            document.documentElement.classList.add("dark");
            localStorage.removeItem("theme");
            setTheme("os");
          } else {
            document.documentElement.classList.remove("dark");
            localStorage.theme = "light";
            setTheme("light");
          }
        }
        break;
      // 1. OS (default light)
      // 2. user dark
      // 3. user light
      // 4. OS (default light)
      case "light":
        {
          if (prefersDark()) {
            document.documentElement.classList.add("dark");
            localStorage.theme = "dark";
            setTheme("dark");
          } else {
            localStorage.removeItem("theme");
            setTheme("os");
          }
        }
        break;
      default: {
        if (!prefersDark()) {
          document.documentElement.classList.add("dark");
          localStorage.theme = "dark";
          setTheme("dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.theme = "light";
          setTheme("light");
        }
      }
    }
  };

  createEffect(
    defer(prefersDark, prefersDark => {
      if (theme() !== "os") return;

      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }),
  );

  onSettled(() => {
    let lsTheme = localStorage.theme;
    if (!lsTheme) lsTheme = "os";

    setTheme(lsTheme);
  });

  return (
    <button
      class="bg-page-main-bg flex h-[45px] w-[45px] items-center justify-center rounded-lg text-[#306FC4] transition-colors hover:bg-[#f4f9ff] hover:text-[#063983] dark:text-[#c2d5ee] dark:hover:bg-[#3c5364] dark:hover:text-white"
      onClick={onClickTheme}
    >
      <Switch>
        <Match when={theme() === "os"}>
          <HalfSun />
        </Match>
        <Match when={theme() === "light"}>
          <SunIcon />
        </Match>
        <Match when={theme() === "dark"}>
          <MoonIcon />
        </Match>
      </Switch>
    </button>
  );
};

export default ThemeBtn;

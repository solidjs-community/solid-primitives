import { usePrefersDark } from "@solid-primitives/media";
import { FiMoon, FiSun } from "solid-icons/fi";
import { createEffect, createSignal, Match, on, onMount, Switch } from "solid-js";
import HalfSun from "../Icons/HalfSun";

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
    on(
      prefersDark,
      prefersDark => {
        if (theme() !== "os") return;

        if (prefersDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
      { defer: true }
    )
  );

  onMount(() => {
    let lsTheme = localStorage.theme;
    if (!lsTheme) lsTheme = "os";

    setTheme(lsTheme);
  });

  return (
    <button
      class="w-[45px] h-[45px] flex justify-center items-center text-[#306FC4] bg-[#F8F8FC] hover:text-[#063983] hover:bg-[#d0e4ff87] rounded-full dark:bg-[#2f404d] dark:text-[#c2d5ee] dark:hover:text-white dark:hover:bg-[#3c5364] transition-colors"
      onClick={onClickTheme}
    >
      <Switch>
        <Match when={theme() === "os"}>
          <HalfSun />
        </Match>
        <Match when={theme() === "light"}>
          <FiSun />
        </Match>
        <Match when={theme() === "dark"}>
          <FiMoon />
        </Match>
      </Switch>
    </button>
  );
};

export default ThemeBtn;

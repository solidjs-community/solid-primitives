import { Component } from "solid-js";

const Footer: Component = () => {
  return (
    <footer class="bg-[#F3F5F7] dark:bg-slate-800/50 mt-10">
      <div class="max-w-[864px] mx-auto leading-7 p-4 py-8 prose">
        <p class="text-center">
          This site is built with{" "}
          <a class="text-link" href="https://www.solidjs.com" target="_blank">
            SolidJS
          </a>
          ,{" "}
          <a class="text-link" href="https://start.solidjs.com" target="_blank">
            SolidStart
          </a>
          , and best of all ...{" "}
          <span class="whitespace-nowrap">
            <a
              class="text-link"
              href="https://github.com/solidjs-community/solid-primitives"
              target="_blank"
            >
              Solid Primitives
            </a>
          </span>
          !
        </p>
      </div>
    </footer>
  );
};

export default Footer;

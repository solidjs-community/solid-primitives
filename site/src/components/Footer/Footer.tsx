import { type Component } from "solid-js";

const Footer: Component = () => {
  return (
    <footer class="mt-10 bg-[#F3F5F7] dark:bg-slate-800/50">
      <div class="prose mx-auto max-w-[864px] p-4 py-8 leading-7">
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

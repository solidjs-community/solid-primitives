import { type Component } from "solid-js";
import { GITHUB_REPO } from "~/constants.js";

const GithubIcon = (props: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size ?? "1em"}
    height={props.size ?? "1em"}
    viewBox="0 0 496 512"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
  </svg>
);

/* <Heading>
    Has This Type Pattern Tried To Sneak In Some Generic Or Parameterized Type Pattern
    Matching Stuff Anywhere Visitor .java
  </Heading> */

export const Heading: Component<{ name: string; formattedName: string }> = props => {
  return (
    <>
      <div class="text-3xl font-bold capitalize sm:text-4xl">
        <div class="@container/heading container-s relative mb-[-60px]">
          <div aria-hidden="true" style="visibility: hidden;">
            {props.formattedName}
          </div>
          <svg
            class="@[290px]/heading:block absolute hidden"
            viewBox="0 0 88.975 79.46"
            // @ts-ignore
            xml:space="preserve"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            style="z-index: 1; right: -159px; width: 247px; pointer-events: none; bottom: -89px;"
          >
            <use href="#solid-blocks-header-cluster-e" transform="translate(-30 -26)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-45 -17)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-16 -16.5)" />
          </svg>
          <svg
            class="absolute sm:hidden"
            viewBox="0 0 88.975 79.46"
            // @ts-ignore
            xml:space="preserve"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            style="z-index: 1; right: -157px; width: 247px; pointer-events: none; bottom: -92px;"
          >
            <use
              opacity="0.8"
              href="#solid-blocks-header-cluster-e"
              transform="translate(-16 -16.5)"
            />
          </svg>
        </div>
        <div class="relative">
          <svg
            class="absolute left-0 top-0"
            viewBox="0 0 88.975 79.46"
            // @ts-ignore
            xml:space="preserve"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            style="z-index: 2; left: -152px; width: 247px; top: 1px; pointer-events: none;"
          >
            <use href="#solid-blocks-header-cluster-e" transform="translate(-18 -24)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-33 -14)" />
          </svg>
          <svg
            class="absolute left-0 top-0"
            viewBox="0 0 88.975 79.46"
            // @ts-ignore
            xml:space="preserve"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            style="z-index: 1; left: -239px; width: 247px; top: -78px; pointer-events: none;"
          >
            <use href="#solid-blocks-header-cluster-e" transform="translate(-44 1)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-31 -22.2)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-46 -13.2)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-16.2 -13.3)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-31 -4.2)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(13 -13.3)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-1.5 -4.3)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-16.2 4.7)" />
          </svg>
          {/* <svg
          class="absolute top-0 left-0 opacity-80"
          viewBox="0 0 88.975 79.46"
          xml:space="preserve"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
          style="z-index: 0; left: -97px; width: 247px; top: -65px; pointer-events: none;"
        >
          <use href="#solid-blocks-header-cluster-e" transform="translate(-1.5 -4.3)" />
          <use href="#solid-blocks-header-cluster-e" transform="translate(-16.2 4.7)" />
        </svg> */}
          <svg
            class="absolute left-0 top-0"
            viewBox="0 0 88.975 79.46"
            // @ts-ignore
            xml:space="preserve"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            style="z-index: 5; left: -239px; width: 247px; top: -120px; pointer-events: none;"
          >
            <use href="#solid-blocks-header-cluster-e" transform="translate(-30 -26)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-45 -17)" />
            <use href="#solid-blocks-header-cluster-e" transform="translate(-16 -16.5)" />
          </svg>
          <svg
            class="absolute"
            viewBox="0 0 88.975 79.46"
            // @ts-ignore
            xml:space="preserve"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            style="z-index: 0; right: -40.5px; width: 247px; top: 0px; pointer-events: none;"
          >
            <g transform="translate(11.5 -32.1)">
              <path
                d="m902.479-260.051-11.198 6.465a1.09 1.09 0 0 0 0 1.888l11.198 6.464a3.27 3.27 0 0 0 3.27 0l11.197-6.464a1.09 1.09 0 0 0 0-1.888l-11.197-6.465a3.27 3.27 0 0 0-3.27 0z"
                transform="translate(-753.562 279.827) scale(.89973)"
                opacity=".352"
                fill="url(#solid-blocks-header-cluster-f)"
                filter="url(#solid-blocks-header-cluster-g)"
              />
              <path
                d="M918.917-274.533a3.27 3.27 0 0 0-1.635.438l-7.578 4.376h-4.165v3.033h.007a1.09 1.09 0 0 0 .538.944l11.198 6.465a3.27 3.27 0 0 0 3.27 0l11.197-6.465a1.09 1.09 0 0 0 .541-1.006h.002v-2.971h-4.162l-7.578-4.376a3.27 3.27 0 0 0-1.635-.438z"
                fill="url(#solid-blocks-header-cluster-j)"
                transform="translate(-859.018 314.327)"
              />
              <path
                d="m917.282-277.066-11.198 6.465a1.09 1.09 0 0 0 0 1.888l11.198 6.464a3.27 3.27 0 0 0 3.27 0l11.197-6.464a1.09 1.09 0 0 0 0-1.888l-11.197-6.465a3.27 3.27 0 0 0-3.27 0z"
                fill="url(#solid-blocks-header-cluster-k)"
                transform="translate(-859.018 314.327)"
              />
            </g>
          </svg>
          <svg
            class="absolute"
            viewBox="0 0 16.57 79.46"
            // @ts-ignore
            xml:space="preserve"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            style="z-index: 1; left: -37.5px; width: 46px; top: 0px; pointer-events: none;"
          >
            <g transform="translate(-43.3 -32.2)">
              <path
                d="M918.917-274.533a3.27 3.27 0 0 0-1.635.438l-7.578 4.376h-4.165v3.033h.007a1.09 1.09 0 0 0 .538.944l11.198 6.465a3.27 3.27 0 0 0 3.27 0l11.197-6.465a1.09 1.09 0 0 0 .541-1.006h.002v-2.971h-4.162l-7.578-4.376a3.27 3.27 0 0 0-1.635-.438z"
                fill="url(#solid-blocks-header-cluster-j)"
                transform="translate(-859.018 314.327)"
              />
              <path
                d="m917.282-277.066-11.198 6.465a1.09 1.09 0 0 0 0 1.888l11.198 6.464a3.27 3.27 0 0 0 3.27 0l11.197-6.464a1.09 1.09 0 0 0 0-1.888l-11.197-6.465a3.27 3.27 0 0 0-3.27 0z"
                fill="url(#solid-blocks-header-cluster-k)"
                transform="translate(-859.018 314.327)"
              />
            </g>
          </svg>
          <svg
            class="absolute"
            viewBox="0 0 88.975 79.46"
            // @ts-ignore
            xml:space="preserve"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
            style="z-index: 0; left: -37.5px; width: 247px; top: 0px; pointer-events: none;"
          >
            <g transform="translate(-43.3 -32.2)">
              <path
                d="m902.479-260.051-11.198 6.465a1.09 1.09 0 0 0 0 1.888l11.198 6.464a3.27 3.27 0 0 0 3.27 0l11.197-6.464a1.09 1.09 0 0 0 0-1.888l-11.197-6.465a3.27 3.27 0 0 0-3.27 0z"
                transform="translate(-753.562 279.827) scale(.89973)"
                opacity=".352"
                fill="url(#solid-blocks-header-cluster-f)"
                filter="url(#solid-blocks-header-cluster-g)"
              />
            </g>
          </svg>
          <div class="absolute left-[8px] right-[8px] top-[10px]">
            <div class="relative top-[3px] h-[43.63px] w-full bg-[linear-gradient(to_right,#f5f7ff,#f5f7ff)] dark:bg-[linear-gradient(to_right,#2a3d4b,#2b3c4b)]" />
            <div class="box-shadow-[0px_6px_17px_0px_#c4d3f4] dark:box-shadow-[0px_6px_17px_0px_#202d3b] h-[11px] w-full bg-[linear-gradient(to_right,#dbe0f2,#d7ddf2)] dark:bg-[linear-gradient(to_right,#263544,#263442)]" />
          </div>
          <h1 class="z-1 absolute bottom-[-40px] left-0">{props.formattedName}</h1>
          <div class="z-1 relative">
            <div aria-hidden="true" class="m-0 h-0 p-0" style="visibility: hidden;">
              {props.formattedName}
            </div>
            <div
              class="mask-image-[linear-gradient(to_bottom,transparent,#000)] z-1 pointer-events-none absolute left-0 top-[32px] -scale-y-100 select-none text-[#4b6a87] opacity-[0.35] blur-[2px] dark:text-[#8a9fb5] dark:opacity-30"
              aria-hidden="true"
              style="-webkit-mask-size: 100% 22px; -webkit-mask-repeat: no-repeat; -webkit-mask-position: bottom; mask-size: 100% 22px; mask-repeat: no-repeat; mask-position: bottom;"
            >
              {props.formattedName}
            </div>
          </div>
        </div>
        <div aria-hidden="true" class="mb-[-40px] max-h-[80px]" style="visibility: hidden;">
          {props.formattedName}
        </div>
      </div>
      <div class="relative">
        <svg
          class="absolute"
          viewBox="0 0 88.975 79.46"
          // @ts-ignore
          xml:space="preserve"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
          style="top: 13px; left: -30px; width: 247px; pointer-events: none;"
        >
          <use href="#solid-blocks-header-cluster-e" transform="translate(-44 -38)" />
          <use href="#solid-blocks-header-cluster-e" transform="translate(-44 -38)" />
          <use href="#solid-blocks-header-cluster-e" transform="translate(-29 -29)" />
        </svg>
        {props.name && (
          <a
            class="relative inline-block scale-90 fill-current transition-opacity hover:opacity-70 sm:scale-100"
            href={`${GITHUB_REPO}/tree/main/packages/${props.name}`}
            target="_blank"
            rel="noopener"
          >
            <GithubIcon size={28} />
            <div class="mask-image-[linear-gradient(to_bottom,transparent_12px,#000)] absolute left-0 top-[32px] -scale-y-100 opacity-20 blur-[2px]">
              <GithubIcon size={28} />
            </div>
          </a>
        )}
      </div>
    </>
  );
};

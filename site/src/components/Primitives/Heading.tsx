import solidBlocksHeadingLeftBlockImg from "~/assets/img/solid-blocks-heading-left-block.svg";
import solidBlocksHeadingRightBlockImg from "~/assets/img/solid-blocks-heading-right-block.svg";
// import solidBlocksHeadingMidBlockImg from "~/assets/img/solid-blocks-heading-mid-block.svg";
// import solidBlocksHeadingMidBlockShadowImg from "~/assets/img/solid-blocks-heading-mid-block-shadow.svg";
import solidBlocksHeading0Img from "~/assets/img/solid-blocks-heading-0.svg";
import solidBlocksHeading1Img from "~/assets/img/solid-blocks-heading-1.svg";
import solidBlocksHeading2Img from "~/assets/img/solid-blocks-heading-2.svg";
import { ParentComponent } from "solid-js";

const Heading: ParentComponent = props => {
  return (
    <div class="text-2xl sm:text-4xl font-bold capitalize">
      <div class="@container/heading relative container-s mb-[-60px]">
        {/* {props.children} */}
        <div class="invisible">{props.children}</div>

        <svg
          class="absolute hidden @[290px]/heading:block"
          viewBox="0 0 88.975 79.46"
          xml:space="preserve"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
          style="z-index: 1; right: -159px; width: 247px; pointer-events: none; bottom: -89px;"
        >
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-30 -26)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-45 -17)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-16 -16.5)" />
        </svg>
      </div>
      <div class="relative">
        {/* <img class="absolute top-[-144px] left-[-335px] z-1" src={solidBlocksHeading0Img} alt="" />
      <img class="absolute top-[-144px] left-[-335px] z-1" src={solidBlocksHeading1Img} alt="" />
      <img class="absolute top-[-144px] left-[-335px] z-1" src={solidBlocksHeading2Img} alt="" /> */}
        <svg
          class="absolute top-0 left-0"
          viewBox="0 0 88.975 79.46"
          xml:space="preserve"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
          style="z-index: 2; left: -152px; width: 247px; top: 1px; pointer-events: none;"
        >
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-18 -24)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-33 -14)" />
        </svg>
        <svg
          class="absolute top-0 left-0"
          viewBox="0 0 88.975 79.46"
          xml:space="preserve"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
          style="z-index: 1; left: -239px; width: 247px; top: -78px; pointer-events: none;"
        >
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-44 1)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-31 -22.2)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-46 -13.2)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-16.2 -13.3)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-31 -4.2)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(13 -13.3)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-1.5 -4.3)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-16.2 4.7)" />
        </svg>
        <svg
          class="absolute top-0 left-0"
          viewBox="0 0 88.975 79.46"
          xml:space="preserve"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
          style="z-index: 18; left: -239px; width: 247px; top: -120px; pointer-events: none;"
        >
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-30 -26)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-45 -17)" />
          <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-16 -16.5)" />
        </svg>
        <img
          class="absolute top-[10px] left-[-37.5px] h-[80px] z-1"
          src={solidBlocksHeadingLeftBlockImg}
          alt=""
        />
        <img
          class="absolute top-[10px] right-[-40.5px] h-[80px] object-cover object-right"
          src={solidBlocksHeadingRightBlockImg}
          alt=""
        />
        <div class="absolute top-[10px] left-[8px] right-[8px]">
          <div class="w-full h-[46.577px] bg-[#f4f7fe]" />
          <div class="w-full h-[8.799px] bg-[#d4d9ee] box-shadow-[0px_6px_17px_0px_#ced8f2]" />
        </div>
        <h1 class="absolute bottom-[-40px] left-0 z-1">{props.children}</h1>
        {/* <div class="invisible h-0 p-0 m-0">{props.children}</div> */}
        <div class="relative z-1">
          <div class="invisible h-0 p-0 m-0">{props.children}</div>
          <div
            class="absolute top-[24px] left-0 pointer-events-none text-[#4b6a87ff] -scale-y-100 blur-[2px] mask-image-[linear-gradient(to_bottom,transparent,#000)] opacity-40 z-1"
            aria-hidden="true"
            style="-webkit-mask-size: 100% 28px; -webkit-mask-repeat: no-repeat; -webkit-mask-position: bottom; mask-size: 100% 28px; mask-repeat: no-repeat; mask-position: bottom;"
          >
            {props.children}
          </div>
        </div>
        {/* <div
        class="absolute bottom-[-50px] left-0 pointer-events-none text-[#4b6a87ff] -scale-y-100 blur-[2px] mask-image-[linear-gradient(to_bottom,transparent_25%,#000)] opacity-40 z-1"
        aria-hidden="true"
      >
        {props.children}
      </div> */}
      </div>
      {/* <div class="invisible mb-[-60px]">{props.children}</div> */}
      <div class="invisible mb-[-40px] max-h-[80px]">{props.children}</div>
    </div>
  );
};

export default Heading;

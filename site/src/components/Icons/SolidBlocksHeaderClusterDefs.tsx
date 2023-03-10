const SolidBlocksHeaderClusterDefs = () => {
  return (
    <svg
      class="absolute top-0 left-0 h-0 w-0 opacity-0"
      // @ts-ignore
      xml:space="preserve"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="solid-blocks-header-cluster-a">
          <stop offset="0" stop-color="var(--solid-blocks-header-cluster__shadow-left)" />
          <stop offset="1" stop-color="var(--solid-blocks-header-cluster__shadow-right)" />
        </linearGradient>
        <linearGradient id="solid-blocks-header-cluster-c">
          <stop offset="0" stop-color="var(--solid-blocks-header-cluster__block-body-left)" />
          <stop offset="1" stop-color="var(--solid-blocks-header-cluster__block-body-right)" />
        </linearGradient>
        <linearGradient id="solid-blocks-header-cluster-b">
          <stop
            offset="0"
            stop-color="var(--solid-blocks-header-cluster__small-shadow-left)"
            stop-opacity=".736"
          />
          <stop
            offset="1"
            stop-color="var(--solid-blocks-header-cluster__small-shadow-right)"
            stop-opacity=".725"
          />
        </linearGradient>
        <linearGradient id="solid-blocks-header-cluster-d">
          <stop offset="0" stop-color="var(--solid-blocks-header-cluster__block-top-left)" />
          <stop offset="1" stop-color="var(--solid-blocks-header-cluster__block-top-right)" />
        </linearGradient>
        <linearGradient
          // @ts-ignore
          href="#solid-blocks-header-cluster-a"
          id="solid-blocks-header-cluster-f"
          gradientUnits="userSpaceOnUse"
          x1="902.184"
          y1="-261.811"
          x2="935.649"
          y2="-261.811"
          gradientTransform="translate(-14.803 9.168)"
        />
        <linearGradient
          // @ts-ignore
          href="#solid-blocks-header-cluster-b"
          id="solid-blocks-header-cluster-h"
          gradientUnits="userSpaceOnUse"
          x1="902.184"
          y1="-261.811"
          x2="935.649"
          y2="-261.811"
        />
        <linearGradient
          // @ts-ignore
          href="#solid-blocks-header-cluster-c"
          id="solid-blocks-header-cluster-j"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(609.278 -383.962)"
          x1="296.261"
          y1="117.276"
          x2="323.014"
          y2="117.276"
        />
        <linearGradient
          // @ts-ignore
          href="#solid-blocks-header-cluster-d"
          id="solid-blocks-header-cluster-k"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(609.278 -383.962)"
          x1="296.261"
          y1="114.305"
          x2="323.016"
          y2="114.305"
        />
        <filter
          id="solid-blocks-header-cluster-g"
          x="-.08"
          y="-.137"
          width="1.16"
          height="1.273"
          color-interpolation-filters="sRGB"
        >
          <feGaussianBlur stdDeviation=".894" />
        </filter>
        <filter
          id="solid-blocks-header-cluster-i"
          x="-.054"
          y="-.093"
          width="1.109"
          height="1.185"
          color-interpolation-filters="sRGB"
        >
          <feGaussianBlur stdDeviation=".606" />
        </filter>
        <g id="solid-blocks-header-cluster-e" stroke-width=".348">
          <path
            d="m902.479-260.051-11.198 6.465a1.09 1.09 0 0 0 0 1.888l11.198 6.464a3.27 3.27 0 0 0 3.27 0l11.197-6.464a1.09 1.09 0 0 0 0-1.888l-11.197-6.465a3.27 3.27 0 0 0-3.27 0z"
            transform="translate(-753.562 279.827) scale(.89973)"
            opacity=".352"
            fill="url(#solid-blocks-header-cluster-f)"
            filter="url(#solid-blocks-header-cluster-g)"
          />
          <path
            style="mix-blend-mode:normal"
            d="m917.282-269.22-11.198 6.466a1.09 1.09 0 0 0 0 1.888l11.198 6.464a3.27 3.27 0 0 0 3.27 0l11.197-6.464a1.09 1.09 0 0 0 0-1.888l-11.197-6.465a3.27 3.27 0 0 0-3.27 0z"
            transform="translate(-601.084 238.996) scale(.7193)"
            fill="url(#solid-blocks-header-cluster-h)"
            filter="url(#solid-blocks-header-cluster-i)"
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
      </defs>
    </svg>
  );
};

export default SolidBlocksHeaderClusterDefs;

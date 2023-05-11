const plugin = require("tailwindcss/plugin");
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "../packages/*/dev/*.{ts,tsx}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        "pointer-fine": {
          raw: "(pointer: fine)",
        },
        "is-safari": { raw: "not all and (min-resolution: 0.001dpcm)" },
        xxs: { raw: "(min-width: 400px)" },
        xs: { raw: "(min-width: 520px)" },
      },
      transitionDuration: {
        250: "250ms",
      },
      colors: {
        "page-main-bg": "var(--page-main-bg)",
      },
      boxShadow: {
        ring: "0px 0px 4px 4px rgb(0, 0, 0)",
        "ring-white": "0px 0px 0px 2.7px #fff",
        "ring-black": "0px 0px 0px 2.7px #000",
      },
      fontFamily: {
        display: ["Gordita", ...defaultTheme.fontFamily.sans],
        body: ["Gordita", ...defaultTheme.fontFamily.sans],
        gordita: "Gordita",
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": "#333",
            "--tw-prose-invert-body": "#fff",
            "--tw-prose-headings": theme("colors.solid.default"),
            "--tw-prose-invert-headings": theme("colors.solid.darkdefault"),
            "--tw-prose-invert-quote-borders": theme("colors.solid.mediumgray"),
            "--tw-prose-pre-bg": "transparent",
            color: "var(--tw-prose-body)",
            fontFamily: "Gordita",
            pre: null,
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            h1: {
              fontWeight: "600",
              fontSize: "1.75rem",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "1rem",
              marginTop: "2rem",
              color: "var(--tw-prose-headings)",
            },
            h2: {
              fontWeight: "600",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "1rem",
              marginTop: "2rem",
              color: "var(--tw-prose-headings)",
            },
            a: {
              color: "#999",
              textDecoration: "none",
              fontWeight: "600",
              "&:hover": {
                color: "#2c4f7c",
              },
            },
          },
        },
      }),
      transitionProperty: {
        composite: "transform, opacity",
        filter: "filter",
        "composite-visible": "transform, opacity, visibility",
        visible: "visibility",
        "transform-visible": "transform, visibility",
      },
      zIndex: {
        negative: -1,
        "-1": -1,
        1: 1,
      },
      borderWidth: {
        1: "1px",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["group-hover"],
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-dir"),
    require("@tailwindcss/container-queries"),
    plugin(function ({ addVariant }) {
      addVariant("focus-visible-js", "&[data-focus-visible-added]");
    }),
    plugin(function ({ addUtilities }) {
      const values = ["24", "40", "70", "12"];
      const newUtilities = {};

      values.forEach(value => {
        newUtilities[`.w-fit-parent-${value}px`] = {
          width: `calc(100% + ${value}px)`,
          "margin-left": `-${Math.floor(value / 2)}px`,
        };
      });
      newUtilities[".contrast-content"] = {
        filter: "invert(1) grayscale(1) contrast(9)",
      };
      newUtilities[".contrast-content-harsh"] = {
        filter: "invert(1) grayscale(1) contrast(999)",
      };

      addUtilities(newUtilities);
    }),
    plugin(
      function ({ matchUtilities, theme }) {
        matchUtilities(
          {
            "mask-image": value => ({
              webkitMaskImage: value,
              maskImage: value,
            }),
          },
          { values: theme("maskImage") },
        );
      },
      {
        theme: {
          maskImage: {
            none: "none",
          },
        },
      },
    ),
    plugin(
      function ({ matchUtilities, theme }) {
        matchUtilities(
          {
            "stop-color": value => ({
              stopColor: value,
            }),
          },
          { values: theme("stopColor") },
        );
      },
      {
        theme: {
          stopColor: {
            none: "none",
          },
        },
      },
    ),
    plugin(
      function ({ matchUtilities, theme }) {
        matchUtilities(
          {
            "tap-highlight-color": value => ({
              WebkitTapHighlightColor: value,
            }),
          },
          { values: theme("tapHighlightColor") },
        );
      },
      {
        theme: {
          tapHighlightColor: {
            none: "transparent",
            auto: "auto",
          },
        },
      },
    ),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "box-shadow": value => ({
            boxShadow: value.replace("_", " "),
          }),
        },
        { values: theme("boxShadow") },
      );
    }),
    plugin(
      function ({ matchUtilities, theme }) {
        matchUtilities(
          {
            "word-spacing": value => ({
              wordSpacing: value,
            }),
          },
          { values: theme("wordSpacing") },
        );
      },
      {
        theme: {
          wordSpacing: {
            normal: "normal",
          },
        },
      },
    ),
    plugin(
      function ({ matchUtilities, theme }) {
        matchUtilities(
          {
            "bg-image": value => ({
              backgroundImage: value.replace("_", " "),
            }),
          },
          { values: theme("bgImage") },
        );
      },
      {
        theme: {
          bgImage: {
            none: "none",
          },
        },
      },
    ),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "dashed-border": value => {
            const dashOffset = value.match(/dashoffset\(([^)]*)\)/)?.[1] || 0;
            const dashArray = (value.match(/dasharray\(([^)]*)\)/)?.[1] || "1,8").replace(
              /,/g,
              "%2c",
            );
            const width = value.match(/width\(([^)]*)\)/)?.[1] || 0;
            const radius = value.match(/radius\(([^)]*)\)/)?.[1] || "0";
            const borderRadius = radius.match(/[^0-9]$/) ? radius : `${radius}px`;
            const color =
              value
                .match(/color\(([^)]*\)?)\)/)?.[1]
                .replace(/_/g, " ")
                .replace(/#+/, "%23")
                .replace(/\//g, "%2F")
                .replace(/\s/g, "%20") || "%23000";
            let lineCap = value.match(/linecap\(([^)]*)\)/)?.[1] || 0;
            lineCap = ["butt", "round", "square"].includes(lineCap) ? lineCap : "square";

            return {
              backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='${radius}' ry='${radius}' stroke='${color}' stroke-width='${width}' stroke-dasharray='${dashArray}' stroke-dashoffset='${dashOffset}' stroke-linecap='${lineCap}'/%3e%3c/svg%3e")`,
              borderRadius,
            };
          },
        },
        { values: theme("dashedBorder") },
      );
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "inverse-corner": value => {
            const position = (value.match(/position\(([^)]*)\)/)?.[1] || "0,100%").replace(
              /,/g,
              " ",
            );
            const _size = value.match(/size\(([^)]*)\)/)?.[1] || "0px";
            const size = _size.match(/[^0-9]$/) ? _size : `${_size}px`;
            const color = value.match(/color\(([^)]*\)?)\)/)?.[1] || "#000";
            return {
              backgroundImage: `radial-gradient(circle at ${position}, rgba(255,255,255,0) ${size}, ${color} 0)`,
              width: size,
              height: size,
            };
          },
        },
        { values: theme("inverseCorner") },
      );
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          background: value => ({
            background: value,
          }),
        },
        { values: theme("background") },
      );
    }),
    plugin(function ({ addVariant, e, postcss }) {
      addVariant("has-backdrop-filter", ({ container, separator }) => {
        const isRule = postcss.atRule({
          name: "supports",
          params: "((-webkit-backdrop-filter: none) or (backdrop-filter: none))",
        });
        isRule.append(container.nodes);
        container.append(isRule);
        isRule.walkRules(rule => {
          rule.selector = `.${e(`has-backdrop-filter${separator}${rule.selector.slice(1)}`).replace(
            /\\\\/g,
            "",
          )}`;
        });
      });
    }),
  ],
};

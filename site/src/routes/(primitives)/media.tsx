// Do not modify
// Generated from "./scripts/update-site/build-pages"

import PrimitivePageMain from "~/components/Primitives/PrimitivePageMain";
import CodePrimitive from "~/components/Primitives/CodePrimitive";
import CopyPackages from "~/components/CopyPackage/CopyPackages";
import { NoHydration } from "solid-js/web";

/*@jsxRuntime automatic @jsxImportSource solid-js*/
import { useMDXComponents as _provideComponents } from "solid-mdx";
function _createMdxContent(props) {
  const _components = Object.assign(
    {
      p: "p",
      ul: "ul",
      li: "li",
      a: "a",
      code: "code",
      h2: "h2",
      pre: "pre",
      span: "span",
      h3: "h3",
      blockquote: "blockquote",
    },
    _provideComponents(),
    props.components,
  );
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return (
    <>
      <NoHydration>
        <_components.p>
          {"Collection of reactive primitives to deal with media queries."}
        </_components.p>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.a href="#makeMediaQueryListener">
              <_components.code
                data-code-primitive-name="makeMediaQueryListener"
                data-code-package-name="media"
              >
                {"makeMediaQueryListener"}
              </_components.code>
            </_components.a>
            {" - Listen for changes to provided Media Query."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createMediaQuery">
              <_components.code
                data-code-primitive-name="createMediaQuery"
                data-code-package-name="media"
              >
                {"createMediaQuery"}
              </_components.code>
            </_components.a>
            {" - Creates a very simple and straightforward media query monitor."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createBreakpoints">
              <_components.code
                data-code-primitive-name="createBreakpoints"
                data-code-package-name="media"
              >
                {"createBreakpoints"}
              </_components.code>
            </_components.a>
            {" - Creates a multi-breakpoint monitor to make responsive components easily."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createPrefersDark">
              <_components.code>{"createPrefersDark"}</_components.code>
            </_components.a>
            {" - Provides a signal indicating if the user has requested dark color theme."}
          </_components.li>
          {"\n"}
        </_components.ul>
        {"\n"}
        <_components.h2 id="installation">
          <_components.a className="header-anchor" href="#installation">
            {"#"}
          </_components.a>
          {"Installation"}
        </_components.h2>
        {"\n"}
      </NoHydration>
      <CopyPackages packageName="@solid-primitives/media" />
      <NoHydration>
        {"\n"}
        <_components.h2 id="makemediaquerylistener">
          <_components.a className="header-anchor" href="#makemediaquerylistener">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="makeMediaQueryListener"
            data-code-package-name="media"
          >
            {"makeMediaQueryListener"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {"Attaches a MediaQuery listener to window, listeneing to changes to provided query"}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { makeMediaQueryListener } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/media"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" clear = "}
            <_components.span className="hljs-title function_">
              {"makeMediaQueryListener"}
            </_components.span>
            {"("}
            <_components.span className="hljs-string">{'"(max-width: 767px)"'}</_components.span>
            {", "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {\n  "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"(e."}
            <_components.span className="hljs-property">{"matches"}</_components.span>
            {");\n});\n"}
            <_components.span className="hljs-comment">
              {"// remove listeners (will happen also on cleanup)"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"clear"}</_components.span>
            {"();\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="createmediaquery">
          <_components.a className="header-anchor" href="#createmediaquery">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="createMediaQuery"
            data-code-package-name="media"
          >
            {"createMediaQuery"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {"Creates a very simple and straightforward media query monitor."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createMediaQuery } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/media"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" isSmall = "}
            <_components.span className="hljs-title function_">
              {"createMediaQuery"}
            </_components.span>
            {"("}
            <_components.span className="hljs-string">{'"(max-width: 767px)"'}</_components.span>
            {");\n"}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-title function_">{"isSmall"}</_components.span>
            {"());\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="server-fallback">
          <_components.a className="header-anchor" href="#server-fallback">
            {"#"}
          </_components.a>
          {"Server fallback"}
        </_components.h3>
        {"\n"}
        <_components.p>
          <_components.code
            data-code-primitive-name="createMediaQuery"
            data-code-package-name="media"
          >
            {"createMediaQuery"}
          </_components.code>
          {" accepts a "}
          <_components.code>{"serverFallback"}</_components.code>
          {" argument — value that should be returned on the server — defaults to "}
          <_components.code>{"false"}</_components.code>
          {"."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" isSmall = "}
            <_components.span className="hljs-title function_">
              {"createMediaQuery"}
            </_components.span>
            {"("}
            <_components.span className="hljs-string">{'"(max-width: 767px)"'}</_components.span>
            {", "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {");\n\n"}
            <_components.span className="hljs-comment">
              {"// will return true on the server and during hydration on the client"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-title function_">{"isSmall"}</_components.span>
            {"());\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.p>
          <_components.a href="https://codesandbox.io/s/solid-media-query-5bf16?file=/src/index.tsx">
            {"Working Demo"}
          </_components.a>
        </_components.p>
        {"\n"}
        <_components.h2 id="createbreakpoints">
          <_components.a className="header-anchor" href="#createbreakpoints">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="createBreakpoints"
            data-code-package-name="media"
          >
            {"createBreakpoints"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {"Creates a multi-breakpoint monitor to make responsive components easily."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createBreakpoints } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/media"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" breakpoints = {\n  "}
            <_components.span className="hljs-attr">{"sm"}</_components.span>
            {": "}
            <_components.span className="hljs-string">{'"640px"'}</_components.span>
            {",\n  "}
            <_components.span className="hljs-attr">{"lg"}</_components.span>
            {": "}
            <_components.span className="hljs-string">{'"1024px"'}</_components.span>
            {",\n  "}
            <_components.span className="hljs-attr">{"xl"}</_components.span>
            {": "}
            <_components.span className="hljs-string">{'"1280px"'}</_components.span>
            {",\n};\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title class_">{"Example"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"Component"}</_components.span>
            {" = "}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" matches = "}
            <_components.span className="hljs-title function_">
              {"createBreakpoints"}
            </_components.span>
            {"(breakpoints);\n\n  "}
            <_components.span className="hljs-title function_">{"createEffect"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n    "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"(matches."}
            <_components.span className="hljs-property">{"sm"}</_components.span>
            {"); "}
            <_components.span className="hljs-comment">
              {"// true when screen width >= 640px"}
            </_components.span>
            {"\n    "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"(matches."}
            <_components.span className="hljs-property">{"lg"}</_components.span>
            {"); "}
            <_components.span className="hljs-comment">
              {"// true when screen width >= 1024px"}
            </_components.span>
            {"\n    "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"(matches."}
            <_components.span className="hljs-property">{"xl"}</_components.span>
            {"); "}
            <_components.span className="hljs-comment">
              {"// true when screen width >= 1280px"}
            </_components.span>
            {"\n  });\n\n  "}
            <_components.span className="hljs-keyword">{"return"}</_components.span>
            {" (\n    "}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"div"}</_components.span>
                {"\n      "}
                <_components.span className="hljs-attr">{"classList"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{{"}</_components.span>
                {'\n        "'}
                <_components.span className="hljs-attr">{"text-tiny"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"flex"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"flex-column"}</_components.span>
                {'"'}
                <_components.span className="hljs-attr">{":"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"true"}</_components.span>
                {", // "}
                <_components.span className="hljs-attr">{"tiny"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"text"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"with"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"flex"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"column"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"layout"}</_components.span>
                {'\n        "'}
                <_components.span className="hljs-attr">{"text-small"}</_components.span>
                {'"'}
                <_components.span className="hljs-attr">{":"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"matches.sm"}</_components.span>
                {", // "}
                <_components.span className="hljs-attr">{"small"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"text"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"with"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"flex"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"column"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"layout"}</_components.span>
                {'\n        "'}
                <_components.span className="hljs-attr">{"text-base"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"flex-row"}</_components.span>
                {'"'}
                <_components.span className="hljs-attr">{":"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"matches.lg"}</_components.span>
                {", // "}
                <_components.span className="hljs-attr">{"base"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"text"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"with"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"flex"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"row"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"layout"}</_components.span>
                {'\n        "'}
                <_components.span className="hljs-attr">{"text-huge"}</_components.span>
                {'"'}
                <_components.span className="hljs-attr">{":"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"matches.xl"}</_components.span>
                {", // "}
                <_components.span className="hljs-attr">{"huge"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"text"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"with"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"flex"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"row"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"layout"}</_components.span>
                {"\n      }}\n    >"}
              </_components.span>
              {"\n      "}
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"Switch"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"fallback"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{"}</_components.span>
                {"<"}
                <_components.span className="hljs-attr">{"div"}</_components.span>
                {">"}
              </_components.span>
              {"Smallest"}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"div"}</_components.span>
                {">"}
              </_components.span>
              {"}>\n        "}
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"Match"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"when"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{matches.xl}"}</_components.span>
                {">"}
              </_components.span>
              {"Extra Large"}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"Match"}</_components.span>
                {">"}
              </_components.span>
              {"\n        "}
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"Match"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"when"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{matches.lg}"}</_components.span>
                {">"}
              </_components.span>
              {"Large"}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"Match"}</_components.span>
                {">"}
              </_components.span>
              {"\n        "}
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"Match"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"when"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{matches.sm}"}</_components.span>
                {">"}
              </_components.span>
              {"Small"}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"Match"}</_components.span>
                {">"}
              </_components.span>
              {
                "\n        {/* \n          Instead of fallback, you can also use `!matches.sm`\n          "
              }
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"Match"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"when"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{!matches.sm}"}</_components.span>
                {">"}
              </_components.span>
              {"Smallest"}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"Match"}</_components.span>
                {">"}
              </_components.span>
              {"\n         */}\n      "}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"Switch"}</_components.span>
                {">"}
              </_components.span>
              {"\n    "}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"div"}</_components.span>
                {">"}
              </_components.span>
            </_components.span>
            {"\n  );\n};\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.p>
          <_components.a href="https://codesandbox.io/s/solid-responsive-breakpoints-h4emy8?file=/src/index.tsx">
            {"Working Demo"}
          </_components.a>
        </_components.p>
        {"\n"}
        <_components.h2 id="createprefersdark">
          <_components.a className="header-anchor" href="#createprefersdark">
            {"#"}
          </_components.a>
          <_components.code>{"createPrefersDark"}</_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {
            "Provides a signal indicating if the user has requested dark color theme. The setting is being watched with a "
          }
          <_components.a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme">
            {"Media Query"}
          </_components.a>
          {"."}
        </_components.p>
        {"\n"}
        <_components.h3 id="how-to-use-it">
          <_components.a className="header-anchor" href="#how-to-use-it">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h3>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createPrefersDark } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/media"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" prefersDark = "}
            <_components.span className="hljs-title function_">
              {"createPrefersDark"}
            </_components.span>
            {"();\n"}
            <_components.span className="hljs-title function_">{"createEffect"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-title function_">{"prefersDark"}</_components.span>
            {"(); "}
            <_components.span className="hljs-comment">{"// => boolean"}</_components.span>
            {"\n});\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="server-fallback-1">
          <_components.a className="header-anchor" href="#server-fallback-1">
            {"#"}
          </_components.a>
          {"Server fallback"}
        </_components.h3>
        {"\n"}
        <_components.p>
          <_components.code>{"createPrefersDark"}</_components.code>
          {" accepts a "}
          <_components.code>{"serverFallback"}</_components.code>
          {" argument — value that should be returned on the server — defaults to "}
          <_components.code>{"false"}</_components.code>
          {"."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" prefersDark = "}
            <_components.span className="hljs-title function_">
              {"createPrefersDark"}
            </_components.span>
            {"("}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">
              {"// will return true on the server and during hydration on the client"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"prefersDark"}</_components.span>
            {"();\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="useprefersdark">
          <_components.a className="header-anchor" href="#useprefersdark">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="usePrefersDark"
            data-code-package-name="media"
          >
            {"usePrefersDark"}
          </_components.code>
        </_components.h3>
        {"\n"}
        <_components.p>
          {"This primitive provides a "}
          <_components.a href="https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot">
            {"shared root"}
          </_components.a>
          {" variant that will reuse the same signal and media query across the whole application."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { usePrefersDark } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/media"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" prefersDark = "}
            <_components.span className="hljs-title function_">{"usePrefersDark"}</_components.span>
            {"();\n"}
            <_components.span className="hljs-title function_">{"createEffect"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-title function_">{"prefersDark"}</_components.span>
            {"(); "}
            <_components.span className="hljs-comment">{"// => boolean"}</_components.span>
            {"\n});\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.blockquote>
          {"\n"}
          <_components.p>
            {"Note: "}
            <_components.code
              data-code-primitive-name="usePrefersDark"
              data-code-package-name="media"
            >
              {"usePrefersDark"}
            </_components.code>
            {" will deopt to "}
            <_components.code>{"createPrefersDark"}</_components.code>
            {" if used during hydration. (see issue "}
            <_components.a href="https://github.com/solidjs-community/solid-primitives/issues/310">
              {"#310"}
            </_components.a>
            {")"}
          </_components.p>
          {"\n"}
        </_components.blockquote>
        {"\n"}
        <_components.h2 id="changelog">
          <_components.a className="header-anchor" href="#changelog">
            {"#"}
          </_components.a>
          {"Changelog"}
        </_components.h2>
        {"\n"}
        <_components.p>
          {"See "}
          <_components.a href="https://github.com/solidjs-community/solid-primitives/blob/main/packages/media/CHANGELOG.md">
            {"CHANGELOG.md"}
          </_components.a>
        </_components.p>
        {"\n"}
        <_components.h2 id="contributors">
          <_components.a className="header-anchor" href="#contributors">
            {"#"}
          </_components.a>
          {"Contributors"}
        </_components.h2>
        {"\n"}
        <_components.p>
          {"Thanks to Aditya Agarwal for contributing createBreakpoints."}
        </_components.p>
      </NoHydration>
    </>
  );
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = Object.assign({}, _provideComponents(), props.components);
  return MDXLayout ? (
    <MDXLayout {...props}>
      <_createMdxContent {...props} />
    </MDXLayout>
  ) : (
    _createMdxContent(props)
  );
}

function _missingMdxReference(id, component) {
  throw new Error(
    "Expected " +
      (component ? "component" : "object") +
      " `" +
      id +
      "` to be defined: you likely forgot to import, pass, or provide it.",
  );
}

export default function Index() {
  return (
    <PrimitivePageMain
      packageName="@solid-primitives/media"
      name="media"
      stage={3}
      packageList={[{ name: "media", gzipped: "1.06 KB", minified: "2.21 KB" }]}
      primitiveList={[
        { name: "createMediaQuery", gzipped: "554 B", minified: "1.07 KB" },
        { name: "createBreakpoints", gzipped: "995 B", minified: "1.99 KB" },
        { name: "usePrefersDark", gzipped: "554 B", minified: "1.06 KB" },
        { name: "makeMediaQueryListener", gzipped: "598 B", minified: "1.2 KB" },
      ]}
    >
      <MDXContent />
    </PrimitivePageMain>
  );
}

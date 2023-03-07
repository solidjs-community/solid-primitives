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
      h3: "h3",
      pre: "pre",
      span: "span",
    },
    _provideComponents(),
    props.components,
  );
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return (
    <>
      <NoHydration>
        <_components.p>{"Collection of reactive primitives focused on styles."}</_components.p>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.a href="#createRemSize">
              <_components.code
                data-code-primitive-name="createRemSize"
                data-code-package-name="styles"
              >
                {"createRemSize"}
              </_components.code>
            </_components.a>
            {" - Create a reactive signal of css "}
            <_components.code>{"rem"}</_components.code>
            {" size in pixels."}
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
      <CopyPackages packageName="@solid-primitives/styles" />
      <NoHydration>
        {"\n"}
        <_components.h2 id="createremsize">
          <_components.a className="header-anchor" href="#createremsize">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="createRemSize"
            data-code-package-name="styles"
          >
            {"createRemSize"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {
            "Creates a reactive signal with value of the current rem size in pixels, and tracks it's changes."
          }
        </_components.p>
        {"\n"}
        <_components.h3 id="how-to-use-it">
          <_components.a className="header-anchor" href="#how-to-use-it">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h3>
        {"\n"}
        <_components.p>{"It takes no arguments and returns a number signal."}</_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createRemSize } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/styles"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" remSize = "}
            <_components.span className="hljs-title function_">{"createRemSize"}</_components.span>
            {"();\n"}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-title function_">{"remSize"}</_components.span>
            {"()); "}
            <_components.span className="hljs-comment">{"// 16"}</_components.span>
            {"\n\n"}
            <_components.span className="hljs-title function_">{"createEffect"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-title function_">{"remSize"}</_components.span>
            {"()); "}
            <_components.span className="hljs-comment">
              {"// remSize value will be logged on every change to the root font size"}
            </_components.span>
            {"\n});\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="useremsize">
          <_components.a className="header-anchor" href="#useremsize">
            {"#"}
          </_components.a>
          <_components.code>{"useRemSize"}</_components.code>
        </_components.h3>
        {"\n"}
        <_components.p>
          {"This primitive provides a "}
          <_components.a href="https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot">
            {"shared root"}
          </_components.a>
          {
            " variant that will reuse signals, HTML elements and the ResizeObserver instance across all dependents that use it."
          }
        </_components.p>
        {"\n"}
        <_components.p>
          {"It's behavior is the same as "}
          <_components.a href="#createRemSize">
            <_components.code
              data-code-primitive-name="createRemSize"
              data-code-package-name="styles"
            >
              {"createRemSize"}
            </_components.code>
          </_components.a>
          {"."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { useRemSize } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/styles"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" remSize = "}
            <_components.span className="hljs-title function_">{"useRemSize"}</_components.span>
            {"();\n"}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-title function_">{"remSize"}</_components.span>
            {"()); "}
            <_components.span className="hljs-comment">{"// 16"}</_components.span>
            {"\n"}
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
          {"When using this primitive on the server, it will return a signal with a value of "}
          <_components.code>{"16"}</_components.code>
          {" by default. You can override this value by calling the "}
          <_components.code>{"setServerRemSize"}</_components.code>
          {" helper with a new value, before calling "}
          <_components.code
            data-code-primitive-name="createRemSize"
            data-code-package-name="styles"
          >
            {"createRemSize"}
          </_components.code>
          {" or "}
          <_components.code>{"useRemSize"}</_components.code>
          {"."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { setServerRemSize, createRemSize } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/styles"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-title function_">
              {"setServerRemSize"}
            </_components.span>
            {"("}
            <_components.span className="hljs-number">{"10"}</_components.span>
            {");\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" remSize = "}
            <_components.span className="hljs-title function_">{"createRemSize"}</_components.span>
            {"();\n"}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-title function_">{"remSize"}</_components.span>
            {"()); "}
            <_components.span className="hljs-comment">
              {"// 10 instead of 16 (only on the server!)"}
            </_components.span>
            {"\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="demo">
          <_components.a className="header-anchor" href="#demo">
            {"#"}
          </_components.a>
          {"Demo"}
        </_components.h2>
        {"\n"}
        <_components.p>
          <_components.a href="https://solidjs-community.github.io/solid-primitives/styles/">
            {"Live Site"}
          </_components.a>
        </_components.p>
        {"\n"}
        <_components.p>{"TODO"}</_components.p>
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
          <_components.a href="https://github.com/solidjs-community/solid-primitives/blob/main/packages/styles/CHANGELOG.md">
            {"CHANGELOG.md"}
          </_components.a>
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
      packageName="@solid-primitives/styles"
      name="styles"
      stage={0}
      packageList={[{ name: "styles", gzipped: "664 B", minified: "1.21 KB" }]}
      primitiveList={[{ name: "createRemSize", gzipped: "642 B", minified: "1.16 KB" }]}
    >
      <MDXContent />
    </PrimitivePageMain>
  );
}

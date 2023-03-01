
// Do not modify
// Generated from "./scripts/update-site/build-pages"

import PrimitivePageMain from "~/components/Primitives/PrimitivePageMain";
import CopyPackages from "~/components/CopyPackage/CopyPackages";
import { NoHydration } from "solid-js/web";

/*@jsxRuntime automatic @jsxImportSource solid-js*/
import {useMDXComponents as _provideComponents} from "solid-mdx";
function _createMdxContent(props) {
  const _components = Object.assign({
    ul: "ul",
    li: "li",
    a: "a",
    code: "code",
    h2: "h2",
    p: "p",
    h3: "h3",
    pre: "pre",
    span: "span"
  }, _provideComponents(), props.components);
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return <><NoHydration><_components.ul>{"\n"}<_components.li><_components.a href="#createPageVisibility"><_components.code>{"createPageVisibility"}</_components.code></_components.a>{" - Creates a signal with a boolean value identifying the page visibility state"}</_components.li>{"\n"}<_components.li><_components.a href="#usePageVisibility"><_components.code>{"usePageVisibility"}</_components.code></_components.a>{" - A "}<_components.a href="https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot">{"shared-root"}</_components.a>{" alternative."}</_components.li>{"\n"}</_components.ul>{"\n"}<_components.h2 id="installation"><_components.a className="header-anchor" href="#installation">{"#"}</_components.a>{"Installation"}</_components.h2>{"\n"}</NoHydration><CopyPackages packageName="@solid-primitives/page-visibility" /><NoHydration>{"\n"}<_components.h2 id="createpagevisibility"><_components.a className="header-anchor" href="#createpagevisibility">{"#"}</_components.a><_components.code>{"createPageVisibility"}</_components.code></_components.h2>{"\n"}<_components.p>{"Creates a signal with a boolean value identifying the page visibility state."}</_components.p>{"\n"}<_components.h3 id="how-to-use-it"><_components.a className="header-anchor" href="#how-to-use-it">{"#"}</_components.a>{"How to use it"}</_components.h3>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"import"}</_components.span>{" { createPageVisibility } "}<_components.span className="hljs-keyword">{"from"}</_components.span>{" "}<_components.span className="hljs-string">{"\"@solid-primitives/page-visibility\""}</_components.span>{";\n\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" visible = "}<_components.span className="hljs-title function_">{"createPageVisibility"}</_components.span>{"();\n\n"}<_components.span className="hljs-title function_">{"createEffect"}</_components.span>{"("}<_components.span className="hljs-function">{"() =>"}</_components.span>{" {\n  "}<_components.span className="hljs-title function_">{"visible"}</_components.span>{"(); "}<_components.span className="hljs-comment">{"// => boolean"}</_components.span>{"\n});\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="usepagevisibility"><_components.a className="header-anchor" href="#usepagevisibility">{"#"}</_components.a><_components.code>{"usePageVisibility"}</_components.code></_components.h2>{"\n"}<_components.p><_components.code>{"usePageVisibility"}</_components.code>{" is a "}<_components.a href="https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot">{"shared root"}</_components.a>{" primitive. It is providing the same signal as "}<_components.code>{"createPageVisibility"}</_components.code>{", but the event-listener and the signal are shared between dependents, making it more optimized to use in multiple places at once."}</_components.p>{"\n"}<_components.h3 id="how-to-use-it-1"><_components.a className="header-anchor" href="#how-to-use-it-1">{"#"}</_components.a>{"How to use it"}</_components.h3>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"import"}</_components.span>{" { usePageVisibility } "}<_components.span className="hljs-keyword">{"from"}</_components.span>{" "}<_components.span className="hljs-string">{"\"@solid-primitives/page-visibility\""}</_components.span>{";\n\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" visible = "}<_components.span className="hljs-title function_">{"usePageVisibility"}</_components.span>{"();\n\n"}<_components.span className="hljs-title function_">{"createEffect"}</_components.span>{"("}<_components.span className="hljs-function">{"() =>"}</_components.span>{" {\n  "}<_components.span className="hljs-title function_">{"visible"}</_components.span>{"(); "}<_components.span className="hljs-comment">{"// => boolean"}</_components.span>{"\n});\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="changelog"><_components.a className="header-anchor" href="#changelog">{"#"}</_components.a>{"Changelog"}</_components.h2>{"\n"}<_components.p>{"See "}<_components.a href="./CHANGELOG.md">{"CHANGELOG.md"}</_components.a></_components.p></NoHydration></>;
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = Object.assign({}, _provideComponents(), props.components);
  return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
}

function _missingMdxReference(id, component) {
  throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}


export default function Index () {
  return (
    <PrimitivePageMain packageName="@solid-primitives/page-visibility" name="page-visibility" stage={3} packageList={[{"name":"page-visibility","gzipped":"555 B","minified":"1.03 KB"}]} primitiveList={[{"name":"createPageVisibility","gzipped":"549 B","minified":"1.01 KB"}]}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}

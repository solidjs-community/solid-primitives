
// Do not modify
// Generated from "./scripts/update-site/build-pages"

import PrimitivePageMain from "~/components/Primitives/PrimitivePageMain";
import CopyPackages from "~/components/CopyPackage/CopyPackages";
import { NoHydration } from "solid-js/web";

/*@jsxRuntime automatic @jsxImportSource solid-js*/
import {useMDXComponents as _provideComponents} from "solid-mdx";
function _createMdxContent(props) {
  const _components = Object.assign({
    p: "p",
    ul: "ul",
    li: "li",
    a: "a",
    code: "code",
    h2: "h2",
    pre: "pre",
    span: "span"
  }, _provideComponents(), props.components);
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return <><NoHydration><_components.p>{"Two simple primitives for setting cursor css property reactively."}</_components.p>{"\n"}<_components.ul>{"\n"}<_components.li><_components.a href="#createElementCursor"><_components.code>{"createElementCursor"}</_components.code></_components.a>{" - Set provided cursor to given HTML Element styles reactively."}</_components.li>{"\n"}<_components.li><_components.a href="#createBodyCursor"><_components.code>{"createBodyCursor"}</_components.code></_components.a>{" - Set selected cursor to body element styles reactively."}</_components.li>{"\n"}</_components.ul>{"\n"}<_components.h2 id="installation"><_components.a className="header-anchor" href="#installation">{"#"}</_components.a>{"Installation"}</_components.h2>{"\n"}</NoHydration><CopyPackages packageName="@solid-primitives/cursor" /><NoHydration>{"\n"}<_components.h2 id="createelementcursor"><_components.a className="header-anchor" href="#createelementcursor">{"#"}</_components.a><_components.code>{"createElementCursor"}</_components.code></_components.h2>{"\n"}<_components.p>{"Set provided cursor to given HTML Element styles reactively."}</_components.p>{"\n"}<_components.p>{"It takes two arguments:"}</_components.p>{"\n"}<_components.ul>{"\n"}<_components.li><_components.code>{"element"}</_components.code>{" - HTMLElement or a reactive signal returning one. Returning falsy value will unset the cursor."}</_components.li>{"\n"}<_components.li><_components.code>{"cursor"}</_components.code>{" - Cursor css property. E.g. \"pointer\", \"grab\", \"zoom-in\", \"wait\", etc."}</_components.li>{"\n"}</_components.ul>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"import"}</_components.span>{" { createElementCursor } "}<_components.span className="hljs-keyword">{"from"}</_components.span>{" "}<_components.span className="hljs-string">{"\"@solid-primitives/cursor\""}</_components.span>{";\n\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" target = "}<_components.span className="hljs-variable language_">{"document"}</_components.span>{"."}<_components.span className="hljs-title function_">{"querySelector"}</_components.span>{"("}<_components.span className="hljs-string">{"\"#element\""}</_components.span>{");\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" [cursor, setCursor] = "}<_components.span className="hljs-title function_">{"createSignal"}</_components.span>{"("}<_components.span className="hljs-string">{"\"pointer\""}</_components.span>{");\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" [enabled, setEnabled] = "}<_components.span className="hljs-title function_">{"createSignal"}</_components.span>{"("}<_components.span className="hljs-literal">{"true"}</_components.span>{");\n\n"}<_components.span className="hljs-title function_">{"createElementCursor"}</_components.span>{"("}<_components.span className="hljs-function">{"() =>"}</_components.span>{" "}<_components.span className="hljs-title function_">{"enabled"}</_components.span>{"() && target, cursor);\n\n"}<_components.span className="hljs-title function_">{"setCursor"}</_components.span>{"("}<_components.span className="hljs-string">{"\"help\""}</_components.span>{");\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="createbodycursor"><_components.a className="header-anchor" href="#createbodycursor">{"#"}</_components.a><_components.code>{"createBodyCursor"}</_components.code></_components.h2>{"\n"}<_components.p>{"Set selected cursor to body element styles reactively."}</_components.p>{"\n"}<_components.p>{"It takes only one argument:"}</_components.p>{"\n"}<_components.ul>{"\n"}<_components.li><_components.code>{"cursor"}</_components.code>{" - Signal returing a cursor css property. E.g. \"pointer\", \"grab\", \"zoom-in\", \"wait\", etc. Returning falsy value will unset the cursor."}</_components.li>{"\n"}</_components.ul>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"import"}</_components.span>{" { createBodyCursor } "}<_components.span className="hljs-keyword">{"from"}</_components.span>{" "}<_components.span className="hljs-string">{"\"@solid-primitives/cursor\""}</_components.span>{";\n\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" [cursor, setCursor] = "}<_components.span className="hljs-title function_">{"createSignal"}</_components.span>{"("}<_components.span className="hljs-string">{"\"pointer\""}</_components.span>{");\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" [enabled, setEnabled] = "}<_components.span className="hljs-title function_">{"createSignal"}</_components.span>{"("}<_components.span className="hljs-literal">{"true"}</_components.span>{");\n\n"}<_components.span className="hljs-title function_">{"createBodyCursor"}</_components.span>{"("}<_components.span className="hljs-function">{"() =>"}</_components.span>{" "}<_components.span className="hljs-title function_">{"enabled"}</_components.span>{"() && "}<_components.span className="hljs-title function_">{"cursor"}</_components.span>{"());\n\n"}<_components.span className="hljs-title function_">{"setCursor"}</_components.span>{"("}<_components.span className="hljs-string">{"\"help\""}</_components.span>{");\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="changelog"><_components.a className="header-anchor" href="#changelog">{"#"}</_components.a>{"Changelog"}</_components.h2>{"\n"}<_components.p>{"See "}<_components.a href="https://github.com/solidjs-community/solid-primitives/blob/main/packages/cursor/CHANGELOG.md">{"CHANGELOG.md"}</_components.a></_components.p></NoHydration></>;
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
    <PrimitivePageMain packageName="@solid-primitives/cursor" name="cursor" stage={0} packageList={[{"name":"cursor","gzipped":"339 B","minified":"681 B"}]} primitiveList={[{"name":"createBodyCursor","gzipped":"176 B","minified":"274 B"},{"name":"createElementCursor","gzipped":"287 B","minified":"471 B"}]}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}

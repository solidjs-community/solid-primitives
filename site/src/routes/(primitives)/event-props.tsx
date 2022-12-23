
// Do not modify
// Generated from "./scripts/update-site/build-pages"

import PrimitivePageMain from "~/components/Primitives/PrimitivePageMain";
import CopyPackages from "~/components/CopyPackage/CopyPackages";

/*@jsxRuntime automatic @jsxImportSource solid-js*/
import {useMDXComponents as _provideComponents} from "solid-mdx";
function _createMdxContent(props) {
  const _components = Object.assign({
    p: "p",
    h2: "h2",
    a: "a",
    h3: "h3",
    pre: "pre",
    code: "code",
    span: "span"
  }, _provideComponents(), props.components);
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return <><_components.p>{"A helpful primitive that creates the event props and a reactive store with the latest events"}</_components.p>{"\n"}<_components.h2 id="installation"><_components.a className="header-anchor" href="#installation">{"#"}</_components.a>{"Installation"}</_components.h2>{"\n"}<CopyPackages packageName="@solid-primitives/event-props" />{"\n"}<_components.h2 id="how-to-use-it"><_components.a className="header-anchor" href="#how-to-use-it">{"#"}</_components.a>{"How to use it"}</_components.h2>{"\n"}<_components.h3 id="createeventprops"><_components.a className="header-anchor" href="#createeventprops">{"#"}</_components.a>{"createEventProps"}</_components.h3>{"\n"}<_components.p>{"Receive the event props and a props with the latest events:"}</_components.p>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"const"}</_components.span>{" [events, eventProps] = "}<_components.span className="hljs-title function_">{"createEventProps"}</_components.span>{"("}<_components.span className="hljs-string">{"'mousedown'"}</_components.span>{", "}<_components.span className="hljs-string">{"'mousemove'"}</_components.span>{", "}<_components.span className="hljs-string">{"'mouseup'"}</_components.span>{");\n\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" isMouseDown = "}<_components.span className="hljs-title function_">{"createMemo"}</_components.span>{"("}<_components.span className="hljs-function">{"() =>"}</_components.span>{" (events."}<_components.span className="hljs-property">{"mousedown"}</_components.span>{"?."}<_components.span className="hljs-property">{"ts"}</_components.span>{" ?? "}<_components.span className="hljs-number">{"0"}</_components.span>{") > (events."}<_components.span className="hljs-property">{"mouseup"}</_components.span>{"?."}<_components.span className="hljs-property">{"ts"}</_components.span>{" ?? "}<_components.span className="hljs-number">{"1"}</_components.span>{"));\n\n"}<_components.span className="hljs-title function_">{"createEffect"}</_components.span>{"("}<_components.span className="hljs-function">{"() =>"}</_components.span>{" {\n  "}<_components.span className="hljs-keyword">{"if"}</_components.span>{" ("}<_components.span className="hljs-title function_">{"isMouseDown"}</_components.span>{"()) {\n    "}<_components.span className="hljs-variable language_">{"console"}</_components.span>{"."}<_components.span className="hljs-title function_">{"log"}</_components.span>{"(events."}<_components.span className="hljs-property">{"mousemove"}</_components.span>{"?."}<_components.span className="hljs-property">{"clientX"}</_components.span>{", events."}<_components.span className="hljs-property">{"mousemove"}</_components.span>{"?."}<_components.span className="hljs-property">{"clientY"}</_components.span>{");\n  }\n})\n\n<div {...eventProps}>"}<_components.span className="hljs-title class_">{"Click"}</_components.span>{" and drag on me</div>\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="demo"><_components.a className="header-anchor" href="#demo">{"#"}</_components.a>{"Demo"}</_components.h2>{"\n"}<_components.p><_components.a href="https://solidjs-community.github.io/solid-primitives/event-props/">{"Live Site"}</_components.a></_components.p>{"\n"}<_components.p>{"TODO"}</_components.p>{"\n"}<_components.h2 id="changelog"><_components.a className="header-anchor" href="#changelog">{"#"}</_components.a>{"Changelog"}</_components.h2>{"\n"}<_components.p>{"See "}<_components.a href="./CHANGELOG.md">{"CHANGELOG.md"}</_components.a></_components.p></>;
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
    <PrimitivePageMain packageName="@solid-primitives/event-props" name="event-props" stage={2}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}

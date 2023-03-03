
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
    code: "code",
    h2: "h2",
    a: "a",
    h3: "h3",
    pre: "pre",
    span: "span"
  }, _provideComponents(), props.components);
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return <><NoHydration><_components.p>{"Primitives for autofocusing HTML elements."}</_components.p>{"\n"}<_components.p>{"The native autofocus attribute only works on page load, which makes it incompatible with SolidJS. These primitives run on render, allowing autofocus on initial render as well as dynamically added components."}</_components.p>{"\n"}<_components.ul>{"\n"}<_components.li><_components.code>{"autofocus"}</_components.code>{" - Directive to autofocus an element on render."}</_components.li>{"\n"}<_components.li><_components.code>{"createAutofocus"}</_components.code>{" - Reactive primitive to autofocus an element on render."}</_components.li>{"\n"}</_components.ul>{"\n"}<_components.h2 id="installation"><_components.a className="header-anchor" href="#installation">{"#"}</_components.a>{"Installation"}</_components.h2>{"\n"}</NoHydration><CopyPackages packageName="@solid-primitives/autofocus" /><NoHydration>{"\n"}<_components.h2 id="how-to-use-it"><_components.a className="header-anchor" href="#how-to-use-it">{"#"}</_components.a>{"How to use it"}</_components.h2>{"\n"}<_components.h3 id="useautofocus"><_components.a className="header-anchor" href="#useautofocus">{"#"}</_components.a>{"use:autofocus"}</_components.h3>{"\n"}<_components.pre><_components.code className="hljs language-tsx"><_components.span className="hljs-keyword">{"import"}</_components.span>{" { autofocus } "}<_components.span className="hljs-keyword">{"from"}</_components.span>{" "}<_components.span className="hljs-string">{"\"@solid-primitives/autofocus\""}</_components.span>{";\n\n"}<_components.span className="xml"><_components.span className="hljs-tag">{"<"}<_components.span className="hljs-name">{"button"}</_components.span>{" "}<_components.span className="hljs-attr">{"use:autofocus"}</_components.span>{" "}<_components.span className="hljs-attr">{"autofocus"}</_components.span>{">"}</_components.span>{"\n  Autofocused\n"}<_components.span className="hljs-tag">{"</"}<_components.span className="hljs-name">{"button"}</_components.span>{">"}</_components.span></_components.span>{";\n\n"}<_components.span className="hljs-comment">{"// Autofocus directive can be disabled if `false` is passed as option"}</_components.span>{"\n"}<_components.span className="xml"><_components.span className="hljs-tag">{"<"}<_components.span className="hljs-name">{"button"}</_components.span>{" "}<_components.span className="hljs-attr">{"use:autofocus"}</_components.span>{"="}<_components.span className="hljs-string">{"{false}"}</_components.span>{" "}<_components.span className="hljs-attr">{"autofocus"}</_components.span>{">"}</_components.span>{"\n  Not Autofocused\n"}<_components.span className="hljs-tag">{"</"}<_components.span className="hljs-name">{"button"}</_components.span>{">"}</_components.span></_components.span>{";\n"}</_components.code></_components.pre>{"\n"}<_components.p>{"The "}<_components.code>{"autofocus"}</_components.code>{" directive uses the native "}<_components.code>{"autofocus"}</_components.code>{" attribute to determine it should focus the element or not.\nUsing this directive without "}<_components.code>{"autofocus={true}"}</_components.code>{" (or the shorthand "}<_components.code>{"autofocus"}</_components.code>{") will not perform anything."}</_components.p>{"\n"}<_components.h3 id="createautofocus"><_components.a className="header-anchor" href="#createautofocus">{"#"}</_components.a>{"createAutofocus"}</_components.h3>{"\n"}<_components.pre><_components.code className="hljs language-tsx"><_components.span className="hljs-keyword">{"import"}</_components.span>{" { createAutofocus } "}<_components.span className="hljs-keyword">{"from"}</_components.span>{" "}<_components.span className="hljs-string">{"\"@solid-primitives/autofocus\""}</_components.span>{";\n\n"}<_components.span className="hljs-comment">{"// Using ref"}</_components.span>{"\n"}<_components.span className="hljs-keyword">{"let"}</_components.span>{" ref!: "}<_components.span className="hljs-title class_">{"HTMLButtonElement"}</_components.span>{";\n"}<_components.span className="hljs-title function_">{"createAutofocus"}</_components.span>{"("}<_components.span className="hljs-function">{"() =>"}</_components.span>{" ref);\n\n"}<_components.span className="xml"><_components.span className="hljs-tag">{"<"}<_components.span className="hljs-name">{"button"}</_components.span>{" "}<_components.span className="hljs-attr">{"ref"}</_components.span>{"="}<_components.span className="hljs-string">{"{ref}"}</_components.span>{">"}</_components.span>{"Autofocused"}<_components.span className="hljs-tag">{"</"}<_components.span className="hljs-name">{"button"}</_components.span>{">"}</_components.span></_components.span>{";\n\n"}<_components.span className="hljs-comment">{"// Using ref signal"}</_components.span>{"\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" [ref, setRef] = createSignal<"}<_components.span className="hljs-title class_">{"HTMLButtonElement"}</_components.span>{">();\n"}<_components.span className="hljs-title function_">{"createAutofocus"}</_components.span>{"(ref);\n\n"}<_components.span className="xml"><_components.span className="hljs-tag">{"<"}<_components.span className="hljs-name">{"button"}</_components.span>{" "}<_components.span className="hljs-attr">{"ref"}</_components.span>{"="}<_components.span className="hljs-string">{"{setRef}"}</_components.span>{">"}</_components.span>{"Autofocused"}<_components.span className="hljs-tag">{"</"}<_components.span className="hljs-name">{"button"}</_components.span>{">"}</_components.span></_components.span>{";\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="changelog"><_components.a className="header-anchor" href="#changelog">{"#"}</_components.a>{"Changelog"}</_components.h2>{"\n"}<_components.p>{"See "}<_components.a href="https://github.com/solidjs-community/solid-primitives/blob/main/packages/autofocus/CHANGELOG.md">{"CHANGELOG.md"}</_components.a></_components.p></NoHydration></>;
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
    <PrimitivePageMain packageName="@solid-primitives/autofocus" name="autofocus" stage={0} packageList={[{"name":"autofocus","gzipped":"173 B","minified":"239 B"}]} primitiveList={[{"name":"createAutofocus","gzipped":"138 B","minified":"142 B"},{"name":"autofocus","gzipped":"146 B","minified":"163 B"}]}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}


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
    h2: "h2",
    a: "a",
    h3: "h3",
    pre: "pre",
    code: "code",
    span: "span"
  }, _provideComponents(), props.components);
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return <><NoHydration><_components.p>{"Creates a primitive wrapper around the Fullscreen API that can either be used as a directive or a primitive."}</_components.p>{"\n"}<_components.h2 id="installation"><_components.a className="header-anchor" href="#installation">{"#"}</_components.a>{"Installation"}</_components.h2>{"\n"}</NoHydration><CopyPackages packageName="@solid-primitives/fullscreen" /><NoHydration>{"\n"}<_components.h2 id="how-to-use-it"><_components.a className="header-anchor" href="#how-to-use-it">{"#"}</_components.a>{"How to use it"}</_components.h2>{"\n"}<_components.h3 id="createfullscreen"><_components.a className="header-anchor" href="#createfullscreen">{"#"}</_components.a>{"createFullScreen"}</_components.h3>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"const"}</_components.span>{" "}<_components.span className="hljs-title class_">{"MyComponent2"}</_components.span>{": "}<_components.span className="hljs-title class_">{"Component"}</_components.span>{" = "}<_components.span className="hljs-function">{"() =>"}</_components.span>{" {\n  "}<_components.span className="hljs-keyword">{"const"}</_components.span>{" [fs, setFs] = "}<_components.span className="hljs-title function_">{"createSignal"}</_components.span>{"("}<_components.span className="hljs-literal">{"false"}</_components.span>{");\n  "}<_components.span className="hljs-keyword">{"let"}</_components.span>{" ref!: "}<_components.span className="hljs-title class_">{"HTMLDivElement"}</_components.span>{";\n  "}<_components.span className="hljs-keyword">{"const"}</_components.span>{" "}<_components.span className="hljs-attr">{"active"}</_components.span>{": "}<_components.span className="hljs-title class_">{"Accessor"}</_components.span>{"<"}<_components.span className="hljs-built_in">{"boolean"}</_components.span>{"> = "}<_components.span className="hljs-title function_">{"createFullscreen"}</_components.span>{"(ref, fs);\n  "}<_components.span className="hljs-keyword">{"return"}</_components.span>{" (\n    "}<_components.span className="xml"><_components.span className="hljs-tag">{"<"}<_components.span className="hljs-name">{"div"}</_components.span>{" "}<_components.span className="hljs-attr">{"ref"}</_components.span>{"="}<_components.span className="hljs-string">{"{ref}"}</_components.span>{" "}<_components.span className="hljs-attr">{"onClick"}</_components.span>{"="}<_components.span className="hljs-string">{"{()"}</_components.span>{" =>"}</_components.span>{" setFs(fs => !fs)}>\n      {!active() ? \"click to fullscreen\" : \"click to exit fullscreen\"}\n    "}<_components.span className="hljs-tag">{"</"}<_components.span className="hljs-name">{"div"}</_components.span>{">"}</_components.span></_components.span>{"\n  );\n};\n"}</_components.code></_components.pre>{"\n"}<_components.p>{"You can either put the options into the second argument accessor output (useful for the directive use case) or as a third argument."}</_components.p>{"\n"}<_components.h3 id="directive"><_components.a className="header-anchor" href="#directive">{"#"}</_components.a>{"Directive"}</_components.h3>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"const"}</_components.span>{" "}<_components.span className="hljs-attr">{"isActive"}</_components.span>{": "}<_components.span className="hljs-title class_">{"Accessor"}</_components.span>{"<"}<_components.span className="hljs-built_in">{"boolean"}</_components.span>{"> = "}<_components.span className="hljs-title function_">{"createFullscreen"}</_components.span>{"(\n  "}<_components.span className="hljs-attr">{"ref"}</_components.span>{": "}<_components.span className="hljs-title class_">{"HTMLElement"}</_components.span>{" | "}<_components.span className="hljs-literal">{"undefined"}</_components.span>{",\n  active?: "}<_components.span className="hljs-title class_">{"Accessor"}</_components.span>{"<"}<_components.span className="hljs-title class_">{"FullscreenOptions"}</_components.span>{" | "}<_components.span className="hljs-built_in">{"boolean"}</_components.span>{">,\n  options?: "}<_components.span className="hljs-title class_">{"FullscreenOptions"}</_components.span>{"\n);\n\n"}<_components.span className="hljs-comment">{"// can be used as a directive"}</_components.span>{"\n\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" "}<_components.span className="hljs-title class_">{"MyComponent"}</_components.span>{": "}<_components.span className="hljs-title class_">{"Component"}</_components.span>{" = "}<_components.span className="hljs-function">{"() =>"}</_components.span>{" {\n  "}<_components.span className="hljs-keyword">{"const"}</_components.span>{" [fs, setFs] = "}<_components.span className="hljs-title function_">{"createSignal"}</_components.span>{"("}<_components.span className="hljs-literal">{"false"}</_components.span>{");\n  "}<_components.span className="hljs-keyword">{"return"}</_components.span>{" ("}<_components.span className="xml"><_components.span className="hljs-tag">{"<"}<_components.span className="hljs-name">{"div"}</_components.span>{" "}<_components.span className="hljs-attr">{"use:createFullScreen"}</_components.span>{"="}<_components.span className="hljs-string">{"{fs}"}</_components.span>{" "}<_components.span className="hljs-attr">{"onClick"}</_components.span>{"="}<_components.span className="hljs-string">{"{()"}</_components.span>{" =>"}</_components.span>{" setFs(fs => !fs)}>\n    {!fs() ? 'click to fullscreen' : 'click to exit fullscreen'}\n  "}<_components.span className="hljs-tag">{"</"}<_components.span className="hljs-name">{"div"}</_components.span>{">"}</_components.span></_components.span>{");\n}\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="demo"><_components.a className="header-anchor" href="#demo">{"#"}</_components.a>{"Demo"}</_components.h2>{"\n"}<_components.p><_components.a href="https://solidjs-community.github.io/solid-primitives/fullscreen/">{"Live Site"}</_components.a></_components.p>{"\n"}<_components.p>{"TODO"}</_components.p>{"\n"}<_components.h2 id="changelog"><_components.a className="header-anchor" href="#changelog">{"#"}</_components.a>{"Changelog"}</_components.h2>{"\n"}<_components.p>{"See "}<_components.a href="./CHANGELOG.md">{"CHANGELOG.md"}</_components.a></_components.p></NoHydration></>;
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
    <PrimitivePageMain packageName="@solid-primitives/fullscreen" name="fullscreen" stage={3} packageList={[{"name":"fullscreen","gzipped":"337 B","minified":"565 B"}]} primitiveList={[{"name":"createFullscreen","gzipped":"338 B","minified":"565 B"}]}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}

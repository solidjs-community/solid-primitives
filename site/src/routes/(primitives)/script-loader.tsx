
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
    code: "code",
    pre: "pre",
    span: "span"
  }, _provideComponents(), props.components);
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return <><_components.p>{"Creates a primitive to load scripts dynamically, either for external services or jsonp requests"}</_components.p>{"\n"}<_components.h2 id="installation"><_components.a className="header-anchor" href="#installation">{"#"}</_components.a>{"Installation"}</_components.h2>{"\n"}<CopyPackages packageName="@solid-primitives/script-loader" />{"\n"}<_components.h2 id="how-to-use-it"><_components.a className="header-anchor" href="#how-to-use-it">{"#"}</_components.a>{"How to use it"}</_components.h2>{"\n"}<_components.p>{"createScriptLoader expects a props object with a "}<_components.code>{"src"}</_components.code>{" property. All the other props will be spread to the script element."}</_components.p>{"\n"}<_components.p>{"The "}<_components.code>{"src"}</_components.code>{" prop is required and will be used to set the "}<_components.code>{"src"}</_components.code>{" or "}<_components.code>{"textContent"}</_components.code>{" attribute. It can be a string or an accessor."}</_components.p>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"import"}</_components.span>{" { createScriptLoader } "}<_components.span className="hljs-keyword">{"from"}</_components.span>{" "}<_components.span className="hljs-string">{"\"@solid-primitives/script-loader\""}</_components.span>{";\n\n"}<_components.span className="hljs-comment">{"// For example, to use recaptcha:"}</_components.span>{"\n"}<_components.span className="hljs-title function_">{"createScriptLoader"}</_components.span>{"({\n  "}<_components.span className="hljs-attr">{"src"}</_components.span>{": "}<_components.span className="hljs-string">{"\"https://www.google.com/recaptcha/enterprise.js?render=my_token\""}</_components.span>{",\n  "}<_components.span className="hljs-keyword">{"async"}</_components.span>{" "}<_components.span className="hljs-title function_">{"onLoad"}</_components.span>{"("}<_components.span className="hljs-params" />{") {\n    "}<_components.span className="hljs-keyword">{"await"}</_components.span>{" grecaptcha."}<_components.span className="hljs-property">{"enterprise"}</_components.span>{"."}<_components.span className="hljs-title function_">{"ready"}</_components.span>{"();\n    "}<_components.span className="hljs-keyword">{"const"}</_components.span>{" token = "}<_components.span className="hljs-keyword">{"await"}</_components.span>{" grecaptcha."}<_components.span className="hljs-property">{"enterprise"}</_components.span>{"."}<_components.span className="hljs-title function_">{"execute"}</_components.span>{"("}<_components.span className="hljs-string">{"\"my_token\""}</_components.span>{", { "}<_components.span className="hljs-attr">{"action"}</_components.span>{": "}<_components.span className="hljs-string">{"\"login\""}</_components.span>{" });\n    "}<_components.span className="hljs-comment">{"// do your stuff..."}</_components.span>{"\n  }\n});\n\n"}<_components.span className="hljs-comment">{"// or pinterest embeds:"}</_components.span>{"\n"}<_components.span className="hljs-title function_">{"createScriptLoader"}</_components.span>{"({\n  "}<_components.span className="hljs-attr">{"src"}</_components.span>{": "}<_components.span className="hljs-string">{"'!function(a,b,c){var d,e,f;d=\"PIN_\"+~~((new Date).getTime()/864e5),...'"}</_components.span>{",\n  "}<_components.span className="hljs-title function_">{"onLoad"}</_components.span>{"("}<_components.span className="hljs-params" />{") {\n    "}<_components.span className="hljs-variable language_">{"window"}</_components.span>{"?."}<_components.span className="hljs-property">{"PinUtils"}</_components.span>{"?."}<_components.span className="hljs-title function_">{"build"}</_components.span>{"();\n  }\n});\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="definition"><_components.a className="header-anchor" href="#definition">{"#"}</_components.a>{"Definition"}</_components.h2>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"function"}</_components.span>{" "}<_components.span className="hljs-title function_">{"createScriptLoader"}</_components.span>{"("}<_components.span className="hljs-params">{"props: ScriptProps"}</_components.span>{"): "}<_components.span className="hljs-title class_">{"HTMLScriptElement"}</_components.span>{" | "}<_components.span className="hljs-literal">{"undefined"}</_components.span>{"; "}<_components.span className="hljs-comment">{"// script element with be undefined only on the server"}</_components.span>{"\n\n"}<_components.span className="hljs-keyword">{"type"}</_components.span>{" "}<_components.span className="hljs-title class_">{"ScriptProps"}</_components.span>{" = "}<_components.span className="hljs-title class_">{"Omit"}</_components.span>{"<"}<_components.span className="hljs-title class_">{"ComponentProps"}</_components.span>{"<"}<_components.span className="hljs-string">{"\"script\""}</_components.span>{">, "}<_components.span className="hljs-string">{"\"src\""}</_components.span>{" | "}<_components.span className="hljs-string">{"\"textContent\""}</_components.span>{"> & {\n  "}<_components.span className="hljs-comment">{"/** URL or source of the script to load. */"}</_components.span>{"\n  "}<_components.span className="hljs-attr">{"src"}</_components.span>{": "}<_components.span className="hljs-built_in">{"string"}</_components.span>{" | "}<_components.span className="hljs-title class_">{"Accessor"}</_components.span>{"<"}<_components.span className="hljs-built_in">{"string"}</_components.span>{">;\n};\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="demo"><_components.a className="header-anchor" href="#demo">{"#"}</_components.a>{"Demo"}</_components.h2>{"\n"}<_components.p><_components.a href="https://solidjs-community.github.io/solid-primitives/script-loader/">{"Live Site"}</_components.a></_components.p>{"\n"}<_components.p>{"TODO"}</_components.p>{"\n"}<_components.h2 id="changelog"><_components.a className="header-anchor" href="#changelog">{"#"}</_components.a>{"Changelog"}</_components.h2>{"\n"}<_components.p>{"See "}<_components.a href="./CHANGELOG.md">{"CHANGELOG.md"}</_components.a></_components.p></>;
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
    <PrimitivePageMain packageName="@solid-primitives/script-loader" name="script-loader" stage={3}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}

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
      h4: "h4",
      em: "em",
    },
    _provideComponents(),
    props.components,
  );
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return (
    <>
      <NoHydration>
        <_components.p>{"Reactive primitives to react to element/window scrolling."}</_components.p>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.a href="#createScrollPosition">
              <_components.code
                data-code-primitive-name="createScrollPosition"
                data-code-package-name="scroll"
              >
                {"createScrollPosition"}
              </_components.code>
            </_components.a>
            {
              " - Reactive primitive providing a store-like object with current scroll position of specified target."
            }
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#useWindowScrollPosition">
              <_components.code
                data-code-primitive-name="useWindowScrollPosition"
                data-code-package-name="scroll"
              >
                {"useWindowScrollPosition"}
              </_components.code>
            </_components.a>
            {" - Returns a reactive object with current window scroll position."}
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
      <CopyPackages packageName="@solid-primitives/scroll" />
      <NoHydration>
        {"\n"}
        <_components.h2 id="createscrollposition">
          <_components.a className="header-anchor" href="#createscrollposition">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="createScrollPosition"
            data-code-package-name="scroll"
          >
            {"createScrollPosition"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {
            "Reactive primitive providing a store-like object with current scroll position of specified target."
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
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createScrollPosition } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/scroll"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-comment">
              {"// target will be window by default"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" windowScroll = "}
            <_components.span className="hljs-title function_">
              {"createScrollPosition"}
            </_components.span>
            {"();\n\n"}
            <_components.span className="hljs-title function_">{"createEffect"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-comment">
              {"// returned object is a reactive store-like structure"}
            </_components.span>
            {"\n  windowScroll."}
            <_components.span className="hljs-property">{"x"}</_components.span>
            {"; "}
            <_components.span className="hljs-comment">{"// => number"}</_components.span>
            {"\n  windowScroll."}
            <_components.span className="hljs-property">{"y"}</_components.span>
            {"; "}
            <_components.span className="hljs-comment">{"// => number"}</_components.span>
            {"\n});\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="with-element-refs">
          <_components.a className="header-anchor" href="#with-element-refs">
            {"#"}
          </_components.a>
          {"With element refs"}
        </_components.h4>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"let"}</_components.span>{" "}
            <_components.span className="hljs-attr">{"ref"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"HTMLDivElement"}</_components.span>
            {" | "}
            <_components.span className="hljs-literal">{"undefined"}</_components.span>
            {";\n\n"}
            <_components.span className="hljs-comment">{"// pass as function"}</_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" scroll = "}
            <_components.span className="hljs-title function_">
              {"createScrollPosition"}
            </_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" ref);\n"}
            <_components.span className="hljs-comment">
              {"// or wrap with onMount"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"onMount"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" scroll = "}
            <_components.span className="hljs-title function_">
              {"createScrollPosition"}
            </_components.span>
            {"(ref!);\n});\n\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"div"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"ref"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{e"}</_components.span>
                {" =>"}
              </_components.span>
              {" (ref = e)} />"}
            </_components.span>
            {";\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="reactive-target">
          <_components.a className="header-anchor" href="#reactive-target">
            {"#"}
          </_components.a>
          {"Reactive Target"}
        </_components.h4>
        {"\n"}
        <_components.p>{"The element target can be a reactive signal."}</_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [target, setTarget] = createSignal<"}
            <_components.span className="hljs-title class_">{"Element"}</_components.span>
            {" | "}
            <_components.span className="hljs-literal">{"undefined"}</_components.span>
            {">(element);\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" scroll = "}
            <_components.span className="hljs-title function_">
              {"createScrollPosition"}
            </_components.span>
            {"(target);\n\n"}
            <_components.span className="hljs-comment">
              {"// if target is undefined, scroll values will be null"}
            </_components.span>
            {"\nscroll."}
            <_components.span className="hljs-property">{"x"}</_components.span>
            {"; "}
            <_components.span className="hljs-comment">{"// => number | null"}</_components.span>
            {"\nscroll."}
            <_components.span className="hljs-property">{"y"}</_components.span>
            {"; "}
            <_components.span className="hljs-comment">{"// => number | null"}</_components.span>
            {"\n\n"}
            <_components.span className="hljs-comment">
              {"// update the tracking element"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setTarget"}</_components.span>
            {"(ref);\n\n"}
            <_components.span className="hljs-comment">{"// disable tracking"}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setTarget"}</_components.span>
            {"("}
            <_components.span className="hljs-literal">{"undefined"}</_components.span>
            {");\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="destructuring">
          <_components.a className="header-anchor" href="#destructuring">
            {"#"}
          </_components.a>
          {"Destructuring"}
        </_components.h4>
        {"\n"}
        <_components.p>
          {"If you are interested in listening to only single axis, you'd still have to access "}
          <_components.code>{"scroll.y"}</_components.code>
          {
            " as a property. To use it as a separate signal, you can wrap it with a function, or use "
          }
          <_components.a href="https://github.com/solidjs-community/solid-primitives/tree/main/packages/destructure#destructure">
            <_components.code>{"destructure"}</_components.code>
          </_components.a>
          {" helper."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" scroll = "}
            <_components.span className="hljs-title function_">
              {"createScrollPosition"}
            </_components.span>
            {"();\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"x"}</_components.span>
            {" = ("}
            <_components.span className="hljs-params" />
            {") => scroll."}
            <_components.span className="hljs-property">{"x"}</_components.span>
            {";\n"}
            <_components.span className="hljs-title function_">{"x"}</_components.span>
            {"(); "}
            <_components.span className="hljs-comment">{"// => number"}</_components.span>
            {"\n\n"}
            <_components.span className="hljs-comment">{"// or destructure"}</_components.span>
            {"\n\n"}
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { destructure } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/destructure"'}
            </_components.span>
            {";\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" { x, y } = "}
            <_components.span className="hljs-title function_">{"destructure"}</_components.span>
            {"("}
            <_components.span className="hljs-title function_">
              {"createScrollPosition"}
            </_components.span>
            {"());\n"}
            <_components.span className="hljs-title function_">{"x"}</_components.span>
            {"(); "}
            <_components.span className="hljs-comment">{"// => number"}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"y"}</_components.span>
            {"(); "}
            <_components.span className="hljs-comment">{"// => number"}</_components.span>
            {"\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="demo">
          <_components.a className="header-anchor" href="#demo">
            {"#"}
          </_components.a>
          {"Demo"}
        </_components.h3>
        {"\n"}
        <_components.p>
          <_components.a href="https://codesandbox.io/s/solid-primitives-scroll-xy19c8?file=/index.tsx">
            {"https://codesandbox.io/s/solid-primitives-scroll-xy19c8?file=/index.tsx"}
          </_components.a>
        </_components.p>
        {"\n"}
        <_components.h2 id="usewindowscrollposition">
          <_components.a className="header-anchor" href="#usewindowscrollposition">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="useWindowScrollPosition"
            data-code-package-name="scroll"
          >
            {"useWindowScrollPosition"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {"Returns a reactive object with current window scroll position."}
        </_components.p>
        {"\n"}
        <_components.p>
          <_components.code
            data-code-primitive-name="useWindowScrollPosition"
            data-code-package-name="scroll"
          >
            {"useWindowScrollPosition"}
          </_components.code>
          {" is a "}
          <_components.a href="https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot">
            {"shared root"}
          </_components.a>
          {
            " primitive, hence the object instance, signals and event-listeners are shared between dependents, making it more optimized to use in multiple places at once."
          }
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" scroll = "}
            <_components.span className="hljs-title function_">
              {"useWindowScrollPosition"}
            </_components.span>
            {"();\n\n"}
            <_components.span className="hljs-title function_">{"createEffect"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"(\n    scroll."}
            <_components.span className="hljs-property">{"x"}</_components.span>
            {", "}
            <_components.span className="hljs-comment">{"// => number"}</_components.span>
            {"\n    scroll."}
            <_components.span className="hljs-property">{"y"}</_components.span>
            {", "}
            <_components.span className="hljs-comment">{"//  => number"}</_components.span>
            {"\n  );\n});\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="additional-helpers">
          <_components.a className="header-anchor" href="#additional-helpers">
            {"#"}
          </_components.a>
          {"Additional helpers"}
        </_components.h2>
        {"\n"}
        <_components.h3 id="getscrollposition">
          <_components.a className="header-anchor" href="#getscrollposition">
            {"#"}
          </_components.a>
          <_components.code>{"getScrollPosition"}</_components.code>
        </_components.h3>
        {"\n"}
        <_components.p>
          {"Get an "}
          <_components.code>{"{ x: number, y: number }"}</_components.code>
          {" object of element/window scroll position."}
        </_components.p>
        {"\n"}
        <_components.h2 id="primitive-ideas">
          <_components.a className="header-anchor" href="#primitive-ideas">
            {"#"}
          </_components.a>
          {"Primitive ideas:"}
        </_components.h2>
        {"\n"}
        <_components.p>
          <_components.em>{"PRs Welcome :)"}</_components.em>
        </_components.p>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.code>{"createScrollTo"}</_components.code>
            {" - A primitive to support scroll to a target"}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.code>{"createHashScroll"}</_components.code>
            {" - A primitive to support scrolling based on a hashtag change"}
          </_components.li>
          {"\n"}
        </_components.ul>
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
          <_components.a href="https://github.com/solidjs-community/solid-primitives/blob/main/packages/scroll/CHANGELOG.md">
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
      packageName="@solid-primitives/scroll"
      name="scroll"
      stage={2}
      packageList={[{ name: "scroll", gzipped: "1.03 KB", minified: "2.18 KB" }]}
      primitiveList={[
        { name: "useWindowScrollPosition", gzipped: "902 B", minified: "1.81 KB" },
        { name: "createScrollPosition", gzipped: "788 B", minified: "1.56 KB" },
      ]}
    >
      <MDXContent />
    </PrimitivePageMain>
  );
}

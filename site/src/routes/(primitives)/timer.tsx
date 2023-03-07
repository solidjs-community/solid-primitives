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
      a: "a",
      code: "code",
      ul: "ul",
      li: "li",
      h2: "h2",
      h3: "h3",
      h4: "h4",
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
        <_components.p>
          {"Timer primitives related to "}
          <_components.a href="https://developer.mozilla.org/en-US/docs/Web/API/setInterval">
            <_components.code>{"setInterval"}</_components.code>
          </_components.a>
          {" and "}
          <_components.a href="https://developer.mozilla.org/en-US/docs/Web/API/setTimeout">
            <_components.code>{"setTimeout"}</_components.code>
          </_components.a>
          {":"}
        </_components.p>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.a href="#makeTimer">
              <_components.code data-code-primitive-name="makeTimer" data-code-package-name="timer">
                {"makeTimer"}
              </_components.code>
            </_components.a>
            {" - Makes an automatically cleaned up timer."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createTimer">
              <_components.code
                data-code-primitive-name="createTimer"
                data-code-package-name="timer"
              >
                {"createTimer"}
              </_components.code>
            </_components.a>
            {" - "}
            <_components.a href="#maketimer">{"makeTimer"}</_components.a>
            {", but with a fully reactive delay"}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createTimeoutLoop">
              <_components.code
                data-code-primitive-name="createTimeoutLoop"
                data-code-package-name="timer"
              >
                {"createTimeoutLoop"}
              </_components.code>
            </_components.a>
            {" - Like createInterval, except the delay only updates between executions."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createPolled">
              <_components.code
                data-code-primitive-name="createPolled"
                data-code-package-name="timer"
              >
                {"createPolled"}
              </_components.code>
            </_components.a>
            {" - Polls a function periodically. Returns an to the latest polled value."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createIntervalCounter">
              <_components.code
                data-code-primitive-name="createIntervalCounter"
                data-code-package-name="timer"
              >
                {"createIntervalCounter"}
              </_components.code>
            </_components.a>
            {" - Creates a counter which increments periodically."}
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
      <CopyPackages packageName="@solid-primitives/timer" />
      <NoHydration>
        {"\n"}
        <_components.h2 id="how-to-use-it">
          <_components.a className="header-anchor" href="#how-to-use-it">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h2>
        {"\n"}
        <_components.h3 id="basic-usage">
          <_components.a className="header-anchor" href="#basic-usage">
            {"#"}
          </_components.a>
          {"Basic Usage"}
        </_components.h3>
        {"\n"}
        <_components.h4 id="maketimer">
          <_components.a className="header-anchor" href="#maketimer">
            {"#"}
          </_components.a>
          {"makeTimer"}
        </_components.h4>
        {"\n"}
        <_components.p>
          {"Makes a timer ("}
          <_components.a href="https://developer.mozilla.org/en-US/docs/Web/API/setTimeout">
            {"setTimeout"}
          </_components.a>
          {" or "}
          <_components.a href="https://developer.mozilla.org/en-US/docs/Web/API/setInterval">
            {"setInterval"}
          </_components.a>
          {"), automatically cleaning up when the current reactive scope is disposed."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"callback"}</_components.span>
            {" = ("}
            <_components.span className="hljs-params" />
            {") => {};\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" disposeTimeout = "}
            <_components.span className="hljs-title function_">{"makeTimer"}</_components.span>
            {"(callback, "}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {", "}
            <_components.span className="hljs-built_in">{"setTimeout"}</_components.span>
            {");\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" disposeInterval = "}
            <_components.span className="hljs-title function_">{"makeTimer"}</_components.span>
            {"(callback, "}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {", "}
            <_components.span className="hljs-built_in">{"setInterval"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// ..."}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"dispose"}</_components.span>
            {"(); "}
            <_components.span className="hljs-comment">
              {"// clean up manually if needed"}
            </_components.span>
            {"\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="createtimer">
          <_components.a className="header-anchor" href="#createtimer">
            {"#"}
          </_components.a>
          {"createTimer"}
        </_components.h4>
        {"\n"}
        <_components.p>
          <_components.a href="#maketimer">{"makeTimer"}</_components.a>
          {", but with a fully reactive delay. The delay can also be "}
          <_components.code>{"false"}</_components.code>
          {", in which case the timer is disabled. Does not return a dispose function."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"callback"}</_components.span>
            {" = ("}
            <_components.span className="hljs-params" />
            {") => {};\n"}
            <_components.span className="hljs-title function_">{"createTimer"}</_components.span>
            {"(callback, "}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {", "}
            <_components.span className="hljs-built_in">{"setTimeout"}</_components.span>
            {");\n"}
            <_components.span className="hljs-title function_">{"createTimer"}</_components.span>
            {"(callback, "}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {", "}
            <_components.span className="hljs-built_in">{"setInterval"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// with reactive delay"}</_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"callback"}</_components.span>
            {" = ("}
            <_components.span className="hljs-params" />
            {") => {};\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [paused, setPaused] = "}
            <_components.span className="hljs-title function_">{"createSignal"}</_components.span>
            {"("}
            <_components.span className="hljs-literal">{"false"}</_components.span>
            {");\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [delay, setDelay] = "}
            <_components.span className="hljs-title function_">{"createSignal"}</_components.span>
            {"("}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {");\n"}
            <_components.span className="hljs-title function_">{"createTimer"}</_components.span>
            {"(callback, "}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" !"}
            <_components.span className="hljs-title function_">{"paused"}</_components.span>
            {"() && "}
            <_components.span className="hljs-title function_">{"delay"}</_components.span>
            {"(), "}
            <_components.span className="hljs-built_in">{"setTimeout"}</_components.span>
            {");\n"}
            <_components.span className="hljs-title function_">{"createTimer"}</_components.span>
            {"(callback, "}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" !"}
            <_components.span className="hljs-title function_">{"paused"}</_components.span>
            {"() && "}
            <_components.span className="hljs-title function_">{"delay"}</_components.span>
            {"(), "}
            <_components.span className="hljs-built_in">{"setInterval"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// ..."}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setDelay"}</_components.span>
            {"("}
            <_components.span className="hljs-number">{"500"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// pause"}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setPaused"}</_components.span>
            {"("}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// unpause"}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setPaused"}</_components.span>
            {"("}
            <_components.span className="hljs-literal">{"false"}</_components.span>
            {");\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="createtimeoutloop">
          <_components.a className="header-anchor" href="#createtimeoutloop">
            {"#"}
          </_components.a>
          {"createTimeoutLoop"}
        </_components.h4>
        {"\n"}
        <_components.p>
          {"Similar to an interval created with "}
          <_components.a href="#createtimer">{"createTimer"}</_components.a>
          {", but the delay does not update until the callback is executed."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"callback"}</_components.span>
            {" = ("}
            <_components.span className="hljs-params" />
            {") => {};\n"}
            <_components.span className="hljs-title function_">
              {"createTimeoutLoop"}
            </_components.span>
            {"(callback, "}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// with reactive delay"}</_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"callback"}</_components.span>
            {" = ("}
            <_components.span className="hljs-params" />
            {") => {};\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [delay, setDelay] = "}
            <_components.span className="hljs-title function_">{"createSignal"}</_components.span>
            {"("}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {");\n"}
            <_components.span className="hljs-title function_">
              {"createTimeoutLoop"}
            </_components.span>
            {"(callback, delay);\n"}
            <_components.span className="hljs-comment">{"// ..."}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setDelay"}</_components.span>
            {"("}
            <_components.span className="hljs-number">{"500"}</_components.span>
            {");\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="createpolled">
          <_components.a className="header-anchor" href="#createpolled">
            {"#"}
          </_components.a>
          {"createPolled"}
        </_components.h4>
        {"\n"}
        <_components.p>
          {"Periodically polls a function, returning an accessor to its last return value."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" date = "}
            <_components.span className="hljs-title function_">{"createPolled"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>{" "}
            <_components.span className="hljs-keyword">{"new"}</_components.span>{" "}
            <_components.span className="hljs-title class_">{"Date"}</_components.span>
            {"(), "}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// ..."}</_components.span>
            {"\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"span"}</_components.span>
                {">"}
              </_components.span>
              {"The time is: {date()}"}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"span"}</_components.span>
                {">"}
              </_components.span>
            </_components.span>
            {";\n"}
            <_components.span className="hljs-comment">{"// with reactive delay"}</_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [delay, setDelay] = "}
            <_components.span className="hljs-title function_">{"createSignal"}</_components.span>
            {"("}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {");\n"}
            <_components.span className="hljs-title function_">{"createPolled"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>{" "}
            <_components.span className="hljs-keyword">{"new"}</_components.span>{" "}
            <_components.span className="hljs-title class_">{"Date"}</_components.span>
            {"(), delay);\n"}
            <_components.span className="hljs-comment">{"// ..."}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setDelay"}</_components.span>
            {"("}
            <_components.span className="hljs-number">{"500"}</_components.span>
            {");\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="createintervalcounter">
          <_components.a className="header-anchor" href="#createintervalcounter">
            {"#"}
          </_components.a>
          {"createIntervalCounter"}
        </_components.h4>
        {"\n"}
        <_components.p>
          {"A counter which increments periodically based on the delay."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" count = "}
            <_components.span className="hljs-title function_">
              {"createIntervalCounter"}
            </_components.span>
            {"("}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// ..."}</_components.span>
            {"\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"span"}</_components.span>
                {">"}
              </_components.span>
              {"Count: {count()}"}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"span"}</_components.span>
                {">"}
              </_components.span>
            </_components.span>
            {";\n"}
            <_components.span className="hljs-comment">{"// with reactive delay"}</_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [delay, setDelay] = "}
            <_components.span className="hljs-title function_">{"createSignal"}</_components.span>
            {"("}
            <_components.span className="hljs-number">{"1000"}</_components.span>
            {");\n"}
            <_components.span className="hljs-title function_">
              {"createIntervalCounter"}
            </_components.span>
            {"(delay);\n"}
            <_components.span className="hljs-comment">{"// ..."}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setDelay"}</_components.span>
            {"("}
            <_components.span className="hljs-number">{"500"}</_components.span>
            {");\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="note-on-reactive-delays">
          <_components.a className="header-anchor" href="#note-on-reactive-delays">
            {"#"}
          </_components.a>
          {"Note on Reactive Delays"}
        </_components.h3>
        {"\n"}
        <_components.p>
          {
            "When a delay is changed, the fraction of the existing delay already elapsed be carried forward to the new delay. For instance, a delay of 1000ms changed to 2000ms after 250ms will be considered 1/4 done, and next callback will be executed after 250ms + 1500ms. Afterwards, the new delay will be used."
          }
        </_components.p>
        {"\n"}
        <_components.h2 id="demo">
          <_components.a className="header-anchor" href="#demo">
            {"#"}
          </_components.a>
          {"Demo"}
        </_components.h2>
        {"\n"}
        <_components.p>
          <_components.a href="https://solidjs-community.github.io/solid-primitives/timer/">
            {"Live Site"}
          </_components.a>
        </_components.p>
        {"\n"}
        <_components.p>
          {"You may view a working example here: "}
          <_components.a href="https://codesandbox.io/s/solid-primitives-timer-6n7dt?file=/src/index.tsx">
            {"CodeSandbox"}
          </_components.a>
        </_components.p>
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
          <_components.a href="https://github.com/solidjs-community/solid-primitives/blob/main/packages/timer/CHANGELOG.md">
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
      packageName="@solid-primitives/timer"
      name="timer"
      stage={3}
      packageList={[{ name: "timer", gzipped: "530 B", minified: "1.13 KB" }]}
      primitiveList={[
        { name: "createTimer", gzipped: "371 B", minified: "702 B" },
        { name: "createTimeoutLoop", gzipped: "247 B", minified: "397 B" },
        { name: "createPolled", gzipped: "429 B", minified: "829 B" },
        { name: "createIntervalCounter", gzipped: "459 B", minified: "890 B" },
        { name: "makeTimer", gzipped: "163 B", minified: "223 B" },
      ]}
    >
      <MDXContent />
    </PrimitivePageMain>
  );
}

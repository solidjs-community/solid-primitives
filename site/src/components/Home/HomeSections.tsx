// Do not modify
// Generated from "./scripts/update-site/build-html-home-sections"
import { StageContent } from "~/components/Stage/Stage";

/*@jsxRuntime automatic @jsxImportSource solid-js*/
import { useMDXComponents as _provideComponents } from "solid-mdx";
function _createMdxContent(props) {
  const _components = Object.assign(
    {
      h2: "h2",
      a: "a",
      p: "p",
      ol: "ol",
      li: "li",
      h3: "h3",
      code: "code",
    },
    _provideComponents(),
    props.components,
  );
  if (!StageContent) _missingMdxReference("StageContent", true);
  return (
    <>
      <_components.h2 id="contribution-process">
        <_components.a className="header-anchor" href="#contribution-process">
          {"#"}
        </_components.a>
        {"Contribution Process"}
      </_components.h2>
      {"\n"}
      <StageContent />
      {"\n"}
      <_components.h2 id="philosophy">
        <_components.a className="header-anchor" href="#philosophy">
          {"#"}
        </_components.a>
        {"Philosophy"}
      </_components.h2>
      {"\n"}
      <_components.p>
        {
          "The goal of Solid Primitives is to wrap client and server side functionality to provide a fully reactive API layer. Ultimately the more rooted our tertiary primitives are, the more they act as foundation within Solid's base ecosystem. With well built and re-used foundations, the smaller (aggregate tree-shaking benefits), more concise (readability) and stable (consistent and managed testing + maintenance) applications can be overall."
        }
      </_components.p>
      {"\n"}
      <_components.h2 id="design-maxims">
        <_components.a className="header-anchor" href="#design-maxims">
          {"#"}
        </_components.a>
        {"Design Maxims"}
      </_components.h2>
      {"\n"}
      <_components.p>
        {
          "Other frameworks have large and extremely well established ecosystems. Notably React which has a vast array of component and hooks. The amount of choice within the ecosystem is great but often these tools are built as one-offs resulting in often un-tested logic or are designed with narrow needs. Over time the less concise these building blocks are the more they tend to repeat themselves. Our goal with Primitives is to bring the community together to contribute, evolve and utilize a powerful centralize primitive foundation."
        }
      </_components.p>
      {"\n"}
      <_components.p>
        {
          "All our primitives are meant to be consistent and sustain a level of quality. We guarantee that each is created with the utmost care. Our primitives are:"
        }
      </_components.p>
      {"\n"}
      <_components.ol>
        {"\n"}
        <_components.li>{"Documented and follow a consistent style guide"}</_components.li>
        {"\n"}
        <_components.li>{"Be well tested"}</_components.li>
        {"\n"}
        <_components.li>{"Small, concise and practical as possible"}</_components.li>
        {"\n"}
        <_components.li>{"A single primitive for a single purpose"}</_components.li>
        {"\n"}
        <_components.li>{"No dependencies or as few as possible"}</_components.li>
        {"\n"}
        <_components.li>
          {"SSR safe entries (or short-circuits where needed) provided"}
        </_components.li>
        {"\n"}
        <_components.li>{"Wrap base level Browser APIs"}</_components.li>
        {"\n"}
        <_components.li>{"Should be progressively improved for future features"}</_components.li>
        {"\n"}
        <_components.li>{"Be focused on composition vs. isolation of logic"}</_components.li>
        {"\n"}
        <_components.li>{"Community voice and needs guide road map and planning"}</_components.li>
        {"\n"}
        <_components.li>{"Strong TypeScript support"}</_components.li>
        {"\n"}
        <_components.li>{"Support for both CJS and ESM"}</_components.li>
        {"\n"}
        <_components.li>{"Solid performance!"}</_components.li>
        {"\n"}
      </_components.ol>
      {"\n"}
      <_components.h2 id="basic-and-compound-primitives">
        <_components.a className="header-anchor" href="#basic-and-compound-primitives">
          {"#"}
        </_components.a>
        {"Basic and Compound Primitives"}
      </_components.h2>
      {"\n"}
      <_components.p>
        {
          "Each primitive is designed with composition in mind. A major rule in designing our primitives is deciding that the interface of primitives should be composable or segmented. For this reason every API is intricately studied and considered to be composed (stacked with features) or decomposed into smaller units. Designing our primitives in this manner allows for better tree-shaking and extendable complexity only as needed. You should only ship what you have to by picking from existing primitives as your foundational building blocks."
        }
      </_components.p>
      {"\n"}
      <_components.p>
        {"Much of the design decisions in naming are best described in the "}
        <_components.a href="https://www.youtube.com/watch?v=yLgq-Foc1EE&amp;t=502s">
          {"7 Lessons to Outlive React"}
        </_components.a>
        {" talk by "}
        <_components.a href="https://www.swyx.io">{"swyx"}</_components.a>
        {". We strive to follow a similar design pattern promoted by the React core team."}
      </_components.p>
      {"\n"}
      <_components.h3 id="make-non-reactive-vs-create-reactive">
        <_components.a className="header-anchor" href="#make-non-reactive-vs-create-reactive">
          {"#"}
        </_components.a>
        <_components.code>{"make"}</_components.code>
        {" (non-reactive) vs "}
        <_components.code>{"create"}</_components.code>
        {" (reactive)"}
      </_components.h3>
      {"\n"}
      <_components.p>
        {"Solid uses the "}
        <_components.code>{"create"}</_components.code>
        {
          " prefix to define a primitive that provides reactive utility. Solid Primitives reinforces this pattern but in an effort to enhance composability we have also introduced the "
        }
        <_components.code>{"make"}</_components.code>
        {
          " prefix for identifying non-reactive foundation primitives. Having a non-reactive alternative means that the primitive does the bare essentials such as cleaning up events or interupting a process. ie. "
        }
        <_components.code>{"makeTimer"}</_components.code>
        {
          " will create and clean-up the scheduler, providing only a clear method. createTimer provides a properly reactive primitive that composes it."
        }
      </_components.p>
      {"\n"}
      <_components.h3 id="managing-primitive-complexity">
        <_components.a className="header-anchor" href="#managing-primitive-complexity">
          {"#"}
        </_components.a>
        {"Managing Primitive Complexity"}
      </_components.h3>
      {"\n"}
      <_components.p>
        {
          "Solid Primitives is mostly about supplying 80-90% of the common-use cases for the end-user. We prefer to be less prescriptive than other hook libraries such as VueUse and supply granular solutions as opposed to monolithic primitives. The remaining 10-20% of complex use cases are likely not to be covered with this library. This is on purpose to limit the potential of bloat and extended complexity. This project strives to provide foundations and not cumulative solutions. We expect the broader ecosystem will fill the remaining need as further composition to this projects effort. This allows for just the right amount of prescription and opinion."
        }
      </_components.p>
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

export default function HomeSections() {
  return (
    <div class="prose">
      <MDXContent />
    </div>
  );
}

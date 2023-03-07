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
      h5: "h5",
      a: "a",
      ul: "ul",
      li: "li",
      code: "code",
      h2: "h2",
      h6: "h6",
      h3: "h3",
      pre: "pre",
      span: "span",
      h4: "h4",
      ol: "ol",
    },
    _provideComponents(),
    props.components,
  );
  if (!CopyPackages) _missingMdxReference("CopyPackages", true);
  return (
    <>
      <NoHydration>
        <_components.p>
          {"A set of primitives that help with listening to DOM and Custom Events."}
        </_components.p>
        {"\n"}
        <_components.h5 id="non-reactive-primitives">
          <_components.a className="header-anchor" href="#non-reactive-primitives">
            {"#"}
          </_components.a>
          {"Non-reactive primitives:"}
        </_components.h5>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.a href="#makeEventListener">
              <_components.code>{"makeEventListener"}</_components.code>
            </_components.a>
            {" — Non-reactive primitive for adding event listeners that gets removed onCleanup."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#makeEventListenerStack">
              <_components.code>{"makeEventListenerStack"}</_components.code>
            </_components.a>
            {
              " — Creates a stack of event listeners, that will be automatically disposed on cleanup."
            }
          </_components.li>
          {"\n"}
        </_components.ul>
        {"\n"}
        <_components.h5 id="reactive-primitives">
          <_components.a className="header-anchor" href="#reactive-primitives">
            {"#"}
          </_components.a>
          {"Reactive primitives:"}
        </_components.h5>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.a href="#createEventListener">
              <_components.code
                data-code-primitive-name="createEventListener"
                data-code-package-name="event-listener"
              >
                {"createEventListener"}
              </_components.code>
            </_components.a>
            {" — Reactive version of "}
            <_components.a href="#makeEventListener">
              <_components.code>{"makeEventListener"}</_components.code>
            </_components.a>
            {", that takes signal arguments to apply new listeners once changed."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createEventListener">
              <_components.code
                data-code-primitive-name="createEventSignal"
                data-code-package-name="event-listener"
              >
                {"createEventSignal"}
              </_components.code>
            </_components.a>
            {" — Like "}
            <_components.a href="#createEventListener">
              <_components.code
                data-code-primitive-name="createEventListener"
                data-code-package-name="event-listener"
              >
                {"createEventListener"}
              </_components.code>
            </_components.a>
            {", but captured events are stored in a returned signal."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#createEventListenerMap">
              <_components.code
                data-code-primitive-name="createEventListenerMap"
                data-code-package-name="event-listener"
              >
                {"createEventListenerMap"}
              </_components.code>
            </_components.a>
            {
              " — A helpful primitive that listens to a map of events. Handle them by individual callbacks."
            }
          </_components.li>
          {"\n"}
        </_components.ul>
        {"\n"}
        <_components.h5 id="component-global-listeners">
          <_components.a className="header-anchor" href="#component-global-listeners">
            {"#"}
          </_components.a>
          {"Component global listeners:"}
        </_components.h5>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.a href="#WindowEventListener">
              <_components.code
                data-code-primitive-name="WindowEventListener"
                data-code-package-name="event-listener"
              >
                {"WindowEventListener"}
              </_components.code>
            </_components.a>
            {" — Listen to the "}
            <_components.code>{"window"}</_components.code>
            {" DOM Events, using a component."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#DocumentEventListener">
              <_components.code
                data-code-primitive-name="DocumentEventListener"
                data-code-package-name="event-listener"
              >
                {"DocumentEventListener"}
              </_components.code>
            </_components.a>
            {" — Listen to the "}
            <_components.code>{"document"}</_components.code>
            {" DOM Events, using a component."}
          </_components.li>
          {"\n"}
        </_components.ul>
        {"\n"}
        <_components.h5 id="callback-wrappers">
          <_components.a className="header-anchor" href="#callback-wrappers">
            {"#"}
          </_components.a>
          {"Callback Wrappers"}
        </_components.h5>
        {"\n"}
        <_components.ul>
          {"\n"}
          <_components.li>
            <_components.a href="#preventDefault">
              <_components.code>{"preventDefault"}</_components.code>
            </_components.a>
            {" — Wraps event handler with "}
            <_components.code>{"e.preventDefault()"}</_components.code>
            {" call."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#stopPropagation">
              <_components.code>{"stopPropagation"}</_components.code>
            </_components.a>
            {" — Wraps event handler with "}
            <_components.code>{"e.stopPropagation()"}</_components.code>
            {" call."}
          </_components.li>
          {"\n"}
          <_components.li>
            <_components.a href="#stopImmediatePropagation">
              <_components.code>{"stopImmediatePropagation"}</_components.code>
            </_components.a>
            {" — Wraps event handler with "}
            <_components.code>{"e.stopImmediatePropagation()"}</_components.code>
            {" call."}
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
      <CopyPackages packageName="@solid-primitives/event-listener" />
      <NoHydration>
        {"\n"}
        <_components.h2 id="makeeventlistener">
          <_components.a className="header-anchor" href="#makeeventlistener">
            {"#"}
          </_components.a>
          <_components.code>{"makeEventListener"}</_components.code>
        </_components.h2>
        {"\n"}
        <_components.h6 id="added-id-200">
          <_components.a className="header-anchor" href="#added-id-200">
            {"#"}
          </_components.a>
          {"Added id "}
          <_components.code>{"@2.0.0"}</_components.code>
        </_components.h6>
        {"\n"}
        <_components.p>
          {"Can be used to listen to DOM or Custom Events on window, document, or any EventTarget."}
        </_components.p>
        {"\n"}
        <_components.p>
          {
            "Event listener is automatically removed on root cleanup. The clear() function is also returned for calling it early."
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
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { makeEventListener } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" clear = "}
            <_components.span className="hljs-title function_">
              {"makeEventListener"}
            </_components.span>
            {"(\n  "}
            <_components.span className="hljs-variable language_">{"document"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"getElementById"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"myButton"'}</_components.span>
            {"),\n  "}
            <_components.span className="hljs-string">{'"mousemove"'}</_components.span>
            {",\n  "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>{" "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"x:"'}</_components.span>
            {", e."}
            <_components.span className="hljs-property">{"pageX"}</_components.span>
            {", "}
            <_components.span className="hljs-string">{'"y:"'}</_components.span>
            {", e."}
            <_components.span className="hljs-property">{"pageY"}</_components.span>
            {"),\n  { "}
            <_components.span className="hljs-attr">{"passive"}</_components.span>
            {": "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {" }\n);\n\n"}
            <_components.span className="hljs-comment">
              {"// to clear all of the event listeners"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"clear"}</_components.span>
            {"();\n\n"}
            <_components.span className="hljs-comment">
              {"// when listening to element refs, call it inside onMount"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"let"}</_components.span>
            {" ref!: "}
            <_components.span className="hljs-title class_">{"HTMLDivElement"}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"onMount"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-title function_">
              {"makeEventListener"}
            </_components.span>
            {"(ref, "}
            <_components.span className="hljs-string">{'"click"'}</_components.span>
            {", "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {...}, { "}
            <_components.span className="hljs-attr">{"passive"}</_components.span>
            {": "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {" });\n});\n\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"div"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"ref"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{ref}"}</_components.span>
                {" />"}
              </_components.span>
            </_components.span>
            {";\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="custom-events">
          <_components.a className="header-anchor" href="#custom-events">
            {"#"}
          </_components.a>
          {"Custom events"}
        </_components.h4>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-comment">
              {"// you can provide your own event map type as well:"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-comment">
              {"// fill both type generics for the best type support"}
            </_components.span>
            {"\nmakeEventListener<{ "}
            <_components.span className="hljs-attr">{"myCustomEvent"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"MyEvent"}</_components.span>
            {"; "}
            <_components.span className="hljs-attr">{"other"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"Event"}</_components.span>
            {" }, "}
            <_components.span className="hljs-string">{'"myCustomEvent"'}</_components.span>
            {">(\n  "}
            <_components.span className="hljs-variable language_">{"window"}</_components.span>
            {",\n  "}
            <_components.span className="hljs-string">{'"myCustomEvent"'}</_components.span>
            {",\n  "}
            <_components.span className="hljs-function">{"() =>"}</_components.span>{" "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"yup!"'}</_components.span>
            {"),\n);\n"}
            <_components.span className="hljs-comment">
              {"// just don't use interfaces as EventMaps! (write them using `type` keyword)"}
            </_components.span>
            {"\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="makeeventlistenerstack">
          <_components.a className="header-anchor" href="#makeeventlistenerstack">
            {"#"}
          </_components.a>
          <_components.code>{"makeEventListenerStack"}</_components.code>
        </_components.h2>
        {"\n"}
        <_components.h6 id="added-id-200-1">
          <_components.a className="header-anchor" href="#added-id-200-1">
            {"#"}
          </_components.a>
          {"Added id "}
          <_components.code>{"@2.0.0"}</_components.code>
        </_components.h6>
        {"\n"}
        <_components.p>
          {"Creates a stack of event listeners, that will be automatically disposed on cleanup."}
        </_components.p>
        {"\n"}
        <_components.h3 id="how-to-use-it-1">
          <_components.a className="header-anchor" href="#how-to-use-it-1">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h3>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { makeEventListenerStack } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [listen, clear] = "}
            <_components.span className="hljs-title function_">
              {"makeEventListenerStack"}
            </_components.span>
            {"(target, { "}
            <_components.span className="hljs-attr">{"passive"}</_components.span>
            {": "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {" });\n\n"}
            <_components.span className="hljs-title function_">{"listen"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"mousemove"'}</_components.span>
            {", handleMouse);\n"}
            <_components.span className="hljs-title function_">{"listen"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"dragover"'}</_components.span>
            {", handleMouse);\n\n"}
            <_components.span className="hljs-comment">
              {"// remove listener (will also happen on cleanup)"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"clear"}</_components.span>
            {"();\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="createeventlistener">
          <_components.a className="header-anchor" href="#createeventlistener">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="createEventListener"
            data-code-package-name="event-listener"
          >
            {"createEventListener"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {"Reactive version of "}
          <_components.a href="#makeEventListener">
            <_components.code>{"makeEventListener"}</_components.code>
          </_components.a>
          {", that can take signal "}
          <_components.code>{"target"}</_components.code>
          {" and "}
          <_components.code>{"type"}</_components.code>
          {" arguments to apply new listeners once changed."}
        </_components.p>
        {"\n"}
        <_components.h3 id="how-to-use-it-2">
          <_components.a className="header-anchor" href="#how-to-use-it-2">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h3>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createEventListener } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-title function_">
              {"createEventListener"}
            </_components.span>
            {"(\n  "}
            <_components.span className="hljs-variable language_">{"document"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"getElementById"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"myButton"'}</_components.span>
            {"),\n  "}
            <_components.span className="hljs-string">{'"mousemove"'}</_components.span>
            {",\n  "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>{" "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"x:"'}</_components.span>
            {", e."}
            <_components.span className="hljs-property">{"pageX"}</_components.span>
            {", "}
            <_components.span className="hljs-string">{'"y:"'}</_components.span>
            {", e."}
            <_components.span className="hljs-property">{"pageY"}</_components.span>
            {"),\n  { "}
            <_components.span className="hljs-attr">{"passive"}</_components.span>
            {": "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {" }\n);\n\n\n"}
            <_components.span className="hljs-comment">
              {"// target element and event name can be reactive signals"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [ref, setRef] = createSignal<"}
            <_components.span className="hljs-title class_">{"HTMLElement"}</_components.span>
            {">();\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" ["}
            <_components.span className="hljs-keyword">{"type"}</_components.span>
            {", setType] = "}
            <_components.span className="hljs-title function_">{"createSignal"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"mousemove"'}</_components.span>
            {");\n"}
            <_components.span className="hljs-title function_">
              {"createEventListener"}
            </_components.span>
            {"(ref, "}
            <_components.span className="hljs-keyword">{"type"}</_components.span>
            {", "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {...});\n\n"}
            <_components.span className="hljs-comment">
              {
                "// when using ref as a target, pass it in a function – function will be executed after mount"
              }
            </_components.span>
            {"\n"}
            <_components.span className="hljs-comment">
              {"// or wrap the whole primitive in onMount"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"let"}</_components.span>
            {" ref;\n"}
            <_components.span className="hljs-title function_">
              {"createEventListener"}
            </_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" ref, "}
            <_components.span className="hljs-string">{'"mousemove"'}</_components.span>
            {", "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {});\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"div"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"ref"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{ref}"}</_components.span>
                {" />"}
              </_components.span>
            </_components.span>
            {";\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="custom-events-1">
          <_components.a className="header-anchor" href="#custom-events-1">
            {"#"}
          </_components.a>
          {"Custom events"}
        </_components.h4>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-comment">
              {"// you can provide your own event map type as well:"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-comment">
              {"// fill both type generics for the best type support"}
            </_components.span>
            {"\ncreateEventListener<{ "}
            <_components.span className="hljs-attr">{"myCustomEvent"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"MyEvent"}</_components.span>
            {"; "}
            <_components.span className="hljs-attr">{"other"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"Event"}</_components.span>
            {" }, "}
            <_components.span className="hljs-string">{'"myCustomEvent"'}</_components.span>
            {">(\n  "}
            <_components.span className="hljs-variable language_">{"window"}</_components.span>
            {",\n  "}
            <_components.span className="hljs-string">{'"myCustomEvent"'}</_components.span>
            {",\n  "}
            <_components.span className="hljs-function">{"() =>"}</_components.span>{" "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"yup!"'}</_components.span>
            {"),\n);\n"}
            <_components.span className="hljs-comment">
              {"// just don't use interfaces as EventMaps! (write them using `type` keyword)"}
            </_components.span>
            {"\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="removing-event-listeners-manually">
          <_components.a className="header-anchor" href="#removing-event-listeners-manually">
            {"#"}
          </_components.a>
          {"Removing event listeners manually"}
        </_components.h4>
        {"\n"}
        <_components.p>
          {"Since version "}
          <_components.code>{"@2.0.0"}</_components.code>{" "}
          <_components.code
            data-code-primitive-name="createEventListener"
            data-code-package-name="event-listener"
          >
            {"createEventListener"}
          </_components.code>
          {" and other reactive primitives aren't returning a "}
          <_components.code>{"clear()"}</_components.code>
          {" function, because of it's flawed behavior "}
          <_components.a href="https://github.com/solidjs-community/solid-primitives/issues/103">
            {"described in this issue"}
          </_components.a>
          {"."}
        </_components.p>
        {"\n"}
        <_components.p>
          {"Although there are still ways to remove attached event listeners:"}
        </_components.p>
        {"\n"}
        <_components.ol>
          {"\n"}
          <_components.li>
            {"Changing reactive "}
            <_components.code>{"target"}</_components.code>
            {" or "}
            <_components.code>{"type"}</_components.code>
            {" arguments to an empty array."}
          </_components.li>
          {"\n"}
        </_components.ol>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" ["}
            <_components.span className="hljs-keyword">{"type"}</_components.span>
            {", setType] = createSignal<"}
            <_components.span className="hljs-string">{'"click"'}</_components.span>
            {" | []>("}
            <_components.span className="hljs-string">{'"click"'}</_components.span>
            {");\n"}
            <_components.span className="hljs-title function_">
              {"createEventListener"}
            </_components.span>
            {"("}
            <_components.span className="hljs-variable language_">{"window"}</_components.span>
            {", "}
            <_components.span className="hljs-keyword">{"type"}</_components.span>
            {", "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {...});\n"}
            <_components.span className="hljs-comment">{"// remove listener:"}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"setType"}</_components.span>
            {"([]);\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.ol start="2">
          {"\n"}
          <_components.li>
            {"Wrapping usage of "}
            <_components.code
              data-code-primitive-name="createEventListener"
              data-code-package-name="event-listener"
            >
              {"createEventListener"}
            </_components.code>
            {" primitive in Solid's "}
            <_components.code>{"createRoot"}</_components.code>
            {" or "}
            <_components.code>{"createBranch"}</_components.code>
            {" | "}
            <_components.code>{"createDisposable"}</_components.code>
            {" from "}
            <_components.a href="https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createDisposable">
              {'"@solid-primitives/rootless"'}
            </_components.a>
            {"."}
          </_components.li>
          {"\n"}
        </_components.ol>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createDisposable } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/rootless"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" clear = "}
            <_components.span className="hljs-title function_">
              {"createDisposable"}
            </_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>{" "}
            <_components.span className="hljs-title function_">
              {"createEventListener"}
            </_components.span>
            {"(element, "}
            <_components.span className="hljs-string">{'"click"'}</_components.span>
            {", "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {...}));\n"}
            <_components.span className="hljs-comment">{"// remove listener:"}</_components.span>
            {"\n"}
            <_components.span className="hljs-title function_">{"clear"}</_components.span>
            {"();\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h4 id="listening-to-multiple-events">
          <_components.a className="header-anchor" href="#listening-to-multiple-events">
            {"#"}
          </_components.a>
          {"Listening to multiple events"}
        </_components.h4>
        {"\n"}
        <_components.h6 id="added-in-143">
          <_components.a className="header-anchor" href="#added-in-143">
            {"#"}
          </_components.a>
          {"Added in "}
          <_components.code>{"@1.4.3"}</_components.code>
        </_components.h6>
        {"\n"}
        <_components.p>
          {"You can listen to multiple events with single "}
          <_components.code
            data-code-primitive-name="createEventListener"
            data-code-package-name="event-listener"
          >
            {"createEventListener"}
          </_components.code>
          {" primitive."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-title function_">
              {"createEventListener"}
            </_components.span>
            {"(el, ["}
            <_components.span className="hljs-string">{'"mousemove"'}</_components.span>
            {", "}
            <_components.span className="hljs-string">{'"mouseenter"'}</_components.span>
            {", "}
            <_components.span className="hljs-string">{'"mouseleave"'}</_components.span>
            {"], "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {});\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="directive-usage">
          <_components.a className="header-anchor" href="#directive-usage">
            {"#"}
          </_components.a>
          {"Directive Usage"}
        </_components.h3>
        {"\n"}
        <_components.p>
          {
            "props passed to the directive are also reactive, so you can change handlers on the fly."
          }
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { eventListener } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n"}
            <_components.span className="hljs-comment">
              {"// avoids tree-shaking the directive:"}
            </_components.span>
            {"\neventListener;\n\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"button"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"use:eventListener"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{["}</_components.span>
                {'"'}
                <_components.span className="hljs-attr">{"click"}</_components.span>
                {'", () =>'}
              </_components.span>
              {' console.log("Click")]}>Click!'}
              <_components.span className="hljs-tag">
                {"</"}
                <_components.span className="hljs-name">{"button"}</_components.span>
                {">"}
              </_components.span>
            </_components.span>
            {";\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="createeventsignal">
          <_components.a className="header-anchor" href="#createeventsignal">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="createEventSignal"
            data-code-package-name="event-listener"
          >
            {"createEventSignal"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {"Like "}
          <_components.a href="#createEventListener">
            <_components.code
              data-code-primitive-name="createEventListener"
              data-code-package-name="event-listener"
            >
              {"createEventListener"}
            </_components.code>
          </_components.a>
          {", but events are handled with the returned signal, instead of with a callback."}
        </_components.p>
        {"\n"}
        <_components.h3 id="how-to-use-it-3">
          <_components.a className="header-anchor" href="#how-to-use-it-3">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h3>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createEventSignal } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-comment">
              {"// all arguments can be reactive signals"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" lastEvent = "}
            <_components.span className="hljs-title function_">
              {"createEventSignal"}
            </_components.span>
            {"(el, "}
            <_components.span className="hljs-string">{'"mousemove"'}</_components.span>
            {", { "}
            <_components.span className="hljs-attr">{"passive"}</_components.span>
            {": "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {" });\n\n"}
            <_components.span className="hljs-title function_">{"createEffect"}</_components.span>
            {"("}
            <_components.span className="hljs-function">{"() =>"}</_components.span>
            {" {\n  "}
            <_components.span className="hljs-variable language_">{"console"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-title function_">{"lastEvent"}</_components.span>
            {"()?."}
            <_components.span className="hljs-property">{"x"}</_components.span>
            {", "}
            <_components.span className="hljs-title function_">{"lastEvent"}</_components.span>
            {"()?."}
            <_components.span className="hljs-property">{"y"}</_components.span>
            {");\n});\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="createeventlistenermap">
          <_components.a className="header-anchor" href="#createeventlistenermap">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="createEventListenerMap"
            data-code-package-name="event-listener"
          >
            {"createEventListenerMap"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {
            "A helpful primitive that listens to a map of events. Handle them by individual callbacks."
          }
        </_components.p>
        {"\n"}
        <_components.h3 id="how-to-use-it-4">
          <_components.a className="header-anchor" href="#how-to-use-it-4">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h3>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-ts">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { createEventListenerMap } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-title function_">
              {"createEventListenerMap"}
            </_components.span>
            {"(element, {\n  "}
            <_components.span className="hljs-attr">{"mousemove"}</_components.span>
            {": mouseHandler,\n  "}
            <_components.span className="hljs-attr">{"mouseenter"}</_components.span>
            {": "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {},\n  "}
            <_components.span className="hljs-attr">{"touchend"}</_components.span>
            {": touchHandler,\n});\n\n"}
            <_components.span className="hljs-comment">
              {"// both target can be reactive:"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>
            {" [target, setTarget] = "}
            <_components.span className="hljs-title function_">{"createSignal"}</_components.span>
            {"("}
            <_components.span className="hljs-variable language_">{"document"}</_components.span>
            {"."}
            <_components.span className="hljs-title function_">{"getElementById"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"abc"'}</_components.span>
            {"));\n"}
            <_components.span className="hljs-title function_">
              {"createEventListenerMap"}
            </_components.span>
            {"(\n  target,\n  {\n    "}
            <_components.span className="hljs-attr">{"mousemove"}</_components.span>
            {": "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {},\n    "}
            <_components.span className="hljs-attr">{"touchstart"}</_components.span>
            {": "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {},\n  },\n  { "}
            <_components.span className="hljs-attr">{"passive"}</_components.span>
            {": "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {" },\n);\n\n"}
            <_components.span className="hljs-comment">
              {"// createEventListenerMap can be used to listen to custom events"}
            </_components.span>
            {"\n"}
            <_components.span className="hljs-comment">
              {"// fill both type generics for the best type support"}
            </_components.span>
            {"\ncreateEventListenerMap<\n  {\n    "}
            <_components.span className="hljs-attr">{"myEvent"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"MyEvent"}</_components.span>
            {";\n    "}
            <_components.span className="hljs-attr">{"custom"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"Event"}</_components.span>
            {";\n    "}
            <_components.span className="hljs-attr">{"other"}</_components.span>
            {": "}
            <_components.span className="hljs-title class_">{"Event"}</_components.span>
            {";\n  },\n  "}
            <_components.span className="hljs-string">{'"myEvent"'}</_components.span>
            {" | "}
            <_components.span className="hljs-string">{'"custom"'}</_components.span>
            {"\n>(target, {\n  "}
            <_components.span className="hljs-attr">{"myEvent"}</_components.span>
            {": "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {},\n  "}
            <_components.span className="hljs-attr">{"custom"}</_components.span>
            {": "}
            <_components.span className="hljs-function">
              <_components.span className="hljs-params">{"e"}</_components.span>
              {" =>"}
            </_components.span>
            {" {},\n});\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="windoweventlistener">
          <_components.a className="header-anchor" href="#windoweventlistener">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="WindowEventListener"
            data-code-package-name="event-listener"
          >
            {"WindowEventListener"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {"Listen to the "}
          <_components.code>{"window"}</_components.code>
          {" DOM Events, using a component."}
        </_components.p>
        {"\n"}
        <_components.p>
          {"You can use it with any Solid's Control-Flow components, e.g. "}
          <_components.code>{"<Show/>"}</_components.code>
          {" or "}
          <_components.code>{"<Switch/>"}</_components.code>
          {"."}
        </_components.p>
        {"\n"}
        <_components.p>
          {"The event handler prop is reactive, so you can use it with signals."}
        </_components.p>
        {"\n"}
        <_components.h3 id="how-to-use-it-5">
          <_components.a className="header-anchor" href="#how-to-use-it-5">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h3>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { "}
            <_components.span className="hljs-title class_">
              {"WindowEventListener"}
            </_components.span>
            {" } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">
                  {"WindowEventListener"}
                </_components.span>{" "}
                <_components.span className="hljs-attr">{"onMouseMove"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{e"}</_components.span>
                {" =>"}
              </_components.span>
              {" console.log(e.x, e.y)} />"}
            </_components.span>
            {";\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="documenteventlistener">
          <_components.a className="header-anchor" href="#documenteventlistener">
            {"#"}
          </_components.a>
          <_components.code
            data-code-primitive-name="DocumentEventListener"
            data-code-package-name="event-listener"
          >
            {"DocumentEventListener"}
          </_components.code>
        </_components.h2>
        {"\n"}
        <_components.p>
          {"The same as "}
          <_components.a href="#WindowEventListener">
            <_components.code
              data-code-primitive-name="WindowEventListener"
              data-code-package-name="event-listener"
            >
              {"WindowEventListener"}
            </_components.code>
          </_components.a>
          {", but listens to "}
          <_components.code>{"document"}</_components.code>
          {" events."}
        </_components.p>
        {"\n"}
        <_components.h3 id="how-to-use-it-6">
          <_components.a className="header-anchor" href="#how-to-use-it-6">
            {"#"}
          </_components.a>
          {"How to use it"}
        </_components.h3>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { "}
            <_components.span className="hljs-title class_">
              {"DocumentEventListener"}
            </_components.span>
            {" } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">
                  {"DocumentEventListener"}
                </_components.span>{" "}
                <_components.span className="hljs-attr">{"onMouseMove"}</_components.span>
                {"="}
                <_components.span className="hljs-string">{"{e"}</_components.span>
                {" =>"}
              </_components.span>
              {" console.log(e.x, e.y)} />"}
            </_components.span>
            {";\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h2 id="callback-wrappers-1">
          <_components.a className="header-anchor" href="#callback-wrappers-1">
            {"#"}
          </_components.a>
          {"Callback Wrappers"}
        </_components.h2>
        {"\n"}
        <_components.h3 id="preventdefault">
          <_components.a className="header-anchor" href="#preventdefault">
            {"#"}
          </_components.a>
          <_components.code>{"preventDefault"}</_components.code>
        </_components.h3>
        {"\n"}
        <_components.p>
          {"Wraps event handler with "}
          <_components.code>{"e.preventDefault()"}</_components.code>
          {" call."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { preventDefault, makeEventListener } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"handleClick"}</_components.span>
            {" = e => {\n  concole."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"Click!"'}</_components.span>
            {", e);\n};\n\n"}
            <_components.span className="hljs-title function_">
              {"makeEventListener"}
            </_components.span>
            {"("}
            <_components.span className="hljs-variable language_">{"window"}</_components.span>
            {", "}
            <_components.span className="hljs-string">{'"click"'}</_components.span>
            {", "}
            <_components.span className="hljs-title function_">{"preventDefault"}</_components.span>
            {"(handleClick), "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// or in jsx:"}</_components.span>
            {"\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"div"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"onClick"}</_components.span>
                {"="}
                <_components.span className="hljs-string">
                  {"{preventDefault(handleClick)}"}
                </_components.span>
                {" />"}
              </_components.span>
            </_components.span>
            {";\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="stoppropagation">
          <_components.a className="header-anchor" href="#stoppropagation">
            {"#"}
          </_components.a>
          <_components.code>{"stopPropagation"}</_components.code>
        </_components.h3>
        {"\n"}
        <_components.p>
          {"Wraps event handler with "}
          <_components.code>{"e.stopPropagation()"}</_components.code>
          {" call."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { stopPropagation, makeEventListener } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"handleClick"}</_components.span>
            {" = e => {\n  concole."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"Click!"'}</_components.span>
            {", e);\n};\n\n"}
            <_components.span className="hljs-title function_">
              {"makeEventListener"}
            </_components.span>
            {"("}
            <_components.span className="hljs-variable language_">{"window"}</_components.span>
            {", "}
            <_components.span className="hljs-string">{'"click"'}</_components.span>
            {", "}
            <_components.span className="hljs-title function_">
              {"stopPropagation"}
            </_components.span>
            {"(handleClick), "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// or in jsx:"}</_components.span>
            {"\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"div"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"onClick"}</_components.span>
                {"="}
                <_components.span className="hljs-string">
                  {"{stopPropagation(handleClick)}"}
                </_components.span>
                {" />"}
              </_components.span>
            </_components.span>
            {";\n"}
          </_components.code>
        </_components.pre>
        {"\n"}
        <_components.h3 id="stopimmediatepropagation">
          <_components.a className="header-anchor" href="#stopimmediatepropagation">
            {"#"}
          </_components.a>
          <_components.code>{"stopImmediatePropagation"}</_components.code>
        </_components.h3>
        {"\n"}
        <_components.p>
          {"Wraps event handler with "}
          <_components.code>{"e.stopImmediatePropagation()"}</_components.code>
          {" call."}
        </_components.p>
        {"\n"}
        <_components.pre>
          <_components.code className="hljs language-tsx">
            <_components.span className="hljs-keyword">{"import"}</_components.span>
            {" { stopImmediatePropagation, makeEventListener } "}
            <_components.span className="hljs-keyword">{"from"}</_components.span>{" "}
            <_components.span className="hljs-string">
              {'"@solid-primitives/event-listener"'}
            </_components.span>
            {";\n\n"}
            <_components.span className="hljs-keyword">{"const"}</_components.span>{" "}
            <_components.span className="hljs-title function_">{"handleClick"}</_components.span>
            {" = e => {\n  concole."}
            <_components.span className="hljs-title function_">{"log"}</_components.span>
            {"("}
            <_components.span className="hljs-string">{'"Click!"'}</_components.span>
            {", e);\n};\n\n"}
            <_components.span className="hljs-title function_">
              {"makeEventListener"}
            </_components.span>
            {"("}
            <_components.span className="hljs-variable language_">{"window"}</_components.span>
            {", "}
            <_components.span className="hljs-string">{'"click"'}</_components.span>
            {", "}
            <_components.span className="hljs-title function_">
              {"stopImmediatePropagation"}
            </_components.span>
            {"(handleClick), "}
            <_components.span className="hljs-literal">{"true"}</_components.span>
            {");\n"}
            <_components.span className="hljs-comment">{"// or in jsx:"}</_components.span>
            {"\n"}
            <_components.span className="xml">
              <_components.span className="hljs-tag">
                {"<"}
                <_components.span className="hljs-name">{"div"}</_components.span>{" "}
                <_components.span className="hljs-attr">{"onClick"}</_components.span>
                {"="}
                <_components.span className="hljs-string">
                  {"{stopImmediatePropagation(handleClick)}"}
                </_components.span>
                {" />"}
              </_components.span>
            </_components.span>
            {";\n"}
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
          <_components.a href="https://solidjs-community.github.io/solid-primitives/event-listener/">
            {"Live Site"}
          </_components.a>
        </_components.p>
        {"\n"}
        <_components.p>
          {"You may view a working example here: "}
          <_components.a href="https://codesandbox.io/s/solid-primitives-event-listener-elti5">
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
          <_components.a href="https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-listener/CHANGELOG.md">
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
      packageName="@solid-primitives/event-listener"
      name="event-listener"
      stage={3}
      packageList={[{ name: "event-listener", gzipped: "777 B", minified: "1.75 KB" }]}
      primitiveList={[
        { name: "createEventSignal", gzipped: "384 B", minified: "702 B" },
        { name: "createEventListenerMap", gzipped: "398 B", minified: "717 B" },
        { name: "WindowEventListener", gzipped: "357 B", minified: "583 B" },
        { name: "DocumentEventListener", gzipped: "360 B", minified: "591 B" },
        { name: "createEventListener", gzipped: "354 B", minified: "621 B" },
      ]}
    >
      <MDXContent />
    </PrimitivePageMain>
  );
}

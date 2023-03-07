
// Do not modify
// Generated from "./scripts/update-site/build-pages"

import PrimitivePageMain from "~/components/Primitives/PrimitivePageMain";
import CodePrimitive from "~/components/Primitives/CodePrimitive";
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
  return <><NoHydration><_components.p>{"Creates a primitive to get a list of media devices (microphones, speakers, cameras). There are filtered primitives for convenience reasons."}</_components.p>{"\n"}<_components.h2 id="installation"><_components.a className="header-anchor" href="#installation">{"#"}</_components.a>{"Installation"}</_components.h2>{"\n"}</NoHydration><CopyPackages packageName="@solid-primitives/devices" /><NoHydration>{"\n"}<_components.h2 id="how-to-use-it"><_components.a className="header-anchor" href="#how-to-use-it">{"#"}</_components.a>{"How to use it"}</_components.h2>{"\n"}<_components.h3 id="media-devices"><_components.a className="header-anchor" href="#media-devices">{"#"}</_components.a>{"Media Devices"}</_components.h3>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"const"}</_components.span>{" devices = "}<_components.span className="hljs-title function_">{"createDevices"}</_components.span>{"();\n\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" microphones = "}<_components.span className="hljs-title function_">{"createMicrophones"}</_components.span>{"();\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" speakers = "}<_components.span className="hljs-title function_">{"createSpeakers"}</_components.span>{"();\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" cameras = "}<_components.span className="hljs-title function_">{"createCameras"}</_components.span>{"();\n"}</_components.code></_components.pre>{"\n"}<_components.p>{"The filtered primitives are build so that they only triggered if the devices of their own kind changed."}</_components.p>{"\n"}<_components.h3 id="device-motion"><_components.a className="header-anchor" href="#device-motion">{"#"}</_components.a>{"Device Motion"}</_components.h3>{"\n"}<_components.pre><_components.code className="hljs language-ts"><_components.span className="hljs-keyword">{"const"}</_components.span>{" accelerometer = "}<_components.span className="hljs-title function_">{"createAccelerometer"}</_components.span>{"();\n"}<_components.span className="hljs-keyword">{"const"}</_components.span>{" gyroscope = "}<_components.span className="hljs-title function_">{"createGyroscope"}</_components.span>{"();\n"}</_components.code></_components.pre>{"\n"}<_components.h2 id="demo"><_components.a className="header-anchor" href="#demo">{"#"}</_components.a>{"Demo"}</_components.h2>{"\n"}<_components.p><_components.a href="https://solidjs-community.github.io/solid-primitives/devices/">{"Live Site"}</_components.a></_components.p>{"\n"}<_components.p>{"TODO"}</_components.p>{"\n"}<_components.h2 id="reference"><_components.a className="header-anchor" href="#reference">{"#"}</_components.a>{"Reference"}</_components.h2>{"\n"}<_components.p><_components.code data-code-primitive-name="createAccelerometer" data-code-package-name="devices">{"createAccelerometer"}</_components.code>{" : "}<_components.a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/devicemotion_event">{"devicemotion event"}</_components.a>{"\n"}<_components.code data-code-primitive-name="createGyroscope" data-code-package-name="devices">{"createGyroscope"}</_components.code>{" : "}<_components.a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event">{"deviceorientation event"}</_components.a></_components.p>{"\n"}<_components.h2 id="changelog"><_components.a className="header-anchor" href="#changelog">{"#"}</_components.a>{"Changelog"}</_components.h2>{"\n"}<_components.p>{"See "}<_components.a href="https://github.com/solidjs-community/solid-primitives/blob/main/packages/devices/CHANGELOG.md">{"CHANGELOG.md"}</_components.a></_components.p></NoHydration></>;
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
    <PrimitivePageMain packageName="@solid-primitives/devices" name="devices" stage={3} packageList={[{"name":"devices","gzipped":"618 B","minified":"1.59 KB"}]} primitiveList={[{"name":"createMicrophones","gzipped":"328 B","minified":"608 B"},{"name":"createSpeakers","gzipped":"329 B","minified":"607 B"},{"name":"createCameras","gzipped":"328 B","minified":"604 B"},{"name":"createAccelerometer","gzipped":"288 B","minified":"459 B"},{"name":"createGyroscope","gzipped":"282 B","minified":"489 B"},{"name":"createDevices","gzipped":"234 B","minified":"414 B"}]}>
      <MDXContent/>
    </PrimitivePageMain>
  )
}

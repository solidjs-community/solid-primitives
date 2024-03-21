import { getRequestEvent, HydrationScript, NoHydration } from "solid-js/web";
import { Asset, PageEvent } from "@solidjs/start/server";
import type { JSX } from "solid-js";

const assetMap = {
  style: (props: { attrs: JSX.StyleHTMLAttributes<HTMLStyleElement>; children?: JSX.Element }) => (
    <style {...props.attrs}>{props.children}</style>
  ),
  link: (props: { attrs: JSX.LinkHTMLAttributes<HTMLLinkElement> }) => <link {...props.attrs} />,
  script: (props: {
    attrs: JSX.ScriptHTMLAttributes<HTMLScriptElement>;
    key: string | undefined;
  }) => {
    return props.attrs.src ? (
      <script {...props.attrs} id={props.key}>
        {" "}
      </script>
    ) : null;
  },
};

export function renderAsset(asset: Asset) {
  let { tag, attrs: { key, ...attrs } = { key: undefined }, children } = asset as any;
  return (assetMap as any)[tag]({ attrs, key, children });
}

export default function () {
  const context = getRequestEvent() as PageEvent;
  // @ts-ignore
  const nonce = context?.nonce;
  return (
    <>
      <NoHydration>
        <HydrationScript />
        {context.assets.map((m: any) => renderAsset(m))}
        {nonce ? (
          <>
            <script
              nonce={nonce}
              innerHTML={`window.manifest = ${JSON.stringify(context.manifest)}`}
            />
            <script
              type="module"
              nonce={nonce}
              async
              src={
                import.meta.env.MANIFEST["client"]!.inputs[
                  import.meta.env.MANIFEST["client"]!.handler
                ]!.output.path
              }
            />
          </>
        ) : (
          <>
            <script innerHTML={`window.manifest = ${JSON.stringify(context.manifest)}`} />
            <script
              type="module"
              async
              src={
                import.meta.env.MANIFEST["client"]!.inputs[
                  import.meta.env.MANIFEST["client"]!.handler
                ]!.output.path
              }
            />
          </>
        )}
      </NoHydration>
    </>
  );
}

// Geist / Geist Mono TTFs for the OG cards (the site's --sb-font-text / --sb-font-mono). Satori can't read woff2, and the site's @fontsource-variable/geist
// only ships woff2 (and @vercel/og's bundled default is Geist Regular only, no bold). The root
// `geist` dependency has static TTFs; .storybook/main.ts already serves them from the same path.
// `?inline` embeds them as data URLs so the server bundle doesn't read any files at runtime.
//
// Only the OG server functions call `ogFonts()`, so client builds tree-shake this module away.
import regular from "../../../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf?inline";
import bold from "../../../node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf?inline";
import mono from "../../../node_modules/geist/dist/fonts/geist-mono/GeistMono-SemiBold.ttf?inline";

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 600 | 700; style: "normal" };

let fonts: OgFont[] | undefined;

function decode(dataUrl: string): ArrayBuffer {
  const bytes = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function ogFonts(): OgFont[] {
  return (fonts ??= [
    { name: "Geist", data: decode(regular), weight: 400, style: "normal" },
    { name: "Geist", data: decode(bold), weight: 700, style: "normal" },
    { name: "Geist Mono", data: decode(mono), weight: 600, style: "normal" },
  ]);
}

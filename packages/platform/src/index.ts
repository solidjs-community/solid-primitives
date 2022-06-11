const ua = navigator.userAgent;

/** Is running on browser */
export const isBrowser: boolean = true;

//
// Devices
//

/** Is Android Device */
export const isAndroid: boolean = /*#__PURE__*/ /Android/.test(ua);

/** Is Windows Device */
export const isWindows: boolean = /*#__PURE__*/ /(win32|win64|windows|wince)/i.test(ua);

/** Is Mac Device */
export const isMac: boolean = /*#__PURE__*/ /(macintosh|macintel|macppc|mac68k|macos)/i.test(ua);

/** Is IPhone Device */
export const isIPhone: boolean = /*#__PURE__*/ /iphone/i.test(ua);

/** Is IPad Device */
export const isIPad: boolean = /*#__PURE__*/ /ipad/i.test(ua) && navigator.maxTouchPoints > 1;

/** Is IPod Device */
export const isIPod: boolean = /*#__PURE__*/ /ipod/i.test(ua);

/** Is IOS Device */
export const isIOS: boolean = /*#__PURE__*/ /(iphone|ipad|ipod)/i.test(ua);

/** Is Apple Device */
export const isAppleDevice: boolean = isIOS || isMac;

/** is a Mobile Browser */
export const isMobile: boolean = /*#__PURE__*/ /Mobi/.test(ua);

//
// Browsers
//

/** Browser is Mozilla Firefox */
export const isFirefox: boolean = /*#__PURE__*/ /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(ua);

/** Browser is Opera */
export const isOpera: boolean = /*#__PURE__*/ !!(window as any).opr;

/** is Chromium-based browser */
export const isChromium: boolean = /*#__PURE__*/ !!(window as any).chrome;

/** Browser is Edge */
export const isEdge: boolean = /*#__PURE__*/ /Edg/.test(ua);

/** Browser is Chrome */
export const isChrome: boolean =
  isChromium && navigator.vendor === "Google Inc." && !isOpera && !isEdge;

//
// Rendering Engines
//

/** Browser using Gecko Rendering Engine */
export const isGecko: boolean = /*#__PURE__*/ /Gecko\/[0-9.]+/.test(ua);

/** Browser using Blink Rendering Engine */
export const isBlink: boolean = /*#__PURE__*/ /Chrome\/[0-9.]+/.test(ua);

/** Browser using WebKit Rendering Engine */
export const isWebKit: boolean = /*#__PURE__*/ /AppleWebKit\/[0-9.]+/.test(ua) && !isBlink;

/** Browser using Presto Rendering Engine */
export const isPresto: boolean = /*#__PURE__*/ /Opera\/[0-9.]+/.test(ua);

/** Browser using Trident Rendering Engine */
export const isTrident: boolean = /*#__PURE__*/ /Trident\/[0-9.]+/.test(ua);

/** Browser using EdgeHTML Rendering Engine */
export const isEdgeHTML: boolean = /*#__PURE__*/ /Edge\/[0-9.]+/.test(ua);

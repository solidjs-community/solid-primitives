import { Accessor, createSignal } from "solid-js";

/**
 * A primitive for sharing on social media and beyond.
 *
 * @param {network} Network Network that the share should occur on
 * @param {url} string The URL to be shared
 * @param {title} string Title of the content that is being shared
 * @param {description} string description of the content that is being shared
 * @param {quote} string If applicable, the quote to share
 * @param {hashtags} string Optional hashtags to share
 * @param {twitterUser} string Name of the twitter user
 * @param {media} string Associated media
 * @param {tag} string A tag to associate with the share
 * @param {popup} SharePopupOptions An object representing the pop-up window controls
 * @param {controller} Window Controller to bind the share to
 * @return Returns a share, close and is sharing signal.
 */
const createSocialShare = (
  options: () => {
    network?: Network;
    url: string;
    title: string;
    description: string;
    quote?: string;
    hashtags?: string;
    twitterUser?: string;
    media?: string;
    tag?: string;
    popup?: SharePopupOptions;
  } = () => ({
    url: "",
    title: "",
    description: ""
  }),
  controller: Window = window
): [
  share: (network: Network | undefined) => void,
  close: () => void,
  sharing: Accessor<boolean>
] => {
  const [sharing, setSharing] = createSignal(false);
  let popupInterval: null | ReturnType<typeof setTimeout> = null;
  let popupWindow: null | Window;
  let popup = {
    height: 636,
    width: 436,
    popupLeft: 0,
    popupRight: 0,
    popupTop: 0
  };
  if (options().popup) {
    popup = { ...popup, ...options().popup };
  }
  const rawLink = (network: Network) => {
    const ua = navigator.userAgent.toLowerCase();
    /**
     * On IOS, SMS sharing link need a special formatting
     * Source: https://weblog.west-wind.com/posts/2013/Oct/09/Prefilling-an-SMS-on-Mobile-Devices-with-the-sms-Uri-Scheme#Body-only
     */
    if (network === "sms" && (ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1)) {
      return network.replace(":?", ":&");
    }
    return network;
  };
  const encodedHashtags = (network: Network) => {
    if (network === "facebook" && options().hashtags) {
      return "%23" + options().hashtags!.split(",")[0];
    }
    return options().hashtags;
  };
  const shareLink = (network: Network) => {
    let link = rawLink(network);
    /**
     * Twitter sharing shouldn't include empty parameter
     * Source: https://github.com/nicolasbeauvais/vue-social-sharing/issues/143
     */
    if (network === "twitter") {
      if (!options().hashtags) link = link.replace("&hashtags=@h", "");
      if (!options().twitterUser) link = link.replace("@tu", "");
    }
    return link
      .replace(/@tu/g, "&via=" + encodeURIComponent(options().twitterUser || ""))
      .replace(/@u/g, encodeURIComponent(options().url))
      .replace(/@t/g, encodeURIComponent(options().title))
      .replace(/@d/g, encodeURIComponent(options().description))
      .replace(/@q/g, encodeURIComponent(options().quote || ""))
      .replace(/@h/g, encodedHashtags(network) || "")
      .replace(/@m/g, encodeURIComponent(options().media || ""));
  };
  const resizePopup = () => {
    const width =
      controller.innerWidth || document.documentElement.clientWidth || controller.screenX;
    const height =
      controller.innerHeight || document.documentElement.clientHeight || controller.screenY;
    const systemZoom = width / controller.screen.availWidth;
    popup.popupLeft =
      (width - popup.width) / 2 / systemZoom +
      (controller.screenLeft !== undefined ? controller.screenLeft : controller.screenX);
    popup.popupTop =
      (height - popup.height) / 2 / systemZoom +
      (controller.screenTop !== undefined ? controller.screenTop : controller.screenY);
  };
  const close = () => {
    controller && controller.close();
    setSharing(false);
  };
  const share = (network?: Network) => {
    network = network || options().network || "";
    resizePopup();
    // If a popup window already exist, we close it and trigger a change event.
    if (controller && popupInterval) {
      clearInterval(popupInterval);
      // Force close (for Facebook)
      controller.close();
    }
    popupWindow = controller.open(
      shareLink(network),
      "sharer-" + network,
      ",height=" +
        popup.height +
        ",width=" +
        popup.width +
        ",left=" +
        popup.popupLeft +
        ",top=" +
        popup.popupTop +
        ",screenX=" +
        popup.popupLeft +
        ",screenY=" +
        popup.popupTop
    );
    // If popup are prevented (AdBlocker, Mobile App context..), popup.window stays undefined and we can't display it
    if (!popupWindow) return;
    popupWindow.focus();
    popupInterval = setInterval(() => {
      if (!popupWindow || popupWindow.closed) {
        clearInterval(popupInterval!);
        popupWindow = null;
      }
    }, 500);
    setSharing(true);
  };
  return [share, close, sharing];
};

export default createSocialShare;

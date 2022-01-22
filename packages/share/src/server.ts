import { Accessor } from "solid-js";

const createSocialShare = (
  _options: () => {
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
  _controller: Window = window
): [
  share: (network: Network | undefined) => void,
  close: () => void,
  sharing: Accessor<boolean>
] => {
  return [
    () => {
      /*noop*/
    },
    () => {
      /*noop*/
    },
    () => false
  ];
};

export default createSocialShare;

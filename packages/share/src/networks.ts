/**
 * The below uses short replacement Markers to reduce the final bundle size.
 *
 * Properties:
 * @u = url
 * @t = title
 * @d = description
 * @q = quote
 * @h = hashtags
 * @m = media
 * @tu = twitterUser
 */
export type Network = string;

export const BAIDU: Network = "http://cang.baidu.com/do/add?iu=@u&it=@t";
export const BUFFER: Network = "https://bufferapp.com/add?text=@t&url=@u";
export const EMAIL: Network = "mailto:?subject=@t&body=@u%0D%0A@d";
export const EVERNOTE: Network = "https://www.evernote.com/clip.action?url=@u&title=@t";
export const BLUESKY: Network = "https://bsky.app/intent/compose?text=@t%0D%0A@u%0D%0A@d";
export const FACEBOOK: Network =
  "https://www.facebook.com/sharer/sharer.php?u=@u&title=@t&description=@d&quote=@q&hashtag=@h";
export const FLIPBOARD: Network =
  "https://share.flipboard.com/bookmarklet/popout?v=2&url=@u&title=@t";
export const HACKERNEWS: Network = "https://news.ycombinator.com/submitlink?u=@u&t=@t";
export const INSTAPAPER: Network = "http://www.instapaper.com/edit?url=@u&title=@t&description=@d";
export const LINE: Network = "http://line.me/R/msg/text/?@t%0D%0A@u%0D%0A@d";
export const LINKEDIN: Network = "https://www.linkedin.com/sharing/share-offsite/?url=@u";
export const MESSANGER: Network = "fb-messenger://share/?link=@u";
/** @deprecated Use MESSENGER instead - this will be removed in a future version */
export const MESSANGER: Network = MESSENGER;
export const ODNOKLASSNIKI: Network =
  "https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=@u&st.comments=@t";
export const PINTEREST: Network =
  "https://pinterest.com/pin/create/button/?url=@u&media=@m&description=@t";
export const POCKET: Network = "https://getpocket.com/save?url=@u&title=@t";
export const QUORA: Network = "https://www.quora.com/share?url=@u&title=@t";
export const REDDIT: Network = "https://www.reddit.com/submit?url=@u&title=@t";
export const SKYPE: Network = "https://web.skype.com/share?url=@t%0D%0A@u%0D%0A@d";
export const SMS: Network = "sms:?body=@t%0D%0A@u%0D%0A@d";
export const STUMBLEUPON: Network = "https://www.stumbleupon.com/submit?url=@u&title=@t";
export const TELEGRAM: Network = "https://t.me/share/url?url=@u&text=@t%0D%0A@d";
export const TUMBLR: Network = "https://www.tumblr.com/share/link?url=@u&name=@t&description=@d";
export const TWITTER: Network = "https://twitter.com/intent/tweet?text=@t&url=@u&hashtags=@h@tu";
export const X: Network = "https://www.x.com/intent/tweet?text=@t&url=@u&hashtags=@h@tu";
export const VIBER: Network = "viber://forward?text=@t%0D%0A@u%0D%0A@d";
export const VK: Network =
  "https://vk.com/share.php?url=@u&title=@t&description=@d&image=@m&noparse=true";
export const WEIBO: Network = "http://service.weibo.com/share/share.php?url=@u&title=@t&pic=@m";
export const WHATSAPP: Network = "https://api.whatsapp.com/send?text=@t%0D%0A@u%0D%0A@d";
export const WORDPRESS: Network = "https://wordpress.com/press-this.php?u=@u&t=@t&s=@d&i=@m";
export const XING: Network = "https://www.xing.com/social/share/spi?op=share&url=@u&title=@t";
export const YAMMER: Network =
  "https://www.yammer.com/messages/new?login=true&status=@t%0D%0A@u%0D%0A@d";

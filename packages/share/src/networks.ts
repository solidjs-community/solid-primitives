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
export const baidu: Network = "http://cang.baidu.com/do/add?iu=@u&it=@t";
export const buffer: Network = "https://bufferapp.com/add?text=@t&url=@u";
export const email: Network = "mailto:?subject=@t&body=@u%0D%0A@d";
export const evernote: Network = "https://www.evernote.com/clip.action?url=@u&title=@t";
export const facebook: Network =
  "https://www.facebook.com/sharer/sharer.php?u=@u&title=@t&description=@d&quote=@q&hashtag=@h";
export const flipboard: Network =
  "https://share.flipboard.com/bookmarklet/popout?v=2&url=@u&title=@t";
export const hackernews: Network = "https://news.ycombinator.com/submitlink?u=@u&t=@t";
export const instapaper: Network = "http://www.instapaper.com/edit?url=@u&title=@t&description=@d";
export const line: Network = "http://line.me/R/msg/text/?@t%0D%0A@u%0D%0A@d";
export const linkedin: Network = "https://www.linkedin.com/sharing/share-offsite/?url=@u";
export const messenger: Network = "fb-messenger://share/?link=@u";
export const odnoklassniki: Network =
  "https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=@u&st.comments=@t";
export const pinterest: Network =
  "https://pinterest.com/pin/create/button/?url=@u&media=@m&description=@t";
export const pocket: Network = "https://getpocket.com/save?url=@u&title=@t";
export const quora: Network = "https://www.quora.com/share?url=@u&title=@t";
export const reddit: Network = "https://www.reddit.com/submit?url=@u&title=@t";
export const skype: Network = "https://web.skype.com/share?url=@t%0D%0A@u%0D%0A@d";
export const sms: Network = "sms:?body=@t%0D%0A@u%0D%0A@d";
export const stumbleupon: Network = "https://www.stumbleupon.com/submit?url=@u&title=@t";
export const telegram: Network = "https://t.me/share/url?url=@u&text=@t%0D%0A@d";
export const tumblr: Network = "https://www.tumblr.com/share/link?url=@u&name=@t&description=@d";
export const twitter: Network = "https://twitter.com/intent/tweet?text=@t&url=@u&hashtags=@h@tu";
export const viber: Network = "viber://forward?text=@t%0D%0A@u%0D%0A@d";
export const vk: Network =
  "https://vk.com/share.php?url=@u&title=@t&description=@d&image=@m&noparse=true";
export const weibo: Network = "http://service.weibo.com/share/share.php?url=@u&title=@t&pic=@m";
export const whatsapp: Network = "https://api.whatsapp.com/send?text=@t%0D%0A@u%0D%0A@d";
export const wordpress: Network = "https://wordpress.com/press-this.php?u=@u&t=@t&s=@d&i=@m";
export const xing: Network = "https://www.xing.com/social/share/spi?op=share&url=@u&title=@t";
export const yammer: Network = "https://www.yammer.com/messages/new?login=true&status=@t%0D%0A@u%0D%0A@d";

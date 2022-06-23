declare type ClipboardSetter = (data: string | ClipboardItem[]) => Promise<void>;
declare type NewClipboardItem = (type: string, data: ClipboardItemData) => ClipboardItem;
declare type HighlightModifier = (el: any) => void;
declare type Highlighter = (start?: number, end?: number) => HighlightModifier;
declare type CopyToClipboardOptions = {
  value?: any;
  setter?: ClipboardSetter;
  highlight?: HighlightModifier;
};
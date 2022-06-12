
type AudioSource = string
  | undefined
  | HTMLAudioElement
  | MediaSource
  | (string & MediaSource);

declare type AudioEventHandlers = { [K in keyof HTMLMediaElementEventMap]?: (event: HTMLMediaElementEventMap[K]) => void; }; 

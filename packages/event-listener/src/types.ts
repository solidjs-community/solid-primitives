import { JSX } from "solid-js";

export type EventListenerOptions = boolean | AddEventListenerOptions;

export type TargetWithEventMap =
  | Window
  | Document
  | XMLDocument
  | HTMLBodyElement
  | HTMLFrameSetElement
  | HTMLMediaElement
  | HTMLVideoElement
  | HTMLElement
  | SVGSVGElement
  | SVGElement
  | MathMLElement
  | Element
  | AbortSignal
  | AbstractWorker
  | Animation
  | BroadcastChannel
  | CSSAnimation
  | CSSTransition
  | FileReader
  | IDBDatabase
  | IDBOpenDBRequest
  | IDBRequest
  | IDBTransaction
  | MediaDevices
  | MediaKeySession
  | MediaQueryList
  | MediaRecorder
  | MediaSource
  | MediaStream
  | MediaStreamTrack
  | MessagePort
  | Notification
  | PaymentRequest
  | Performance
  | PermissionStatus
  | PictureInPictureWindow
  | RemotePlayback
  | ScreenOrientation
  | ServiceWorker
  | ServiceWorkerContainer
  | ServiceWorkerRegistration
  | ShadowRoot
  | SharedWorker
  | SourceBuffer
  | SourceBufferList
  | SpeechSynthesis
  | SpeechSynthesisUtterance
  | VisualViewport
  | WebSocket
  | Worker
  | XMLHttpRequest
  | XMLHttpRequestEventTarget
  | XMLHttpRequestUpload
  | EventSource;

export type EventMapOf<Target> = Target extends Window
  ? WindowEventMap
  : Target extends Document | XMLDocument
  ? DocumentEventMap
  : Target extends HTMLBodyElement
  ? HTMLBodyElementEventMap
  : Target extends HTMLFrameSetElement
  ? HTMLFrameSetElementEventMap
  : Target extends HTMLMediaElement
  ? HTMLMediaElementEventMap
  : Target extends HTMLVideoElement
  ? HTMLVideoElementEventMap
  : Target extends HTMLElement
  ? HTMLElementEventMap
  : Target extends SVGSVGElement
  ? SVGSVGElementEventMap
  : Target extends SVGElement
  ? SVGElementEventMap
  : Target extends MathMLElement
  ? MathMLElementEventMap
  : Target extends Element
  ? ElementEventMap
  : Target extends AbortSignal
  ? AbortSignalEventMap
  : Target extends AbstractWorker
  ? AbstractWorkerEventMap
  : Target extends Animation
  ? AnimationEventMap
  : Target extends BroadcastChannel
  ? BroadcastChannelEventMap
  : Target extends CSSAnimation
  ? AnimationEventMap
  : Target extends CSSTransition
  ? AnimationEventMap
  : Target extends FileReader
  ? FileReaderEventMap
  : Target extends IDBDatabase
  ? IDBDatabaseEventMap
  : Target extends IDBOpenDBRequest
  ? IDBOpenDBRequestEventMap
  : Target extends IDBRequest
  ? IDBRequestEventMap
  : Target extends IDBTransaction
  ? IDBTransactionEventMap
  : Target extends MediaDevices
  ? MediaDevicesEventMap
  : Target extends MediaKeySession
  ? MediaKeySessionEventMap
  : Target extends MediaQueryList
  ? MediaQueryListEventMap
  : Target extends MediaRecorder
  ? MediaRecorderEventMap
  : Target extends MediaSource
  ? MediaSourceEventMap
  : Target extends MediaStream
  ? MediaStreamEventMap
  : Target extends MediaStreamTrack
  ? MediaStreamTrackEventMap
  : Target extends MessagePort
  ? MessagePortEventMap
  : Target extends Notification
  ? NotificationEventMap
  : Target extends PaymentRequest
  ? PaymentRequestEventMap
  : Target extends Performance
  ? PerformanceEventMap
  : Target extends PermissionStatus
  ? PermissionStatusEventMap
  : Target extends PictureInPictureWindow
  ? PictureInPictureWindowEventMap
  : Target extends RemotePlayback
  ? RemotePlaybackEventMap
  : Target extends ScreenOrientation
  ? ScreenOrientationEventMap
  : Target extends ServiceWorker
  ? ServiceWorkerEventMap
  : Target extends ServiceWorkerContainer
  ? ServiceWorkerContainerEventMap
  : Target extends ServiceWorkerRegistration
  ? ServiceWorkerRegistrationEventMap
  : Target extends ShadowRoot
  ? ShadowRootEventMap
  : Target extends SharedWorker
  ? AbstractWorkerEventMap
  : Target extends SourceBuffer
  ? SourceBufferEventMap
  : Target extends SourceBufferList
  ? SourceBufferListEventMap
  : Target extends SpeechSynthesis
  ? SpeechSynthesisEventMap
  : Target extends SpeechSynthesisUtterance
  ? SpeechSynthesisUtteranceEventMap
  : Target extends VisualViewport
  ? VisualViewportEventMap
  : Target extends WebSocket
  ? WebSocketEventMap
  : Target extends Worker
  ? WorkerEventMap
  : Target extends XMLHttpRequest
  ? XMLHttpRequestEventMap
  : Target extends XMLHttpRequestEventTarget
  ? XMLHttpRequestEventTargetEventMap
  : Target extends XMLHttpRequestUpload
  ? XMLHttpRequestEventTargetEventMap
  : Target extends EventSource
  ? EventSourceEventMap
  : never;

export type EventListenerDirectiveProps = [
  type: string,
  handler: (e: any) => void,
  options?: EventListenerOptions,
];

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // directive types are very premissive to prevent type errors from incompatible types, since props cannot be generic
      eventListener: EventListenerDirectiveProps;
    }
  }
}

// only here so the `JSX` import won't be shaken off the tree:
export type E = JSX.Element;

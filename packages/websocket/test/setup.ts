import { WSMessage } from "../src";
/**
 * Connection state of the WebSocket:
 * - 0 Connecting
 * - 1 Open
 * - 2 Closing
 * - 3 Closed
 */
type WSReadyState = 0 | 1 | 2 | 3;

declare global {
  const WSMessages: Map<WebSocket | MockWebSocket, WSMessage[]>;
}

(global as any).WSMessages = new Map<WebSocket | MockWebSocket, WSMessage>();

const readyStates = new Map<MockWebSocket, WSReadyState>();

class MockWebSocket extends EventTarget {
  public CONNECTING = 0;
  public OPEN = 1;
  public CLOSING = 2;
  public CLOSED = 3;
  public readyState: WSReadyState = 0;
  constructor(public url: string, public protocol?: string | string[]) {
    super();
    WSMessages.set(this, [] as WSMessage[]);
    setTimeout(() => {
      this.readyState = 1;
      this.dispatchEvent(new Event("open"));
    }, 10);
    this.addEventListener("error", this.close.bind(this));
    this.addEventListener(
      "close",
      function (this: MockWebSocket) {
        this.readyState = 3;
        WSMessages.delete(this);
      }.bind(this),
    );
  }
  close() {
    this.readyState = 2;
    setTimeout(
      function (this: MockWebSocket) {
        this.dispatchEvent(new Event("close"));
      }.bind(this),
      50,
    );
  }
  send(msg: string | ArrayBufferLike | ArrayBufferView | Blob) {
    if (this.readyState !== 1) throw new Error("cannot sent through a non-open connection");
    const sent = WSMessages.get(this);
    sent?.push(msg);
  }

  get binaryType() {
    return "arraybuffer";
  }
  get bufferedAmount() {
    return 0;
  }
  get extensions() {
    return "";
  }
}

(global as any).WebSocket = MockWebSocket;

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
  const WSMessages: Map<WebSocket | MockWebSocket, WSMessage[]>
}

(global as any).WSMessages = new Map<WebSocket | MockWebSocket, WSMessage>();

class MockWebSocket extends EventTarget {
  private state: WSReadyState = 0;
  constructor(
    public url: string,
    public protocol?: string | string[]
  ) {
    super();
    WSMessages.set(this, [] as WSMessage[]);
    setTimeout(() => {
      this.state = 1;
      this.dispatchEvent(new Event("open"));
    });
    this.addEventListener("error", this.close.bind(this));
    this.addEventListener("close", function(this: MockWebSocket) { 
      this.state = 3;
      WSMessages.delete(this);
    }.bind(this));
  }
  close() {
    this.state = 2;
    setTimeout(function(this: MockWebSocket) {
      this.dispatchEvent(new Event("close"));
    }.bind(this), 50);
  }
  send(msg: string | ArrayBufferLike | ArrayBufferView | Blob) {
    if (this.state !== 1)
      throw new Error("cannot sent through a non-open connection")
    const sent = WSMessages.get(this);
    sent?.push(msg);
  }

  get binaryType() {
    return "arraybuffer";
  }
  get bufferedAmount() {
    return 0;
  }
  get readyState() {
    return this.state;
  }
  get extensions() {
    return "";
  }
}

(global as any).WebSocket = MockWebSocket;

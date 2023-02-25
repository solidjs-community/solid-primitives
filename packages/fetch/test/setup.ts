class ResponseMock {
  constructor(
    public body: BodyInit | null,
    private init: ResponseInit & { redirected: boolean; type: "cors" | "basic"; url: string },
  ) {}
  get status() {
    return this.init.status || -1;
  }
  get statusText() {
    return this.init.statusText || "";
  }
  get headers() {
    return this.init.headers instanceof Headers
      ? this.init.headers
      : new Headers(this.init.headers) || new Headers();
  }
  get ok() {
    return this.status >= 200 && this.status < 300;
  }
  get redirected() {
    return !!this.init.redirected;
  }
  get type() {
    return this.init.type || "basic";
  }
  get url() {
    return this.init.url || "";
  }
  get bodyUsed() {
    return !!this.body;
  }
  get arrayBuffer() {
    return () => {
      const bodyArray = (this.body ?? "").toString().split("");
      const buffer = new ArrayBuffer(bodyArray.length);
      const view = new Uint8Array(buffer);
      bodyArray.forEach((char, index) => {
        view[index] = char.charCodeAt(0);
      });
      return Promise.resolve(buffer);
    };
  }
  get formData() {
    return () => Promise.resolve(new FormData());
  }
  get clone() {
    return () => new Response(this.body, this.init);
  }
  get blob() {
    return () =>
      Promise.resolve(
        new Blob([(this.body ?? "").toString()], {
          type: this.headers.get("content-type") || "text/plain",
        }),
      );
  }
  get text() {
    return () => Promise.resolve((this.body ?? "").toString());
  }
  get json() {
    return () => Promise.resolve(JSON.parse((this.body ?? "").toString()));
  }
}
((globalThis.window as any) || {}).Response = ResponseMock;
(globalThis as any).Response = ResponseMock;

class HeadersMock {
  private headers: Record<string, string> = {};
  constructor(headers: Record<string, string>) {
    Object.entries(headers || {}).forEach(([key, value]) => {
      this.headers[key.toLowerCase()] = value;
    });
  }
  append(key: string, value: string) {
    this.headers[key.toLowerCase()] = `${this.headers[key.toLowerCase()]}${
      this.headers.key.toLowerCase() ? " " : ""
    }${value}`;
    return this.headers[key.toLowerCase()];
  }
  delete(key: string) {
    delete this.headers[key.toLowerCase()];
    return undefined;
  }
  entries() {
    return Object.entries(this.headers);
  }
  forEach(cb: (key: string, value: string) => void) {
    Object.entries(this.headers).forEach(([key, value]) => cb(key, value));
  }
  get(key: string) {
    return this.headers[key.toLowerCase()];
  }
  has(key: string) {
    return this.headers.hasOwnProperty(key.toLowerCase());
  }
  keys() {
    return Object.keys(this.headers);
  }
  set(key: string, value: string) {
    this.headers[key.toLowerCase()] = value;
    return this.headers[key.toLowerCase()];
  }
  values() {
    return Object.values(this.headers);
  }
}
((globalThis.window as any) || {}).Headers = HeadersMock;
(globalThis as any).Headers = HeadersMock;

// we need to remove this in order to test the server mock
Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  enumerable: true,
  value: undefined,
});

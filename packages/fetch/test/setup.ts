if (!window.Response) {
  class ResponseMock {
    constructor(
      public body: BodyInit | null,
      private init: ResponseInit & { redirected: boolean; type: "cors" | "basic"; url: string }
    ) {}
    get status() {
      return this.init.status || -1;
    }
    get statusText() {
      return this.init.statusText || "";
    }
    get headers() {
      return new Headers(this.init.headers) || new Headers();
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
        const bodyArray = this.body.toString().split("");
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
          new Blob([this.body.toString()], {
            type: this.headers.get("content-type") || "text/plain"
          })
        );
    }
    get text() {
      return () => Promise.resolve(this.body.toString());
    }
    get json() {
      return () => Promise.resolve(JSON.parse(this.body.toString()));
    }
  }
  (window as any).Response = ResponseMock;
}

class LocalStorageMock {
  store: any;
  length: number;
  constructor() {
    this.store = {};
    this.length = 0;
  }

  clear() {
    this.store = {};
    this.length = 0;
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  key(key: number) {
    return Object.keys(this.store)[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
    this.length = Object.keys(this.store).length;
  }

  removeItem(key: string) {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  }
}

localStorage = new LocalStorageMock();

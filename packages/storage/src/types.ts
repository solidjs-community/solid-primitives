export type StorageWithOptions<O> = {
  clear: () => void;
  getItem: (key: string, options?: O) => string | null;
  getAll?: () => { [key: string]: any };
  setItem: (key: string, value: string, options?: O) => void;
  removeItem: (key: string) => void;
  key: (index: number) => string | null;
  readonly length: number | undefined;
  [key: string]: any;
};

export type StorageDeserializer<T, O> = (value: string, key: string, options?: O) => T;

export type StorageSerializer<T, O> = (value: T, key: string, options?: O) => string;

export type AnyStorageProps<A, O, T> = {
  /** a Storage-like API, e.g. localStorage */
  api?: A | A[];
  /** a function that parses the stored data after retrieval */
  deserializer?: StorageDeserializer<T, O>;
  /** a function that serializes the data before storing */
  serializer?: StorageSerializer<T, O>;
  /** options for the Storage-like API, if supported */
  options?: O;
  /** a prefix for the keys */
  prefix?: string;
  /** should the storage be synchronized via Storage events, default is `true`? */
  sync?: boolean;
  /** errors will be thrown and need to be caught in an ErrorBoundary, default is `false` */
  throw?: boolean;
};

export type StringStorageProps<A, O, T = string> = AnyStorageProps<A, O, T>;

export type StorageProps<T, A, O> = T extends string
  ? StringStorageProps<A, O>
  : AnyStorageProps<A, O, T>;

export type StorageObject<T> = Record<string, T>;

export type StorageSetter<T, O> = (key: string, value: T, options?: O) => void;

export type StorageActions<T> = {
  remove: (key: string) => void;
  clear: () => void;
  error: () => Error | undefined;
  toJSON: () => { [key: string]: T };
};

export type AsyncStorage = {
  clear?: () => Promise<void> | void;
  getItem: (key: string) => Promise<string | null> | string | null;
  getAll?: () => Promise<any>;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  key: (index: number) => Promise<string | null> | string | null;
  readonly length: Promise<number> | number | undefined;
  [key: string]: any;
};
export type AsyncStorageWithOptions<O> = {
  clear?: () => Promise<void> | void;
  getItem: (key: string, options?: O) => Promise<string | null> | string | null;
  getAll?: () => Promise<any>;
  setItem: (key: string, value: string, options?: O) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  key: (index: number) => Promise<string | null> | string | null;
  readonly length: Promise<number> | number | undefined;
  [key: string]: any;
};

export type AsyncStorageObject<T> = Record<string, Promise<T | null>>;

export type AsyncStorageSetter<T, O> = (key: string, value: T, options?: O) => Promise<void> | void;

export type AsyncStorageActions<T> = {
  remove: (key: string) => Promise<void> | void;
  clear: () => Promise<void> | void;
  error: () => Error | undefined;
  toJSON: () => Promise<{ [key: string]: T }>;
};

export type StorageSignalProps<T, A, O> = StorageProps<T, A, O> & {
  /** signal equality checker */
  equals?: false | ((prev: T, next: T) => boolean);
  /** signal name used in dev mode */
  name?: string;
  internal?: boolean;
  /** should the storage be synchronized via Storage events, default is `true`? */
  sync?: boolean;
  /** errors will be thrown and need to be caught in an ErrorBoundary, default is `false` */
  throw?: boolean;
};

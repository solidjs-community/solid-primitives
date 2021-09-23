export type StorageWithOptions<O> = {
  clear: () => void;
  getItem: (key: string, options?: O) => string | null;
  setItem: (key: string, value: string, options?: O) => void;
  removeItem: (key: string) => void;
  key: (index: number) => string | null;
  readonly length: number | undefined;
  [key: string]: any;
};

export type StorageDeserializer<T, O> = (value: string, key: string, options?: O) => T;

export type StorageSerializer<T, O> = (value: T, key: string, options?: O) => string;

export type StringStorageProps<A, O, T = string> = {
  api?: A | A[];
  deserializer?: StorageDeserializer<T, O>;
  serializer?: StorageSerializer<T, O>;
  options?: O;
  prefix?: string;
};

export type AnyStorageProps<A, O, T> = {
  api?: A | A[];
  deserializer: StorageDeserializer<T, O>;
  serializer: StorageSerializer<T, O>;
  options?: O;
  prefix?: string;
};

export type StorageProps<T, A, O> = T extends string
  ? StringStorageProps<A, O>
  : AnyStorageProps<A, O, T>;

export type StorageObject<T> = Record<string, T>;

export type StorageSetter<T, O> = (key: string, value: T, options?: O) => void;

export type StorageActions<T> = {
  remove: (key: string) => void;
  clear: () => void;
  toJSON: () => { [key: string]: T };
}

export type AsyncStorage = {
  clear?: () => Promise<void> | void;
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  key: (index: number) => Promise<string | null> | string | null;
  readonly length: number | undefined;
  [key: string]: any;
};
export type AsyncStorageWithOptions<O> = {
  clear?: () => Promise<void> | void;
  getItem: (key: string, options?: O) => Promise<string | null> | string | null;
  setItem: (key: string, value: string, options?: O) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  key: (index: number) => Promise<string | null> | string | null;
  readonly length: number | undefined;
  [key: string]: any;
};

export type AsyncStorageObject<T> = Record<string, Promise<T | null>>;

export type AsyncStorageSetter<T, O> = (key: string, value: T, options?: O) => Promise<void> | void;

export type AsyncStorageActions<T> = {
  remove: (key: string) => Promise<void> | void;
  clear: () => Promise<void> | void;
  toJSON: () => Promise<{ [key: string]: T }>;
}

export type StorageSignalProps<T, A, O> = StorageProps<T, A, O> & {
  equals?: false | ((prev: T, next: T) => boolean) | undefined;
  name?: string | undefined;
  internal?: boolean | undefined;
};

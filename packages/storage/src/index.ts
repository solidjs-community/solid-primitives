export type {
  StorageWithOptions,
  StorageDeserializer,
  StorageSerializer,
  StringStorageProps,
  AnyStorageProps,
  StorageProps,
  StorageObject,
  StorageSetter,
  AsyncStorage,
  AsyncStorageWithOptions,
  AsyncStorageObject,
  AsyncStorageSetter,
  StorageSignalProps,
} from "./types.js";

import {
  createStorage,
  createAsyncStorage,
  createStorageSignal,
  createLocalStorage,
  createSessionStorage,
} from "./storage.js";
import { CookieOptions, cookieStorage, createCookieStorage } from "./cookies.js";
import { addClearMethod } from "./tools.js";
import { PersistenceOptions, makePersisted } from "./persisted.js";
export {
  createStorage,
  createAsyncStorage,
  createStorageSignal,
  createLocalStorage,
  createCookieStorage,
  createSessionStorage,
  type CookieOptions,
  cookieStorage,
  addClearMethod,
  type PersistenceOptions,
  makePersisted,
};

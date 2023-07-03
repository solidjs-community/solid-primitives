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
} from "./types";

import {
  createStorage,
  createAsyncStorage,
  createStorageSignal,
  createLocalStorage,
  createSessionStorage,
} from "./storage";
import { CookieOptions, cookieStorage, createCookieStorage } from "./cookies";
import { addClearMethod } from "./tools";
import { PersistenceOptions, makePersisted } from "./persisted";
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

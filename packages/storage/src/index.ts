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
import { type CookieOptions, cookieStorage, createCookieStorage } from "./cookies.js";
import { tauriStorage } from "./tauri.js";
import { addClearMethod, addWithOptionsMethod, multiplexStorage } from "./tools.js";
import {
  type PersistenceOptions,
  type PersistenceSyncAPI,
  type PersistenceSyncData,
  type PersistenceBaseOptions,
  type PersistenceSyncCallback,
  makePersisted,
  multiplexSync,
  storageSync,
  messageSync,
  wsSync,
} from "./persisted.js";
export {
  createStorage,
  createAsyncStorage,
  createStorageSignal,
  createLocalStorage,
  createCookieStorage,
  createSessionStorage,
  type CookieOptions,
  cookieStorage,
  tauriStorage,
  addClearMethod,
  addWithOptionsMethod,
  multiplexStorage,
  type PersistenceBaseOptions,
  type PersistenceOptions,
  type PersistenceSyncCallback,
  type PersistenceSyncData,
  type PersistenceSyncAPI,
  makePersisted,
  multiplexSync,
  storageSync,
  wsSync,
  messageSync,
};

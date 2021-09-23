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
  StorageSignalProps
} from "./types";

import {
  createStorage,
  createAsyncStorage,
  createStorageSignal,
  createLocalStorage,
  createSessionStorage
} from "./storage";
import { CookieOptions, cookieStorage } from "./cookies";
import { addClearMethod } from "./tools";
export {
  createStorage,
  createAsyncStorage,
  createStorageSignal,
  createLocalStorage,
  createSessionStorage,
  CookieOptions,
  cookieStorage,
  addClearMethod
};

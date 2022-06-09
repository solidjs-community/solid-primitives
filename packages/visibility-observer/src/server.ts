import * as API from "./index";

export const createPageVisibility: typeof API.createPageVisibility = () => () => true;

export const usePageVisibility: typeof API.usePageVisibility = () => () => true;

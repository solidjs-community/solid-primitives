import * as API from ".";

export const getRemSize: typeof API.getRemSize = () => 16;

export const createRemSize: typeof API.createRemSize = () => [() => 16, () => {}];

export const useRemSize: typeof API.useRemSize = () => () => 16;

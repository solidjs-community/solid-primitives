import * as API from ".";

let serverRemSize = 16;

export const getRemSize: typeof API.getRemSize = () => serverRemSize;

export const createRemSize: typeof API.createRemSize = () => () => serverRemSize;

export const useRemSize: typeof API.useRemSize = () => () => serverRemSize;

export const setServerRemSize: typeof API.setServerRemSize = size => {
  serverRemSize = size;
};

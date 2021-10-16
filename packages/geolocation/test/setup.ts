import "regenerator-runtime/runtime";

export const mockCoordinates = {
  latitude: 43.65107,
  longitude: -79.347015
};

const getCurrentPositionMock = jest.fn(success => success({ coords: mockCoordinates }));
const clearWatchMock = jest.fn();
const watchPositionMock = jest.fn(callback => callback({ coords: mockCoordinates }));

const geolocation = {
  clearWatch: clearWatchMock,
  getCurrentPosition: getCurrentPositionMock,
  watchPosition: watchPositionMock
};
Object.defineProperty(global.navigator, "geolocation", {
  value: geolocation
});

import "regenerator-runtime/runtime";

export const mockCoordinates = {
  latitude: 43.65107,
  longitude: -79.347015
};

Object.defineProperty(global.navigator, "geolocation", {
  value: {
    clearWatch: () => {},
    getCurrentPosition: success => success({ coords: mockCoordinates }),
    watchPosition: callback => callback({ coords: mockCoordinates }),
  }
});

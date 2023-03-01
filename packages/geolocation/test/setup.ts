export const mockCoordinates = {
  latitude: 43.65107,
  longitude: -79.347015,
};

Object.defineProperty(global.navigator, "geolocation", {
  value: {
    clearWatch: () => {},
    getCurrentPosition(
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback | null,
      options?: PositionOptions,
    ) {
      successCallback({ coords: mockCoordinates } as GeolocationPosition);
    },
    watchPosition(
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback | null,
      options?: PositionOptions,
    ) {
      successCallback({ coords: mockCoordinates } as GeolocationPosition);
    },
  },
});

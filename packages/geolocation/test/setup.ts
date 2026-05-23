export const mockCoordinates = {
  latitude: 43.65107,
  longitude: -79.347015,
};

Object.defineProperty(global.navigator, "geolocation", {
  value: {
    clearWatch: () => {},
    getCurrentPosition(
      successCallback: PositionCallback,
      _errorCallback?: PositionErrorCallback | null,
      _options?: PositionOptions,
    ) {
      successCallback({ coords: mockCoordinates } as GeolocationPosition);
    },
    watchPosition(
      successCallback: PositionCallback,
      _errorCallback?: PositionErrorCallback | null,
      _options?: PositionOptions,
    ) {
      successCallback({ coords: mockCoordinates } as GeolocationPosition);
    },
  },
});

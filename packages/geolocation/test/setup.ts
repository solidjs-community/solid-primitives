import "regenerator-runtime/runtime";

export const mockNavigatorGeolocation = () => {
  const getCurrentPositionMock = jest.fn().mockImplementation(
    (success) => Promise.resolve(
      success({
        coords: {
          latitude: 10,
          longitude: 10
        }
      })
    )
  );
  const clearWatchMock = jest.fn();
  const watchPositionMock = jest.fn();
  const geolocation = {
    clearWatch: clearWatchMock,
    getCurrentPosition: getCurrentPositionMock,
    watchPosition: watchPositionMock,
  };
  Object.defineProperty(global.navigator, 'geolocation', {
    value: geolocation,
  });
  return {
    clearWatchMock,
    getCurrentPositionMock,
    watchPositionMock
  };
};

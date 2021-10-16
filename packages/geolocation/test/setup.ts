import "regenerator-runtime/runtime";

const getCurrentPositionMock = jest.fn(
  (success, error, options) => {
    // @ts-ignore
    if (global.navigator.isErrorMode) {
      error({
        code: 1,
        message: 'GeoLocation Error'
      });
    } else {
      success({
        coords: {
          latitude: 43.651070,
          longitude: -79.3470150
        }
      })
    }
  }
);
const clearWatchMock = jest.fn();
const watchPositionMock = jest.fn();
const geolocation = {
  // @ts-ignore
  errorMode: (toggle) => { global.navigator.isErrorMode = toggle; },
  clearWatch: clearWatchMock,
  getCurrentPosition: getCurrentPositionMock,
  watchPosition: watchPositionMock,
};
Object.defineProperty(global.navigator, 'geolocation', {
  value: geolocation,
});

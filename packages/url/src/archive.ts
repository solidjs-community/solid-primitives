// primitives that was scrapped from released package, left here for safekeeping

export function createLocationURL(
  options: {
    useSharedState?: boolean;
    updateMethod?: UpdateLocationMethod;
  } = {}
): ReactiveURL {
  const { useSharedState = false, updateMethod = "replace" } = options;
  const state = _useLocationState(useSharedState);
  const url = new ReactiveURL(state.href);
  biSyncSignals(
    {
      get: () => state.href,
      set: () => updateLocation(url.href, updateMethod)
    },
    {
      get: () => url.href,
      set: href => (url.href = href)
    }
  );
  return url;
}

export const useSharedLocationURL = /*#__PURE__*/ createSharedRoot(
  createLocationURL.bind(void 0, { useSharedState: true })
);

export function createLocationSearchParams(
  options: {
    useSharedState?: boolean;
    updateMethod?: UpdateLocationMethod;
  } = {}
): ReactiveSearchParams {
  const { useSharedState = false, updateMethod = "replace" } = options;
  const state = _useLocationState(useSharedState);
  const searchParams = new ReactiveSearchParams(state.search);

  biSyncSignals(
    {
      get: () => state.search,
      set: search => {
        const url = new URL(state.href);
        url.search = search;
        updateLocation(url.href, updateMethod);
      }
    },
    {
      get: () => searchParams + "",
      set: search => {
        const keys = new Set(searchParams.keys());
        const newSearchParams = new URLSearchParams(search);
        batch(() => {
          newSearchParams.forEach((value, name) => {
            if (keys.has(name)) {
              keys.delete(name);
              searchParams.set(name, value);
            } else searchParams.append(name, value);
          });
          keys.forEach(key => searchParams.delete(key));
        });
      }
    }
  );

  return searchParams;
}

export const useSharedLocationSearchParams = /*#__PURE__*/ createSharedRoot(
  createLocationSearchParams.bind(void 0, { useSharedState: true })
);

export function createLocationURLRecord(options?: {
  useSharedState?: boolean;
}): [accessor: URLRecord, setters: { push: URLSetter; replace: URLSetter; navigate: URLSetter }] {
  const state = _useLocationState(!!options?.useSharedState);
  const [url, setURL] = createURLRecord(state.href);
  let updateMethod: UpdateLocationMethod;

  biSyncSignals(
    {
      get: () => state.href,
      set: () => updateLocation(url.href, updateMethod)
    },
    {
      get: () => url.href,
      set: href => setURL("href", href)
    }
  );

  return [
    url,
    {
      push: (a: any, b?: any) => {
        updateMethod = "push";
        return setURL(a, b);
      },
      replace: (a: any, b?: any) => {
        updateMethod = "replace";
        return setURL(a, b);
      },
      navigate: (a: any, b?: any) => {
        updateMethod = "navigate";
        return setURL(a, b);
      }
    }
  ];
}

export const useSharedLocationURLRecord = /*#__PURE__*/ createSharedRoot(
  createLocationURLRecord.bind(void 0, { useSharedState: true })
);

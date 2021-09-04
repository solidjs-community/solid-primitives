export enum EventType {
  Pageview = "page",
  Event = "event",
  Social = "social"
}
export type TrackEventData = {
  category?: string;
  action?: string;
  label?: string;
  value?: string;
  location?: string;
  other?: object;
};
export type TrackSocialData = {
  network: string;
  action: string;
  socialtarget: string;
};
export type TrackPageview = {
  location?: string;
  other?: object;
};
export type TrackHandler = (
  type: EventType,
  data: TrackEventData | TrackSocialData | TrackPageview
) => void;

/**
 * Creates a method that support with analytics reporting.
 *
 * @param handlers A list of reporting handlers
 * @returns Returns a tracking a single tracking handler
 *
 */
const createAnalytics = (handlers: Array<TrackHandler>): TrackHandler => {
  const track: TrackHandler = (type, data) => {
    for (const i in handlers) {
      handlers[i](type, data);
    }
  };
  return track;
};

export default createAnalytics;

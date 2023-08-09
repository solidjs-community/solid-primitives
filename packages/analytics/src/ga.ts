// @ts-nocheck
import { TrackHandler, EventType } from "./index.js";

type GoogleAnalyticsOptions = {
  trackingId: string;
  cookieDomain?: string;
  name?: string;
  userId: string;
};

export const loadGoogleAnalytics = (options: GoogleAnalyticsOptions) => {
  window.ga =
    window.ga ||
    function () {
      (ga.q = ga.q || []).push(arguments);
    };
  ga.l = +new Date();
  ga("create", options);
  const el = document.createElement("script");
  el.async = true;
  el.src = "https://www.google-analytics.com/analytics.js";
  document.head.append(el);
};

export const trackGoogleAnalytics: TrackHandler = (event, data) => {
  switch (event) {
    case EventType.Pageview:
      ga("send", "pageview", data.location, data.other);
      break;
    case EventType.Social:
      ga("send", {
        hitType: "social",
        socialNetwork: data.network,
        socialAction: data.action,
        socialTarget: data.target,
      });
      break;
    case EventType.Event:
      ga("send", "event", {
        eventCategory: data.category,
        eventAction: data.action,
        eventLabel: data.label,
        eventValue: data.value,
        ...data.other,
      });
      break;
  }
};

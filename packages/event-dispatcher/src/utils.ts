export function create_custom_evt<T>(
  evtType: string,
  evtDetail: T,
  cancelable: boolean
): CustomEvent<T> {
  const customEvt =
    typeof window?.CustomEvent === 'function'
      ? IE_custom_event(evtType, evtDetail, cancelable)
      : new CustomEvent(evtType, { detail: evtDetail, cancelable })
    return customEvt
}

function IE_custom_event<T>(
  evtType: string,
  evtDetail: T,
  cancelable: boolean
) {
  const evt = document.createEvent('CustomEvent')
  evt.initCustomEvent(evtType, false, cancelable, evtDetail)
  return evt
}

export function get_event_listener_name(eventName: string): string {
  return `${'on'}${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`
}
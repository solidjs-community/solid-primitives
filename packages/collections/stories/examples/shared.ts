/** Simulated network latency; the examples do not contact a server. */
export const wait = (ms = 600): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

import type { AnyPayload } from "./types.js";

export type QueuedEvent = {
  payload: AnyPayload;
};

/** Bounded FIFO queue for analytics events pending plugin initialization. */
export class EventQueue {
  private readonly _limit: number;
  private _items: QueuedEvent[] = [];

  constructor(limit = 100) {
    this._limit = limit;
  }

  /**
   * Add an event to the queue.
   * @returns `true` if enqueued, `false` if the queue is full.
   */
  enqueue(payload: AnyPayload): boolean {
    if (this._items.length >= this._limit) return false;
    this._items.push({ payload });
    return true;
  }

  /** Remove and return up to `limit` queued events (or all if limit is omitted). */
  drain(limit?: number): QueuedEvent[] {
    return limit != null ? this._items.splice(0, limit) : this._items.splice(0);
  }

  /** Number of events currently in the queue. */
  get size(): number {
    return this._items.length;
  }

  /** Discard all queued events without dispatching them. */
  clear(): void {
    this._items = [];
  }
}

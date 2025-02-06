import { RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

const mockSupabaseSubscribers: ((ev: RealtimePostgresChangesPayload<any>) => void)[] = []

export const mockSupabaseClientEvents = {
  insert: [] as Record<string, any>[],
  update: [] as Record<string, any>[],
  delete: [] as Record<string, any>[]
};

export const mockSupabaseClientData = [{id: 1, data: 'one'}, {id: 2, data: 'two'}];

let eqResponse: 'delete' | 'update' = 'update';

export const mockSupabaseClient = {
  from: function() { return mockSupabaseClient; },
  select: function() { return Promise.resolve({ error: null, data: mockSupabaseClientData }); },
  channel: function() { return mockSupabaseClient; },
  on: function(_: any, __: any, handler: (ev: RealtimePostgresChangesPayload<any>) => void) { mockSupabaseSubscribers.push(handler); return mockSupabaseClient; },
  subscribe: function() { return mockSupabaseClient; },
  unsubscribe: function() { mockSupabaseSubscribers.length = 0; return mockSupabaseClient; },
  insert: vi.fn(function(_row: Record<string, any>) { return mockSupabaseResponses.insert; }),
  delete: function(_row: { id: string | number }) { eqResponse = 'delete'; return mockSupabaseClient; },
  update: vi.fn(function(_row: Record<string, any>) { eqResponse = 'update'; return mockSupabaseClient; }),
  eq: vi.fn(function(_row: { id: string | number }) { return mockSupabaseResponses[eqResponse]; }),
} as unknown as SupabaseClient;

export const mockSupabaseSendEvent = (ev: RealtimePostgresChangesPayload<any>) =>
  mockSupabaseSubscribers.forEach(s => s(ev));

export const mockSupabaseResponses = {
  insert: Promise.resolve({}),
  delete: Promise.resolve({}),
  update: Promise.resolve({}),
};

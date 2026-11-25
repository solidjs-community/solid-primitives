---
"@solid-primitives/storage": patch
---

`makePersisted` no longer drops the stored value when it is called inside a component body. Restoring stored data went through the caller's setter while the creating scope was still owned, which Solid 2 rejects (`REACTIVE_WRITE_IN_OWNED_SCOPE`) — the error was caught and only warned about, so in development the stored value was silently lost while production kept it, and a store could not opt out of the rule at all. The restoring write is now detached from the current owner, which is what it is: an external write, like one from an event listener. Only deserialization failures are still caught and warned about; errors from the write itself propagate.

Writes the caller makes through the returned setter are unchanged, so a signal passed to `makePersisted` no longer needs `{ ownedWrite: true }` just to be restorable.

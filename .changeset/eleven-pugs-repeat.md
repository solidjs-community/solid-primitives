---
"@solid-primitives/storage": patch
---

`makePersisted` no longer drops the stored value when it is called inside a component body. Restoring stored data went through the caller's setter while the creating scope was still owned, which Solid 2 rejects (`REACTIVE_WRITE_IN_OWNED_SCOPE`) — the error was caught and only warned about, so in development the stored value was silently lost while production kept it, and a store could not opt out of the rule at all. The restoring write is now detached from the current owner, which is what it is: an external write, like one from an event listener. Only data that cannot be used is still caught and warned about; errors from the write itself propagate.

A store is also only restored from an object or an array now. `reconcile` assigns the incoming value into the store's backing before it finds out that a `null` or a primitive cannot be a store root, so a storage holding `null` for a store used to leave that store unreadable; such data is now ignored with a warning, like unparseable data. `null` is still restored into a signal and into a property inside a store.

Writes the caller makes through the returned setter are unchanged, so a signal passed to `makePersisted` no longer needs `{ ownedWrite: true }` just to be restorable.

---
"@solid-primitives/websocket": minor
---

Fix reconnect loop in `makeReconnectingWS`: the `close` event listener is now removed from the old `WebSocket` instance before a new connection is created. Previously, closing the old socket during reconnection would trigger the listener again and schedule an extra reconnect, causing duplicate connections under certain timing conditions.

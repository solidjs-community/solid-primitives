---
"@solid-primitives/storage": patch
---

Set-Cookie header will be sent with trailing `, ` in some cases which prefixes the name in the browser too

Don't append false boolean values from `cookieOptions`
Stability improvements: ignore unexpected `cookieOption` keys

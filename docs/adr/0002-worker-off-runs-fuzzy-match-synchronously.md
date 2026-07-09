# Worker Mode "off" runs Fuzzy Match synchronously, rather than disabling it

When Worker Mode is off, the same Fuzzy Match computation still runs — just on the main thread instead of a Web Worker — rather than Worker Mode off meaning "skip fuzzy matching entirely."

We considered the simpler alternative (off = no fuzzy fallback, behaves like Prefix Match), which avoids needing a matching implementation that's callable both from a worker and from the main thread. We rejected it because the whole point of exposing this toggle is to let visitors feel the main-thread jank a full Corpus scan causes at larger Size Tiers — silently disabling the expensive work instead would hide the exact performance problem the Worker Mode setting exists to demonstrate.

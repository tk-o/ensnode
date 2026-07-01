---
"@ensnode/ensdb-writer": minor
---

Introduces `@ensnode/ensdb-writer`, an engine-agnostic package containing the ENSIndexer indexing handlers and helpers. It defines an `IndexingEngineAdapter` interface and engine-agnostic `IndexingEngineContext` so the same handlers can run on Ponder or another indexing engine.

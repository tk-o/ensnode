---
"ensindexer": minor
---

Refactors ENSIndexer to consume its indexing handlers from the new `@ensnode/ensdb-writer` package. Adds a Ponder-specific `IndexingEngineAdapter` implementation that builds the engine-agnostic context and registers handlers with Ponder.

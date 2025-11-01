import type { ENSNamespaceId } from "@ensnode/datasources";

import type { EnsRainbowClientLabelSet } from "../../ensrainbow";
import type { ChainId } from "../../shared";

/**
 * A PluginName is a unique id for a 'plugin': we use the notion of
 * 'plugins' to describe bundles of indexing logic.
 */
export enum PluginName {
  Subgraph = "subgraph",
  Basenames = "basenames",
  Lineanames = "lineanames",
  ThreeDNS = "threedns",
  ProtocolAcceleration = "protocol-acceleration",
  Registrars = "registrars",
  TokenScope = "tokenscope",
}

/**
 * Version info about ENSIndexer and its dependencies.
 */
export interface ENSIndexerVersionInfo {
  /**
   * Node.js runtime version
   *
   * @see https://nodejs.org/en/about/previous-releases
   **/
  nodejs: string;

  /**
   * Ponder framework version
   *
   * @see https://www.npmjs.com/package/ponder
   **/
  ponder: string;

  /**
   * ENSDb service version
   *
   * Guaranteed to be the same as {@link ENSIndexerVersionInfo.ensIndexer}.
   * */
  ensDb: string;

  /**
   * ENSIndexer service version
   *
   * @see https://ghcr.io/namehash/ensnode/ensindexer
   **/
  ensIndexer: string;

  /**
   * ENSRainbow service version
   *
   * @see https://ghcr.io/namehash/ensnode/ensindexer
   **/
  ensRainbow: string;

  /**
   * ENSRainbow schema version
   **/
  ensRainbowSchema: number;

  /**
   * ENS Normalize package version
   *
   * Available on NPM as: `@adraffy/ens-normalize`
   *
   * @see https://www.npmjs.com/package/@adraffy/ens-normalize
   **/
  ensNormalize: string;
}

/**
 * Complete public configuration object for ENSIndexer.
 *
 * We use parameter types to maintain fields layout and documentation across
 * the domain model and its serialized counterpart.
 */
export interface ENSIndexerPublicConfig {
  /**
   * The ENS namespace that ENSNode operates in the context of.
   *
   * See {@link ENSNamespaceIds} for available namespace identifiers.
   */
  namespace: ENSNamespaceId;

  /**
   * The "fully pinned" label set reference that ENSIndexer will request ENSRainbow use for deterministic label healing across time. This label set reference is "fully pinned" as it requires both the labelSetId and labelSetVersion fields to be defined.
   */
  labelSet: Required<EnsRainbowClientLabelSet>;

  /**
   * A Postgres database schema name. This instance of ENSIndexer will write
   * indexed data to the tables in this schema.
   *
   * Invariants:
   * - Must be a non-empty string that is a valid Postgres database schema
   *   identifier.
   */
  databaseSchemaName: string;

  /**
   * A set of strings referring to the names of plugins that are active.
   *
   * For future-proofing, this is a list of strings that may or may
   * not be currently valid {@link PluginName} values.
   *
   * Invariants:
   * - A set of strings with at least one value.
   */
  plugins: string[];

  /**
   * Indexed Chain IDs
   *
   * Includes the {@link ChainId} for each chain being indexed.
   */
  indexedChainIds: Set<ChainId>;

  /**
   * A feature flag to enable/disable ENSIndexer's Subgraph Compatible Indexing Behavior.
   *
   * If {@link isSubgraphCompatible} is true, indexing behavior will match that of the legacy ENS
   * Subgraph.
   *
   * ENSIndexer will store and return Literal Labels and Literal Names without further interpretation.
   * @see https://ensnode.io/docs/reference/terminology#literal-label
   * @see https://ensnode.io/docs/reference/terminology#literal-name
   *
   * If {@link isSubgraphCompatible} is true, the following invariants are true for the ENSIndexerConfig:
   * 1. only the 'subgraph' plugin is enabled, and
   * 2. the labelSet must be { labelSetId: 'subgraph', labelSetVersion: 0 }
   *
   * If {@link isSubgraphCompatible} is false, ENSIndexer will additionally:
   *
   * 1. ENSIndexer will heal all subnames of addr.reverse on the ENS Root Chain.
   *
   * 2. ENSIndexer will track both the keys and the values of Resolver records.
   *
   * WARNING: Special care must be taken when interacting with indexed resolver record values. It
   * is unsafe to naively assume that indexed resolver record values are equivalent to the
   * resolver record values that would be returned through dynamic lookups via the ENS protocol.
   * For example, if a resolver implements CCIP-Read, the resolver records may not be
   * discoverable through onchain indexing.
   *
   * 3. Literal Labels and Literal Names encountered by ENSIndexer will be Interpreted.
   * @see https://ensnode.io/docs/reference/terminology#interpreted-label
   * @see https://ensnode.io/docs/reference/terminology#interpreted-name
   *
   * That is,
   * a) all Labels stored and returned by ENSIndexer will be Interpreted Labels, which are either:
   *    i. normalized, or
   *    ii. represented as an Encoded LabelHash of the Literal Label value found onchain, and
   * b) all Names stored and returned by ENSIndexer will be Interpreted Names, which are exclusively
   *   composed of Interpreted Labels.
   */
  isSubgraphCompatible: boolean;

  /**
   * Version info about ENSIndexer.
   */
  versionInfo: ENSIndexerVersionInfo;
}

import type { Hex } from "viem";

// re-export CoinType and EvmCoinType from @ensdomains/address-encoder so consumers don't need it as
// a dependency
export type { CoinType, EvmCoinType } from "@ensdomains/address-encoder";

/**
 * A PluginName is a unique id for a 'plugin': we use the notion of 'plugins' to describe bundles
 * of indexing logic.
 */
export enum PluginName {
  Subgraph = "subgraph",
  Basenames = "basenames",
  Lineanames = "lineanames",
  ThreeDNS = "threedns",
  ReverseResolvers = "reverse-resolvers",
  Referrals = "referrals",
}

/**
 * A hash value that uniquely identifies a single ENS name.
 * Result of `namehash` function as specified in ENSIP-1.
 *
 * @example
 * ```
 * namehash("vitalik.eth") === "0xee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a53475835"
 * ```
 * @link https://docs.ens.domains/ensip/1#namehash-algorithm
 */
export type Node = Hex;

/**
 * A LabelHash is the result of the labelhash function (which is just keccak256) on a Label.
 *
 * @link https://docs.ens.domains/terminology#labelhash
 */
export type LabelHash = Hex;

/**
 * A Label is a single part of an ENS Name.
 *
 * @link https://docs.ens.domains/terminology#label
 */
export type Label = string;

/**
 * An EncodedLabelHash is a specially formatted unnormalized Label that should be interpreted as a
 * LabelHash literal, particularly for use within an ENS Name.
 *
 * @example [abcd]
 * @example [abcd].example.eth
 */
export type EncodedLabelHash = `[${string}]`;

/**
 * A Name represents a human-readable ENS name.
 *
 * ex: vitalik.eth
 */
export type Name = string;

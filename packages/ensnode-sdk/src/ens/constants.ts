import { namehash, zeroAddress } from "viem";

import { buildEncodedReferrer, type EncodedReferrer } from "@ensnode/ens-referrals";

import type { Node } from "./types";

export const ROOT_NODE: Node = namehash("");
export const ETH_NODE: Node = namehash("eth");
export const BASENAMES_NODE: Node = namehash("base.eth");
export const LINEANAMES_NODE: Node = namehash("linea.eth");
export const ADDR_REVERSE_NODE: Node = namehash("addr.reverse");
/** Zero Referrer where all 32-bytes are zeroes. */
export const ZERO_REFERRER_ENCODED: EncodedReferrer = buildEncodedReferrer(zeroAddress);

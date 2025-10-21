import { bytesToHex } from "viem";
import type { SerializedRegistrarAction } from "./serialized-types";
import type { RegistrarAction } from "./types";

export function serializeRegistrarAction(
  registrarAction: RegistrarAction,
): SerializedRegistrarAction {
  return {
    type: registrarAction.type,
    node: registrarAction.node,
    baseCost: registrarAction.baseCost.toString(),
    premium: registrarAction.premium.toString(),
    total: registrarAction.total.toString(),
    rawReferrer: bytesToHex(registrarAction.rawReferrer),
    interpretedReferrer: registrarAction.interpretedReferrer,
    registrant: registrarAction.registrant,
    blockTimestamp: registrarAction.blockTimestamp,
    chainId: registrarAction.chainId,
    transactionHash: registrarAction.transactionHash,
  };
}

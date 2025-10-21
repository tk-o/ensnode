import { formatEther, hexToBytes, namehash, parseEther } from "viem";
import { describe, expect, it } from "vitest";
import { deserializeRegistrarAction } from "./deserialize";
import { serializeRegistrarAction } from "./serialize";
import { SerializedRegistrarAction } from "./serialized-types";
import { RegistrarAction, RegistrarActionType } from "./types";

const vitalikEthAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
const vb2Address = "0x1db3439a222c519ab44bb1144fc28167b4fa6ee6";

describe("Registrar Actions", () => {
  it("can serialize and deserialize registrar action object", () => {
    const serialized = {
      type: RegistrarActionType.Registration,
      node: namehash("vitalik.eth"),
      baseCost: parseEther("1").toString(),
      premium: parseEther("0.7").toString(),
      total: parseEther("1.7").toString(),
      rawReferrer: "0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045",
      interpretedReferrer: vitalikEthAddress,
      registrant: vb2Address,
      blockTimestamp: 1761062418,
      chainId: 1,
      transactionHash: "0x5371489034e7858bfa320cf3887700f997198810a8b8a880fdae98bb4d5ef66f",
    } satisfies SerializedRegistrarAction;

    const deserialized = deserializeRegistrarAction(serialized);

    expect(deserialized).toStrictEqual({
      type: RegistrarActionType.Registration,
      node: namehash("vitalik.eth"),
      baseCost: parseEther("1"),
      premium: parseEther("0.7"),
      total: parseEther("1.7"),
      rawReferrer: hexToBytes("0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045"),
      interpretedReferrer: vitalikEthAddress,
      registrant: vb2Address,
      blockTimestamp: 1761062418,
      chainId: 1,
      transactionHash: "0x5371489034e7858bfa320cf3887700f997198810a8b8a880fdae98bb4d5ef66f",
    } satisfies RegistrarAction);

    expect(serializeRegistrarAction(deserialized)).toStrictEqual(serialized);
  });
});

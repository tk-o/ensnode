import { type TraceTransactionSchema, getAddressesFromTrace } from "@/lib/transaction-helpers";
import { describe, expect, it } from "vitest";

describe("transaction helpers", () => {
  describe("getAddressesFromTrace", () => {
    it("should extract all addresses from a transaction trace", () => {
      const trace = getExampleTransactionTrace();
      const addresses = getAddressesFromTrace(trace);

      expect(addresses).toEqual([
        "0x5cA1e1Ab50E1c9765F02B01FD2Ed340f394c5DDA",
        "0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb",
        "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
      ]);
      expect(addresses.length).toBe(4);
    });
  });
});

/**
 * Get an example transaction trace that is compatible with the TraceTransactionSchema.
 * @returns A real example fetched from the Ethereum mainnet.
 */
function getExampleTransactionTrace(): TraceTransactionSchema["ReturnType"] {
  // This is a real example fetched from the Ethereum mainnet.
  // See docs for more details:
  // https://www.alchemy.com/docs/node/debug-api/debug-api-endpoints/debug-trace-transaction
  const exampleRpcResponse = {
    jsonrpc: "2.0",
    id: 1,
    result: {
      from: "0x5ca1e1ab50e1c9765f02b01fd2ed340f394c5dda",
      gas: "0x2b9b9",
      gasUsed: "0x1cfd2",
      to: "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb",
      input:
        "0x7a806d6b000000000000000000000000cf598d75ea9194850eb8e429f43f109665196dfa0000000000000000000000005ca1e1ab50e1c9765f02b01fd2ed340f394c5dda000000000000000000000000231b0ee14048e9dccd1d247744d114a4eb5e8e630000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000f6d696e652e6862686172742e6574680000000000000000000000000000000000",
      output: "0x06cb1dfc3d8eea430729e0c1a7bbd1c0736809358d48ac8f3f0017c9dba7bf12",
      calls: [
        {
          from: "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb",
          gas: "0x24090",
          gasUsed: "0xaaf",
          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
          input:
            "0xe985e9c5000000000000000000000000cf598d75ea9194850eb8e429f43f109665196dfa0000000000000000000000005ca1e1ab50e1c9765f02b01fd2ed340f394c5dda",
          output: "0x0000000000000000000000000000000000000000000000000000000000000001",
          type: "STATICCALL",
        },
        {
          from: "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb",
          gas: "0x222e5",
          gasUsed: "0xc8f0",
          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
          input:
            "0x5ef2c7f091d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2bcbde44fbd5cdde9bfdf3f5e218c44fd8857d5b168513960fe87943fee46ab150000000000000000000000005ca1e1ab50e1c9765f02b01fd2ed340f394c5dda000000000000000000000000231b0ee14048e9dccd1d247744d114a4eb5e8e630000000000000000000000000000000000000000000000000000000000000000",
          value: "0x0",
          type: "CALL",
        },
        {
          from: "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb",
          gas: "0x150fc",
          gasUsed: "0x6c0b",
          to: "0x231b0ee14048e9dccd1d247744d114a4eb5e8e63",
          input:
            "0x7737221306cb1dfc3d8eea430729e0c1a7bbd1c0736809358d48ac8f3f0017c9dba7bf120000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000f6d696e652e6862686172742e6574680000000000000000000000000000000000",
          value: "0x0",
          type: "CALL",
        },
      ],
      value: "0x0",
      type: "CALL",
    },
  } as const;

  return exampleRpcResponse.result satisfies TraceTransactionSchema["ReturnType"];
}

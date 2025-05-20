import { Address, Hash, Hex, getAddress } from "viem";

export type TraceTransactionSchema = {
  Parameters: [
    hash: Hash,
    options:
      | {
          disableStorage?: boolean;
          disableStack?: boolean;
          enableMemory?: boolean;
          enableReturnData?: boolean;
          tracer?: string;
        }
      | {
          timeout?: string;
          tracerConfig?: {
            onlyTopCall?: boolean;
            withLog?: boolean;
          };
        }
      | undefined,
  ];
  ReturnType: Trace;
};

interface Trace {
  type: "CALL" | "STATICCALL" | "DELEGATECALL" | "CREATE" | "CREATE2";
  from: Address;
  to: Address;
  gas: Hex;
  gasUsed: Hex;
  input: Hash;
  output?: Hash;
  value?: Hex;
  calls?: ReadonlyArray<Trace>;
}

/**
 * Extracts all Ethereum addresses from a given transaction trace.
 *
 * @param trace The transaction trace to extract addresses from
 * @returns An array of unique addresses found in the trace.
 */
export function getAddressesFromTrace(trace: Trace): Array<Address> {
  const text = JSON.stringify(trace);
  // Regular expression to match Ethereum addresses
  // Looking for 0x followed by exactly 40 hex characters
  const regex = /\b0x[a-fA-F0-9]{40}\b/g;

  // Find all matches
  const matches = text.match(regex);

  // if matches are found, normalize them and return unique addresses
  if (matches) {
    const normalizedMatches = matches.map((addr) => getAddress(addr));

    return [...new Set(normalizedMatches)];
  }

  return [];
}

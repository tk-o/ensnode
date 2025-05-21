import { Address, Hash, Hex, getAddress, isAddress } from "viem";

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
export function getAddressesFromTrace(trace: Trace): Set<Address> {
  const text = JSON.stringify(trace);
  const uniqueAddresses = new Set<Address>();

  // Helper function to search for plain addresses (0x followed by 40 hex characters)
  const searchForPlainAddresses = (text: string) => {
    // Looking for 0x followed by exactly 40 hex characters
    const regex = /\b0x[a-fA-F0-9]{40}\b/gi;

    // Find all matches
    const matches = text.match(regex);

    // if matches are found, normalize them and return unique addresses
    if (matches) {
      for (const maybeAddress of matches) {
        try {
          // Normalize the address using getAddress
          const normalizedAddr = getAddress(maybeAddress);
          // Add the normalized address to the set
          uniqueAddresses.add(normalizedAddr);
        } catch {
          // Ignore invalid addresses
        }
      }
    }
  };

  // Helper function to search for serialized addresses (hex strings in calldata)
  const searchForSerializedAddresses = (text: string) => {
    // Match addresses in serialized input - look for patterns in
    // typical EVM input data. This regex finds 40-char hex sequences
    // that appear after typical position markers (24 zeroes) in calldata.
    const regex = /000000000000000000000000([a-fA-F0-9]{40})/gi;
    const m = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      // match[1] contains the extracted address part (without the 24 zeroes)
      const maybePartialAddress = match[1];

      if (!maybePartialAddress) {
        // If no address part is found, skip this match
        continue;
      }

      try {
        // Add 0x prefix and normalize with getAddress
        const normalizedAddr = getAddress(`0x${maybePartialAddress}`);
        // Add the normalized address to the set
        uniqueAddresses.add(normalizedAddr);
      } catch {
        // Ignore invalid addresses
      }
    }
  };

  searchForPlainAddresses(text);
  searchForSerializedAddresses(text);

  return uniqueAddresses;
}

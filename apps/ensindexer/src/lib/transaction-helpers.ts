import { Address, Hex, getAddress } from "viem";
import { rpcEndpointUrl } from "./ponder-helpers";

/**
 * Extracts all Ethereum addresses from traces of a given transaction.
 *
 * @param chainId The chain ID of the transaction.
 * @param transactionHash The hash of the transaction.
 * @returns An array of unique Ethereum addresses found in the transaction traces.
 */
export async function getAllAddressesOfTransaction(chainId: number, transactionHash: Hex) {
  const rpcEndpoint = rpcEndpointUrl(chainId);

  if (!rpcEndpoint) {
    throw new Error(`No RPC endpoint found for chainId ${chainId}`);
  }

  const getTransactionTraces = async (): Promise<string> => {
    const body = JSON.stringify({
      method: "debug_traceTransaction",
      params: [transactionHash, { tracer: "callTracer" }],
      id: 1,
      jsonrpc: "2.0",
    });

    return fetch(rpcEndpoint, {
      method: "POST",
      body,
    }).then((r) => r.text());
  };

  const traces = await getTransactionTraces();

  return extractEthereumAddresses(traces);
}

/**
 * Extracts all Ethereum addresses from a given text.
 *
 * @param text The text to extract addresses from.
 * @returns An array of unique Ethereum addresses found in the text.
 */
function extractEthereumAddresses(text: string): Array<Address> {
  // Regular expression to match Ethereum addresses
  // Looking for 0x followed by exactly 40 hex characters
  const regex = /0x[a-fA-F0-9]{40}/g;

  // Find all matches
  const matches = text.match(regex);

  // if matches are found, normalize them and return unique addresses
  if (matches) {
    const normalizedMatches = matches.map((addr) => getAddress(addr));

    return [...new Set(normalizedMatches)];
  }

  return [];
}

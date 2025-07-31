import { EnsRainbowApiClient } from "@ensnode/ensrainbow-sdk";

export function getENSRainbowApiCLient(ensRainbowEndpointUrl: URL) {
  const ensRainbowApiClient = new EnsRainbowApiClient({
    endpointUrl: new URL(ensRainbowEndpointUrl),
  });

  if (
    ensRainbowApiClient.getOptions().endpointUrl ===
    EnsRainbowApiClient.defaultOptions().endpointUrl
  ) {
    console.warn(
      `Using default public ENSRainbow server which may cause increased network latency.
    For production, use your own ENSRainbow server that runs on the same network
    as the ENSIndexer server.`,
    );
  }
  return ensRainbowApiClient;
}

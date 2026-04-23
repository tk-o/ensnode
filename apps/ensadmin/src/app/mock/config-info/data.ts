import type { SerializedEnsNodeStackInfo } from "@ensnode/ensnode-sdk";

/**
 * Record of mock SerializedEnsNodeStackInfo objects keyed by variant name.
 * These can be deserialized to simulate the full deserialization process.
 */
export const mockSerializedEnsNodeStackInfo: Record<string, SerializedEnsNodeStackInfo> = {
  "Alpha Mainnet": {
    ensApi: {
      versionInfo: {
        ensApi: "0.35.0",
        ensNormalize: "1.11.1",
      },
      theGraphFallback: {
        canFallback: false,
        reason: "no-api-key",
      },
    },
    ensDb: {
      versionInfo: {
        postgresql: "18.1",
      },
    },
    ensIndexer: {
      labelSet: {
        labelSetId: "subgraph",
        labelSetVersion: 0,
      },
      indexedChainIds: [1, 8453, 59144, 10, 42161, 534352, 567],
      ensIndexerSchemaName: "alphaSchema0.34.0",
      isSubgraphCompatible: false,
      namespace: "mainnet",
      plugins: [
        "subgraph",
        "basenames",
        "lineanames",
        "threedns",
        "protocol-acceleration",
        "registrars",
        "tokenscope",
      ],
      versionInfo: {
        ponder: "0.11.43",
        ensDb: "0.35.0",
        ensIndexer: "0.35.0",
        ensNormalize: "1.11.1",
      },
    },
    ensRainbow: {
      labelSet: {
        labelSetId: "subgraph",
        highestLabelSetVersion: 0,
      },
      versionInfo: {
        ensRainbow: "0.34.0",
      },
    },
  },
  "Alpha Sepolia": {
    ensApi: {
      versionInfo: {
        ensApi: "0.35.0",
        ensNormalize: "1.11.1",
      },
      theGraphFallback: {
        canFallback: true,
        url: "",
      },
    },
    ensDb: {
      versionInfo: {
        postgresql: "18.1",
      },
    },
    ensIndexer: {
      labelSet: {
        labelSetId: "subgraph",
        labelSetVersion: 0,
      },
      versionInfo: {
        ponder: "0.11.43",
        ensDb: "0.35.0",
        ensIndexer: "0.35.0",
        ensNormalize: "1.11.1",
      },
      indexedChainIds: [11155111, 84532, 59141, 11155420, 421614, 534351],
      namespace: "sepolia",
      plugins: [
        "subgraph",
        "basenames",
        "lineanames",
        "threedns",
        "protocol-acceleration",
        "registrars",
      ],
      ensIndexerSchemaName: "alphaSepoliaSchema0.34.0",
      isSubgraphCompatible: false,
    },
    ensRainbow: {
      labelSet: {
        labelSetId: "subgraph",
        highestLabelSetVersion: 0,
      },
      versionInfo: {
        ensRainbow: "0.34.0",
      },
    },
  },
  "Subgraph Mainnet": {
    ensApi: {
      versionInfo: {
        ensApi: "0.35.0",
        ensNormalize: "1.11.1",
      },
      theGraphFallback: {
        canFallback: false,
        reason: "no-api-key",
      },
    },
    ensDb: {
      versionInfo: {
        postgresql: "18.1",
      },
    },
    ensIndexer: {
      labelSet: {
        labelSetId: "subgraph",
        labelSetVersion: 0,
      },
      versionInfo: {
        ponder: "0.11.43",
        ensDb: "0.35.0",
        ensIndexer: "0.35.0",
        ensNormalize: "1.11.1",
      },
      indexedChainIds: [1],
      namespace: "mainnet",
      plugins: ["subgraph"],
      ensIndexerSchemaName: "mainnetSchema0.34.0",
      isSubgraphCompatible: true,
    },
    ensRainbow: {
      labelSet: {
        labelSetId: "subgraph",
        highestLabelSetVersion: 0,
      },
      versionInfo: {
        ensRainbow: "0.34.0",
      },
    },
  },
  "Subgraph Sepolia": {
    ensApi: {
      versionInfo: {
        ensApi: "0.35.0",
        ensNormalize: "1.11.1",
      },
      theGraphFallback: {
        canFallback: false,
        reason: "no-api-key",
      },
    },
    ensDb: {
      versionInfo: {
        postgresql: "18.1",
      },
    },
    ensIndexer: {
      labelSet: {
        labelSetId: "subgraph",
        labelSetVersion: 0,
      },
      versionInfo: {
        ponder: "0.11.43",
        ensDb: "0.35.0",
        ensIndexer: "0.35.0",
        ensNormalize: "1.11.1",
      },
      indexedChainIds: [11155111],
      namespace: "sepolia",
      plugins: ["subgraph"],
      ensIndexerSchemaName: "sepoliaSchema0.34.0",
      isSubgraphCompatible: true,
    },
    ensRainbow: {
      labelSet: {
        labelSetId: "subgraph",
        highestLabelSetVersion: 0,
      },
      versionInfo: {
        ensRainbow: "0.34.0",
      },
    },
  },
  "Deserialization Error": {
    ensApi: {
      versionInfo: {
        ensApi: "0.35.0",
        ensNormalize: "1.11.1",
      },
      theGraphFallback: {
        canFallback: false,
        reason: "no-api-key",
      },
    },
    ensDb: {
      versionInfo: {
        postgresql: "18.1",
      },
    },
    ensIndexer: {
      labelSet: {
        labelSetId: "",
        labelSetVersion: 0,
      },
      versionInfo: {
        ponder: "",
        ensDb: "",
        ensIndexer: "",
        ensNormalize: "",
      },
      indexedChainIds: [11155111],
      namespace: "sepolia",
      plugins: ["subgraph"],
      ensIndexerSchemaName: "DeserializationSchema0.34.0",
      isSubgraphCompatible: true,
    },
    ensRainbow: {
      labelSet: {
        labelSetId: "",
        highestLabelSetVersion: -1,
      },
      versionInfo: {
        ensRainbow: "",
      },
    },
  },
};

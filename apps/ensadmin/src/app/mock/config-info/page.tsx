"use client";

import { useMemo, useState } from "react";

import { deserializeEnsNodeStackInfo, type EnsNodeStackInfo } from "@ensnode/ensnode-sdk";

import {
  ENSNodeConfigInfoView,
  ENSNodeConfigInfoViewProps,
} from "@/components/connection/cards/ensnode-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { mockSerializedEnsNodeStackInfo } from "./data";

type LoadingVariant = "Loading" | "Loading Error";
type ConfigVariant = keyof typeof mockSerializedEnsNodeStackInfo | LoadingVariant;

const DEFAULT_VARIANT = "Alpha Mainnet";
export default function MockConfigPage() {
  const [selectedConfig, setSelectedConfig] = useState<ConfigVariant>(DEFAULT_VARIANT);
  const props: ENSNodeConfigInfoViewProps = useMemo(() => {
    switch (selectedConfig) {
      case "Loading":
        return { isLoading: true };

      case "Loading Error":
        return {
          error: {
            title: "ENSNodeConfigInfo Error",
            description: "Failed to fetch ENSIndexer Config.",
          },
        };

      default:
        try {
          const serializedData = mockSerializedEnsNodeStackInfo[selectedConfig];
          const ensNodeStackInfo = deserializeEnsNodeStackInfo(serializedData);
          return { ensNodeStackInfo } satisfies ENSNodeConfigInfoViewProps;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown deserialization error";
          return {
            error: {
              title: "Deserialization Error",
              description: errorMessage,
            },
          };
        }
    }
  }, [selectedConfig]);

  return (
    <section className="flex flex-col gap-6 p-6 max-sm:p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl leading-normal">Mock: ENSNodeConfigInfo</CardTitle>
          <CardDescription>Select a mock ENSNodeConfigInfo variant</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[...Object.keys(mockSerializedEnsNodeStackInfo), "Loading", "Loading Error"].map(
              (variant) => (
                <Button
                  key={variant}
                  variant={selectedConfig === variant ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedConfig(variant as ConfigVariant)}
                >
                  {variant}
                </Button>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <ENSNodeConfigInfoView {...props} />
    </section>
  );
}

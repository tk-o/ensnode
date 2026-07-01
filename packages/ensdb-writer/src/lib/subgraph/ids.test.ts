import {
  asInterpretedLabel,
  asInterpretedName,
  labelhashInterpretedLabel,
  namehashInterpretedName,
} from "enssdk";
import { zeroAddress } from "viem";
import { describe, expect, it } from "vitest";

import { makeEventId, makeRegistrationId, makeResolverId } from "./ids";

const CHAIN_ID = 1337;

describe("ids", () => {
  describe("in any compatibility mode", () => {
    describe("makeResolverId", () => {
      it("should lowercase address", () => {
        expect(
          makeResolverId(
            false,
            CHAIN_ID,
            "0x2aaecbf301b736859333be66942cb6dbd3e9cafe",
            namehashInterpretedName(asInterpretedName("vitalik.eth")),
          ),
        ).toEqual(
          "1337-0x2aaecbf301b736859333be66942cb6dbd3e9cafe-0xee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a53475835",
        );
      });
    });

    describe("makeEventId", () => {
      it("should include transferIndex if available", () => {
        expect(makeEventId(false, 1, 123n, 456)).toMatch(/123-456$/);
        expect(makeEventId(false, 1, 123n, 456, 1)).toMatch(/123-456-1$/);
      });
    });
  });

  describe("in subgraph compatibility mode", () => {
    const isSubgraphCompatible = true;

    describe("makeResolverId", () => {
      it("should not include chain id", () => {
        expect(
          makeResolverId(
            isSubgraphCompatible,
            CHAIN_ID,
            zeroAddress,
            namehashInterpretedName(asInterpretedName("vitalik.eth")),
          ),
        ).toEqual(
          "0x0000000000000000000000000000000000000000-0xee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a53475835",
        );
      });
    });

    describe("makeEventId", () => {
      it("should not include chain id", () => {
        expect(makeEventId(isSubgraphCompatible, CHAIN_ID, 123n, 456)).toEqual("123-456");
      });
    });

    describe("makeRegistrationId", () => {
      it("should use the labelHash of the registered name", () => {
        expect(
          makeRegistrationId(
            isSubgraphCompatible,
            labelhashInterpretedLabel(asInterpretedLabel("vitalik")),
            namehashInterpretedName(asInterpretedName("vitalik.eth")),
          ),
        ).toEqual(labelhashInterpretedLabel(asInterpretedLabel("vitalik")));
      });
    });
  });

  describe("not in subgraph compatibility mode", () => {
    const isSubgraphCompatible = false;

    describe("makeResolverId", () => {
      it("should include chain id", () => {
        expect(
          makeResolverId(
            isSubgraphCompatible,
            CHAIN_ID,
            zeroAddress,
            namehashInterpretedName(asInterpretedName("vitalik.eth")),
          ),
        ).toEqual(
          "1337-0x0000000000000000000000000000000000000000-0xee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a53475835",
        );
      });
    });

    describe("makeEventId", () => {
      it("should include chain id", () => {
        expect(makeEventId(isSubgraphCompatible, CHAIN_ID, 123n, 456)).toEqual("1337-123-456");
      });
    });

    describe("makeRegistrationId", () => {
      it("should use the node of the registered name", () => {
        expect(
          makeRegistrationId(
            isSubgraphCompatible,
            labelhashInterpretedLabel(asInterpretedLabel("vitalik")),
            namehashInterpretedName(asInterpretedName("vitalik.linea.eth")),
          ),
        ).toEqual(namehashInterpretedName(asInterpretedName("vitalik.linea.eth")));
      });
    });
  });
});

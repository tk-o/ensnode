import { type TraceTransactionSchema, getAddressesFromTrace } from "@/lib/transaction-helpers";
import { describe, expect, it } from "vitest";

describe("transaction helpers", () => {
  describe("getAddressesFromTrace", () => {
    it("should extract all addresses from a transaction trace", () => {
      const trace = getExampleTransactionTrace();
      const addresses = getAddressesFromTrace(trace);

      expect(addresses).toEqual(
        new Set([
          "0xeDEE915Ae45Cc4B2FDd1Ce12a2f70dCa0B2AD9e5",
          "0xe915058dF18e7Efe92aF5c44Df3F575FBA061B64",
          "0x9fAD9FFceA95c345D41055a63bD099E1a0576109",
          "0x0000000000000000000000000000000000000001",
          "0x3DB8BC8c9BD565877B363AB4b4E7F39A777d5500",
          "0xE5857440BBFF64C98CEb70d650805E1E96addE7A",
          "0xb39e09279D4035c0F92307741d9dd8ed66e74de0",
          "0xC8aF9C2389AF5710Dba268050EbF9350CD0ACab3",
          "0xb684849F3a7bd53FbAD882302b5f7b9276C9B491",
          "0x5693e9eF54F7B78DdEf14997C1fbC51AA1d2FAc9",
          "0x60eEB5870ebEf49ce7cDc354dac49906CF8d9285",
          "0x2F84F6F613280Fd4dF11Ab2480E777ba8BB6282A",
          "0xF61f3C9cEcB8d206DeA1faEd99A693e6d3BAAEf2",
          "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
          "0x314159265dD8dbb310642f98f50C066173C1259b",
          "0xF58D55F06bB92f083E78bb5063A2DD3544f9B6a3",
          "0x084b1c3C81545d370f3634392De611CaaBFf8148",
          "0x15F50bB48cA4BE1aD4A6Ad5804B18FB7D198618F",
          "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF",
          "0x0000000000000000000000000000000000000000",
          "0x00000000000000000000000000000000000000Be",
          "0x00000000000000000000000000000000000F4240",
          "0x0000000000000000000000000000000000000120",
          "0x0000000000000000000000000000000000000420",
          "0x00000000000000000000000000000000000002c4",
          "0x497BB46fBac4658BE6fE113927aF536c68552282",
          "0x0000000000000000000000000000000000000003",
          "0x00000000000000000000000000000000000000E0",
          "0x00000000000000000000000000000000000001a0",
          "0x0000000000000000000000000000000000000240",
          "0x000000000000000000000000000000000000000A",
          "0x00000000000000000041C612de330711Ec108F2f",
          "0x0000000000000000000000000000000000000400",
          "0x0000000000000000000000000000000000000042",
          "0x000000000000000000000000004237f1058471f5",
          "0x0000000000000000000000000000000000003dB8",
          "0x000000000000000000000000000000000000001c",
          "0x0000000000000000000000000000000000000040",
          "0x0000000000000000000000000000000000000004",
          "0x03DB8bc8c9bd565877b363Ab4b4e7f39A777d550",
          "0x6325d247696D39ee59Ffd931a87e022A68bbBE4f",
          "0x00000000000000000000000000000000617Fe48d",
          "0x0000000000000000000000000000000000000080",
          "0x00000000000000000000000000000000000000C0",
          "0x000000000000000000000000000000000000001B",
          "0xD15953bD7cbCb36B69d4b9961b56F59cC2553d2E",
          "0x0000000000000000000000000000000000000017",
          "0x0000000000000000000000000000000000000044",
          "0x0000000000000000000000000000000000000020",
          "0x00000000000000000000000000000000000aac2b",
          "0x4eaD68830F45D73478C93953ED56c532bffff4B5",
          "0xeE94cf48924B720AF939E732E98F30F9594f87C5",
          "0x0000000000000000000000000000000007EBc7EA",
        ]),
      );
      expect(addresses.size).toBe(54);
    });

    it("should extract all addresses, including serialized ones, from a transaction trace", () => {
      const trace = getExampleTransactionTraceSerializedAddress();
      const addresses = getAddressesFromTrace(trace);

      expect(addresses).toEqual(
        new Set([
          "0x5cA1e1Ab50E1c9765F02B01FD2Ed340f394c5DDA",
          "0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb",
          "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
          "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
          "0x5fe156F51443AE995300efC719DDeAE1D2C76730",
          "0x0000000000000000000000000000000000000080",
          "0x000000000000000000000000000000000000000F",
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000040",
        ]),
      );
      expect(addresses.size).toBe(10);
    });
  });
});

/**
 * Get an example transaction trace that is compatible with the TraceTransactionSchema.
 * Mainnet Tx Hash: 0x3245f9b3273f458bfe6bc6a6e2ee7cef503e55a12d4ad15c2438fd529609577f
 * RPC Method: debug_traceTransaction
 * @returns A real example fetched from the Ethereum mainnet.
 */
function getExampleTransactionTrace(): TraceTransactionSchema["ReturnType"] {
  const rpcResponse = {
    jsonrpc: "2.0",
    id: 1,
    result: {
      from: "0xedee915ae45cc4b2fdd1ce12a2f70dca0b2ad9e5",
      gas: "0x16e360",
      gasUsed: "0x9f269",
      to: "0xe915058df18e7efe92af5c44df3f575fba061b64",
      input:
        "0x85a4b0de0000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d55000000000000000000000000009fad9ffcea95c345d41055a63bd099e1a05761090000000000000000000000000000000000000000000000000000000000000000853bf2cf7928daa179e0260d1153adba25afa78c444d7a3e8cb26f90a216833c000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000000be00000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000000000000002c4b6dffa3f000000000000000000000000497bb46fbac4658be6fe113927af536c68552282000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000000a6d696b6577616c6c6574000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041c612de330711ec108f2f6433b99ba0fbd14686a8e273766fc68175618749a6cd38b9ff962aabfc0cc4031e6ffe0d50e41f48852a488e42318d01d2dac95ff0231b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000e915058df18e7efe92af5c44df3f575fba061b64000000000000000000000000b684849f3a7bd53fbad882302b5f7b9276c9b4910000000000000000000000005693e9ef54f7b78ddef14997c1fbc51aa1d2fac900000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d92850000000000000000000000000000000000000000000000000000000000000042a779dbf3df828452c051ad0b93ce86c998bbd3973be70dcd33f6203db093a0bb133830b59126f2313f5ab22d557301b9e98c935eb8b9be2d002926172cea76b61c0200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004237f1058471f5d17c9b55aa0b254f5e16a9cfefe596d948bbf5a64029ac30fd2f2d28c1906074d1960214c20987cb4f949b29befd762b495b126b022b092316411c02000000000000000000000000000000000000000000000000000000000000",
      output: "0x0000000000000000000000000000000000000000000000000000000000000001",
      calls: [
        {
          from: "0xe915058df18e7efe92af5c44df3f575fba061b64",
          gas: "0xf4240",
          gasUsed: "0x8c8bd",
          to: "0x9fad9ffcea95c345d41055a63bd099e1a0576109",
          input:
            "0xb6dffa3f000000000000000000000000497bb46fbac4658be6fe113927af536c68552282000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000240000000000000000000000000000000000000000000000000000000000000000a6d696b6577616c6c6574000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041c612de330711ec108f2f6433b99ba0fbd14686a8e273766fc68175618749a6cd38b9ff962aabfc0cc4031e6ffe0d50e41f48852a488e42318d01d2dac95ff0231b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000e915058df18e7efe92af5c44df3f575fba061b64000000000000000000000000b684849f3a7bd53fbad882302b5f7b9276c9b4910000000000000000000000005693e9ef54f7b78ddef14997c1fbc51aa1d2fac900000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d92850000000000000000000000000000000000000000000000000000000000000042a779dbf3df828452c051ad0b93ce86c998bbd3973be70dcd33f6203db093a0bb133830b59126f2313f5ab22d557301b9e98c935eb8b9be2d002926172cea76b61c020000000000000000000000000000000000000000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d5500853bf2cf7928daa179e0260d1153adba25afa78c444d7a3e8cb26f90a216833c",
          output: "0x0000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d5500",
          calls: [
            {
              from: "0x9fad9ffcea95c345d41055a63bd099e1a0576109",
              gas: "0xee8dc",
              gasUsed: "0xbb8",
              to: "0x0000000000000000000000000000000000000001",
              input:
                "0x853bf2cf7928daa179e0260d1153adba25afa78c444d7a3e8cb26f90a216833c000000000000000000000000000000000000000000000000000000000000001ca779dbf3df828452c051ad0b93ce86c998bbd3973be70dcd33f6203db093a0bb133830b59126f2313f5ab22d557301b9e98c935eb8b9be2d002926172cea76b6",
              output: "0x000000000000000000000000497bb46fbac4658be6fe113927af536c68552282",
              type: "STATICCALL",
            },
            {
              from: "0x9fad9ffcea95c345d41055a63bd099e1a0576109",
              gas: "0xe5ebc",
              gasUsed: "0x2347",
              to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
              input:
                "0x3d602d80600a3d3981f3363d3d373d3d3d363d73e5857440bbff64c98ceb70d650805e1e96adde7a5af43d82803e903d91602b57fd5bf3",
              output:
                "0x363d3d373d3d3d363d73e5857440bbff64c98ceb70d650805e1e96adde7a5af43d82803e903d91602b57fd5bf3",
              value: "0x0",
              type: "CREATE2",
            },
            {
              from: "0x9fad9ffcea95c345d41055a63bd099e1a0576109",
              gas: "0xe3755",
              gasUsed: "0x3eb64",
              to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
              input:
                "0x3c5a3cea000000000000000000000000b39e09279d4035c0f92307741d9dd8ed66e74de000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004000000000000000000000000e915058df18e7efe92af5c44df3f575fba061b64000000000000000000000000b684849f3a7bd53fbad882302b5f7b9276c9b4910000000000000000000000005693e9ef54f7b78ddef14997c1fbc51aa1d2fac900000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d9285",
              calls: [
                {
                  from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                  gas: "0xdf432",
                  gasUsed: "0x3e0d3",
                  to: "0xe5857440bbff64c98ceb70d650805e1e96adde7a",
                  input:
                    "0x3c5a3cea000000000000000000000000b39e09279d4035c0f92307741d9dd8ed66e74de000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004000000000000000000000000e915058df18e7efe92af5c44df3f575fba061b64000000000000000000000000b684849f3a7bd53fbad882302b5f7b9276c9b4910000000000000000000000005693e9ef54f7b78ddef14997c1fbc51aa1d2fac900000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d9285",
                  calls: [
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xd5200",
                      gasUsed: "0x107",
                      to: "0xb39e09279d4035c0f92307741d9dd8ed66e74de0",
                      input: "0xb95459e4",
                      output: "0x000000000000000000000000c8af9c2389af5710dba268050ebf9350cd0acab3",
                      type: "STATICCALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xd3cd8",
                      gasUsed: "0xa2c",
                      to: "0xc8af9c2389af5710dba268050ebf9350cd0acab3",
                      input:
                        "0x2d9ad53d000000000000000000000000e915058df18e7efe92af5c44df3f575fba061b64",
                      output: "0x0000000000000000000000000000000000000000000000000000000000000001",
                      type: "STATICCALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xcdf97",
                      gasUsed: "0x684a",
                      to: "0xe915058df18e7efe92af5c44df3f575fba061b64",
                      input: "0x0f15f4c0",
                      calls: [
                        {
                          from: "0xe915058df18e7efe92af5c44df3f575fba061b64",
                          gas: "0xca7f3",
                          gasUsed: "0x5f55",
                          to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                          input:
                            "0xb149206e1626ba7e00000000000000000000000000000000000000000000000000000000000000000000000000000000e915058df18e7efe92af5c44df3f575fba061b64",
                          calls: [
                            {
                              from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                              gas: "0xc74c8",
                              gasUsed: "0x5ea6",
                              to: "0xe5857440bbff64c98ceb70d650805e1e96adde7a",
                              input:
                                "0xb149206e1626ba7e00000000000000000000000000000000000000000000000000000000000000000000000000000000e915058df18e7efe92af5c44df3f575fba061b64",
                              value: "0x0",
                              type: "DELEGATECALL",
                            },
                          ],
                          value: "0x0",
                          type: "CALL",
                        },
                      ],
                      value: "0x0",
                      type: "CALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xc6e7a",
                      gasUsed: "0xa2c",
                      to: "0xc8af9c2389af5710dba268050ebf9350cd0acab3",
                      input:
                        "0x2d9ad53d000000000000000000000000b684849f3a7bd53fbad882302b5f7b9276c9b491",
                      output: "0x0000000000000000000000000000000000000000000000000000000000000001",
                      type: "STATICCALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xc079c",
                      gasUsed: "0x632",
                      to: "0xb684849f3a7bd53fbad882302b5f7b9276c9b491",
                      input: "0x0f15f4c0",
                      value: "0x0",
                      type: "CALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xbf70e",
                      gasUsed: "0xa2c",
                      to: "0xc8af9c2389af5710dba268050ebf9350cd0acab3",
                      input:
                        "0x2d9ad53d0000000000000000000000005693e9ef54f7b78ddef14997c1fbc51aa1d2fac9",
                      output: "0x0000000000000000000000000000000000000000000000000000000000000001",
                      type: "STATICCALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xb9030",
                      gasUsed: "0x61c",
                      to: "0x5693e9ef54f7b78ddef14997c1fbc51aa1d2fac9",
                      input: "0x0f15f4c0",
                      value: "0x0",
                      type: "CALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xb7fb8",
                      gasUsed: "0xa2c",
                      to: "0xc8af9c2389af5710dba268050ebf9350cd0acab3",
                      input:
                        "0x2d9ad53d00000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d9285",
                      output: "0x0000000000000000000000000000000000000000000000000000000000000001",
                      type: "STATICCALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xb18da",
                      gasUsed: "0x13227",
                      to: "0x60eeb5870ebef49ce7cdc354dac49906cf8d9285",
                      input: "0x0f15f4c0",
                      calls: [
                        {
                          from: "0x60eeb5870ebef49ce7cdc354dac49906cf8d9285",
                          gas: "0xae0b1",
                          gasUsed: "0xab1",
                          to: "0x2f84f6f613280fd4df11ab2480e777ba8bb6282a",
                          input:
                            "0xe0bba2a00000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d55000000000000000000000000000000000000000000000000000000000000000001",
                          output:
                            "0x0000000000000000000000000000000000000000000000000000000000000000",
                          type: "STATICCALL",
                        },
                        {
                          from: "0x60eeb5870ebef49ce7cdc354dac49906cf8d9285",
                          gas: "0xad3cb",
                          gasUsed: "0x10782",
                          to: "0x2f84f6f613280fd4df11ab2480e777ba8bb6282a",
                          input:
                            "0xeb7448310000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d55000000000000000000000000006325d247696d39ee59ffd931a87e022a68bbbe4f00000000000000000000000000000000000000000000000000000000617fe48d0000000000000000000000000000000000000000000000000000000000000001",
                          output:
                            "0x00000000000000000000000000000000000000000000000000000000617fe48d",
                          calls: [
                            {
                              from: "0x2f84f6f613280fd4df11ab2480e777ba8bb6282a",
                              gas: "0xaa4f6",
                              gasUsed: "0x286",
                              to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                              input:
                                "0xc7b2e59600000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d9285",
                              output:
                                "0x0000000000000000000000000000000000000000000000000000000000000001",
                              calls: [
                                {
                                  from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                                  gas: "0xa79dd",
                                  gasUsed: "0x1da",
                                  to: "0xe5857440bbff64c98ceb70d650805e1e96adde7a",
                                  input:
                                    "0xc7b2e59600000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d9285",
                                  output:
                                    "0x0000000000000000000000000000000000000000000000000000000000000001",
                                  value: "0x0",
                                  type: "DELEGATECALL",
                                },
                              ],
                              type: "STATICCALL",
                            },
                          ],
                          value: "0x0",
                          type: "CALL",
                        },
                        {
                          from: "0x60eeb5870ebef49ce7cdc354dac49906cf8d9285",
                          gas: "0x9ce67",
                          gasUsed: "0xf60",
                          to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                          input:
                            "0xa063246100000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d9285",
                          calls: [
                            {
                              from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                              gas: "0x9a6a8",
                              gasUsed: "0xeb7",
                              to: "0xe5857440bbff64c98ceb70d650805e1e96adde7a",
                              input:
                                "0xa063246100000000000000000000000060eeb5870ebef49ce7cdc354dac49906cf8d9285",
                              calls: [
                                {
                                  from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                                  gas: "0x97c6a",
                                  gasUsed: "0x589",
                                  to: "0x60eeb5870ebef49ce7cdc354dac49906cf8d9285",
                                  input: "0x51b42b00",
                                  value: "0x0",
                                  type: "CALL",
                                },
                              ],
                              value: "0x0",
                              type: "DELEGATECALL",
                            },
                          ],
                          value: "0x0",
                          type: "CALL",
                        },
                      ],
                      value: "0x0",
                      type: "CALL",
                    },
                  ],
                  value: "0x0",
                  type: "DELEGATECALL",
                },
              ],
              value: "0x0",
              type: "CALL",
            },
            {
              from: "0x9fad9ffcea95c345d41055a63bd099e1a0576109",
              gas: "0xa587b",
              gasUsed: "0x60de",
              to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
              input: "0x0d009297000000000000000000000000497bb46fbac4658be6fe113927af536c68552282",
              calls: [
                {
                  from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                  gas: "0xa2e94",
                  gasUsed: "0x6035",
                  to: "0xe5857440bbff64c98ceb70d650805e1e96adde7a",
                  input:
                    "0x0d009297000000000000000000000000497bb46fbac4658be6fe113927af536c68552282",
                  calls: [
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0xa035c",
                      gasUsed: "0x96d",
                      to: "0xb39e09279d4035c0f92307741d9dd8ed66e74de0",
                      input: "0xc5c03699",
                      output: "0x0000000000000000000000009fad9ffcea95c345d41055a63bd099e1a0576109",
                      type: "STATICCALL",
                    },
                  ],
                  value: "0x0",
                  type: "DELEGATECALL",
                },
              ],
              value: "0x0",
              type: "CALL",
            },
            {
              from: "0x9fad9ffcea95c345d41055a63bd099e1a0576109",
              gas: "0x9ea6e",
              gasUsed: "0x26ad4",
              to: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
              input:
                "0x76d649740000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d5500000000000000000000000000497bb46fbac4658be6fe113927af536c68552282000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000a6d696b6577616c6c6574000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041c612de330711ec108f2f6433b99ba0fbd14686a8e273766fc68175618749a6cd38b9ff962aabfc0cc4031e6ffe0d50e41f48852a488e42318d01d2dac95ff0231b00000000000000000000000000000000000000000000000000000000000000",
              calls: [
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x9b070",
                  gasUsed: "0xbb8",
                  to: "0x0000000000000000000000000000000000000001",
                  input:
                    "0x45638975bcf8396335ea4688dbb183bb394a775df8a9456e9b4c41a125e2ee04000000000000000000000000000000000000000000000000000000000000001bc612de330711ec108f2f6433b99ba0fbd14686a8e273766fc68175618749a6cd38b9ff962aabfc0cc4031e6ffe0d50e41f48852a488e42318d01d2dac95ff023",
                  output: "0x000000000000000000000000d15953bd7cbcb36b69d4b9961b56f59cc2553d2e",
                  type: "STATICCALL",
                },
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x97e79",
                  gasUsed: "0x2744",
                  to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                  input:
                    "0x02571be3fda836f8885027577f9ca4f414d130dabafc826d5b781aa70419923a5169077f",
                  output: "0x0000000000000000000000000000000000000000000000000000000000000000",
                  calls: [
                    {
                      from: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                      gas: "0x93b9a",
                      gasUsed: "0x91c",
                      to: "0x314159265dd8dbb310642f98f50c066173c1259b",
                      input:
                        "0x02571be3fda836f8885027577f9ca4f414d130dabafc826d5b781aa70419923a5169077f",
                      output: "0x0000000000000000000000000000000000000000000000000000000000000000",
                      type: "STATICCALL",
                    },
                  ],
                  type: "STATICCALL",
                },
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x95420",
                  gasUsed: "0x61ed",
                  to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                  input:
                    "0x06ab59235c1eee8c1557a09e02b06677face65fb4793bb77c36e84a980a5ba6849153624072b95880f4b6f68454897e82571738141d35ec20b059242f35193b3ea608f0b000000000000000000000000f61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  output: "0xfda836f8885027577f9ca4f414d130dabafc826d5b781aa70419923a5169077f",
                  value: "0x0",
                  type: "CALL",
                },
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x8e961",
                  gasUsed: "0x5f33",
                  to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                  input:
                    "0x1896f70afda836f8885027577f9ca4f414d130dabafc826d5b781aa70419923a5169077f000000000000000000000000f58d55f06bb92f083e78bb5063a2dd3544f9b6a3",
                  value: "0x0",
                  type: "CALL",
                },
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x88973",
                  gasUsed: "0x9c6",
                  to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                  input:
                    "0x5b0fc9c3fda836f8885027577f9ca4f414d130dabafc826d5b781aa70419923a5169077f0000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                  value: "0x0",
                  type: "CALL",
                },
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x87426",
                  gasUsed: "0x674d",
                  to: "0xf58d55f06bb92f083e78bb5063a2dd3544f9b6a3",
                  input:
                    "0xd5fa2b00fda836f8885027577f9ca4f414d130dabafc826d5b781aa70419923a5169077f0000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                  value: "0x0",
                  type: "CALL",
                },
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x7f754",
                  gasUsed: "0xb87",
                  to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                  input:
                    "0x02571be391d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2",
                  output: "0x000000000000000000000000084b1c3c81545d370f3634392de611caabff8148",
                  type: "STATICCALL",
                },
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x7dfe8",
                  gasUsed: "0xd5c",
                  to: "0x084b1c3c81545d370f3634392de611caabff8148",
                  input:
                    "0xbffbe61c0000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                  output: "0x5b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                  type: "STATICCALL",
                },
                {
                  from: "0xf61f3c9cecb8d206dea1faed99a693e6d3baaef2",
                  gas: "0x7cf11",
                  gasUsed: "0x64da",
                  to: "0xf58d55f06bb92f083e78bb5063a2dd3544f9b6a3",
                  input:
                    "0x773722135b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000176d696b6577616c6c65742e6c6f6f7072696e672e657468000000000000000000",
                  value: "0x0",
                  type: "CALL",
                },
              ],
              value: "0x0",
              type: "CALL",
            },
            {
              from: "0x9fad9ffcea95c345d41055a63bd099e1a0576109",
              gas: "0x784fb",
              gasUsed: "0x11c49",
              to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
              input:
                "0x7122b74c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000084b1c3c81545d370f3634392de611caabff81480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000440f5a54660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f58d55f06bb92f083e78bb5063a2dd3544f9b6a300000000000000000000000000000000000000000000000000000000",
              output:
                "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000205b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
              calls: [
                {
                  from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                  gas: "0x76638",
                  gasUsed: "0x11b6d",
                  to: "0xe5857440bbff64c98ceb70d650805e1e96adde7a",
                  input:
                    "0x7122b74c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000084b1c3c81545d370f3634392de611caabff81480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000440f5a54660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f58d55f06bb92f083e78bb5063a2dd3544f9b6a300000000000000000000000000000000000000000000000000000000",
                  output:
                    "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000205b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                  calls: [
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0x73ca6",
                      gasUsed: "0x19d",
                      to: "0xb39e09279d4035c0f92307741d9dd8ed66e74de0",
                      input: "0xc5c03699",
                      output: "0x0000000000000000000000009fad9ffcea95c345d41055a63bd099e1a0576109",
                      type: "STATICCALL",
                    },
                    {
                      from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                      gas: "0x73999",
                      gasUsed: "0x10a3a",
                      to: "0x084b1c3c81545d370f3634392de611caabff8148",
                      input:
                        "0x0f5a54660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f58d55f06bb92f083e78bb5063a2dd3544f9b6a3",
                      output: "0x5b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                      calls: [
                        {
                          from: "0x084b1c3c81545d370f3634392de611caabff8148",
                          gas: "0x7064c",
                          gasUsed: "0x15b0",
                          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                          input:
                            "0x02571be35b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                          output:
                            "0x0000000000000000000000000000000000000000000000000000000000000000",
                          calls: [
                            {
                              from: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                              gas: "0x6de9b",
                              gasUsed: "0x91c",
                              to: "0x314159265dd8dbb310642f98f50c066173c1259b",
                              input:
                                "0x02571be35b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                              output:
                                "0x0000000000000000000000000000000000000000000000000000000000000000",
                              type: "STATICCALL",
                            },
                          ],
                          type: "STATICCALL",
                        },
                        {
                          from: "0x084b1c3c81545d370f3634392de611caabff8148",
                          gas: "0x6ee8e",
                          gasUsed: "0xd60",
                          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                          input:
                            "0x0178b8bf5b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                          output:
                            "0x0000000000000000000000000000000000000000000000000000000000000000",
                          calls: [
                            {
                              from: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                              gas: "0x6cf03",
                              gasUsed: "0x8b2",
                              to: "0x314159265dd8dbb310642f98f50c066173c1259b",
                              input:
                                "0x0178b8bf5b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                              output:
                                "0x0000000000000000000000000000000000000000000000000000000000000000",
                              type: "STATICCALL",
                            },
                          ],
                          type: "STATICCALL",
                        },
                        {
                          from: "0x084b1c3c81545d370f3634392de611caabff8148",
                          gas: "0x6dea8",
                          gasUsed: "0x5a1d",
                          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                          input:
                            "0x06ab592391d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2599aa826aecbc13439fa1ddb5ae4aaaf113109294e385c27d6337a85ce222fcd000000000000000000000000084b1c3c81545d370f3634392de611caabff8148",
                          output:
                            "0x5b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                          value: "0x0",
                          type: "CALL",
                        },
                        {
                          from: "0x084b1c3c81545d370f3634392de611caabff8148",
                          gas: "0x68393",
                          gasUsed: "0x5f33",
                          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                          input:
                            "0x1896f70a5b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7000000000000000000000000f58d55f06bb92f083e78bb5063a2dd3544f9b6a3",
                          value: "0x0",
                          type: "CALL",
                        },
                        {
                          from: "0x084b1c3c81545d370f3634392de611caabff8148",
                          gas: "0x62398",
                          gasUsed: "0xc68",
                          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
                          input:
                            "0x06ab592391d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2599aa826aecbc13439fa1ddb5ae4aaaf113109294e385c27d6337a85ce222fcd0000000000000000000000000000000000000000000000000000000000000000",
                          output:
                            "0x5b0ba6bcca7d936ac031eca4eabde74a36d3e010542c5cb64c43004172b5e3d7",
                          value: "0x0",
                          type: "CALL",
                        },
                      ],
                      value: "0x0",
                      type: "CALL",
                    },
                  ],
                  value: "0x0",
                  type: "DELEGATECALL",
                },
              ],
              value: "0x0",
              type: "CALL",
            },
          ],
          value: "0x0",
          type: "CALL",
        },
        {
          from: "0xe915058df18e7efe92af5c44df3f575fba061b64",
          gas: "0xd4e0d",
          gasUsed: "0xa16",
          to: "0xc8af9c2389af5710dba268050ebf9350cd0acab3",
          input: "0x1c5ebe2f0000000000000000000000009fad9ffcea95c345d41055a63bd099e1a0576109",
          output: "0x0000000000000000000000000000000000000000000000000000000000000000",
          type: "STATICCALL",
        },
        {
          from: "0xe915058df18e7efe92af5c44df3f575fba061b64",
          gas: "0xd3bbb",
          gasUsed: "0xa24",
          to: "0x2f84f6f613280fd4df11ab2480e777ba8bb6282a",
          input: "0x4a4fbeec0000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d5500",
          output: "0x0000000000000000000000000000000000000000000000000000000000000000",
          type: "STATICCALL",
        },
        {
          from: "0xe915058df18e7efe92af5c44df3f575fba061b64",
          gas: "0xd2fc3",
          gasUsed: "0x1f6",
          to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
          input: "0x8da5cb5b",
          output: "0x000000000000000000000000497bb46fbac4658be6fe113927af536c68552282",
          calls: [
            {
              from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
              gas: "0xcfa84",
              gasUsed: "0x150",
              to: "0xe5857440bbff64c98ceb70d650805e1e96adde7a",
              input: "0x8da5cb5b",
              output: "0x000000000000000000000000497bb46fbac4658be6fe113927af536c68552282",
              value: "0x0",
              type: "DELEGATECALL",
            },
          ],
          type: "STATICCALL",
        },
        {
          from: "0xe915058df18e7efe92af5c44df3f575fba061b64",
          gas: "0xd28e9",
          gasUsed: "0xbb8",
          to: "0x0000000000000000000000000000000000000001",
          input:
            "0x3b906d357f151382b6aa00432c6ec44be35f6f0750a8e7569949b33149a0afbc000000000000000000000000000000000000000000000000000000000000001c37f1058471f5d17c9b55aa0b254f5e16a9cfefe596d948bbf5a64029ac30fd2f2d28c1906074d1960214c20987cb4f949b29befd762b495b126b022b09231641",
          output: "0x000000000000000000000000497bb46fbac4658be6fe113927af536c68552282",
          type: "STATICCALL",
        },
        {
          from: "0xe915058df18e7efe92af5c44df3f575fba061b64",
          gas: "0xd0f76",
          gasUsed: "0x1529",
          to: "0x15f50bb48ca4be1ad4a6ad5804b18fb7d198618f",
          input:
            "0x71689b2b0000000000000000000000003db8bc8c9bd565877b363ab4b4e7f39a777d5500000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000aac2b0000000000000000000000004ead68830f45d73478c93953ed56c532bffff4b5",
          value: "0x0",
          type: "CALL",
        },
        {
          from: "0xe915058df18e7efe92af5c44df3f575fba061b64",
          gas: "0xcf610",
          gasUsed: "0x7985",
          to: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
          input:
            "0x7122b74c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000ee94cf48924b720af939e732e98f30f9594f87c50000000000000000000000000000000000000000000000000000000007ebc7ea00000000000000000000000000000000000000000000000000000000",
          output:
            "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001",
          calls: [
            {
              from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
              gas: "0xcc189",
              gasUsed: "0x78a9",
              to: "0xe5857440bbff64c98ceb70d650805e1e96adde7a",
              input:
                "0x7122b74c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000ee94cf48924b720af939e732e98f30f9594f87c50000000000000000000000000000000000000000000000000000000007ebc7ea00000000000000000000000000000000000000000000000000000000",
              output:
                "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001",
              calls: [
                {
                  from: "0x3db8bc8c9bd565877b363ab4b4e7f39a777d5500",
                  gas: "0xc8125",
                  gasUsed: "0x6925",
                  to: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                  input:
                    "0xa9059cbb000000000000000000000000ee94cf48924b720af939e732e98f30f9594f87c50000000000000000000000000000000000000000000000000000000007ebc7ea",
                  output: "0x0000000000000000000000000000000000000000000000000000000000000001",
                  calls: [
                    {
                      from: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                      gas: "0xc3345",
                      gasUsed: "0x4cac",
                      to: "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf",
                      input:
                        "0xa9059cbb000000000000000000000000ee94cf48924b720af939e732e98f30f9594f87c50000000000000000000000000000000000000000000000000000000007ebc7ea",
                      output: "0x0000000000000000000000000000000000000000000000000000000000000001",
                      value: "0x0",
                      type: "DELEGATECALL",
                    },
                  ],
                  value: "0x0",
                  type: "CALL",
                },
              ],
              value: "0x0",
              type: "DELEGATECALL",
            },
          ],
          value: "0x0",
          type: "CALL",
        },
      ],
      value: "0x0",
      type: "CALL",
    },
  } as const;

  return rpcResponse.result satisfies TraceTransactionSchema["ReturnType"];
}

/**
 * Get an example transaction trace that is compatible with the TraceTransactionSchema.
 * This example includes a serialized address that does not start with "0x".
 * Mainnet Tx Hash: 0x0f5e29f023c676b48c39ecc3f0b3a92ef7d97ed7d6ca2ef4222f366f563655fe
 * RPC Method: debug_traceTransaction
 * @returns A real example fetched from the Ethereum mainnet.
 */
function getExampleTransactionTraceSerializedAddress(): TraceTransactionSchema["ReturnType"] {
  const rpcResponse = {
    jsonrpc: "2.0",
    id: 1,
    result: {
      from: "0x5ca1e1ab50e1c9765f02b01fd2ed340f394c5dda",
      gas: "0x2b9a7",
      gasUsed: "0x1cfc6",
      to: "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb",
      input:
        "0x7a806d6b0000000000000000000000005fe156f51443ae995300efc719ddeae1d2c767300000000000000000000000005ca1e1ab50e1c9765f02b01fd2ed340f394c5dda000000000000000000000000231b0ee14048e9dccd1d247744d114a4eb5e8e630000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000f646576732e6862686172742e6574680000000000000000000000000000000000",
      output: "0x4ee2ce41b247e79bf952803c612d7d4f716c4c333d9e2e4e8022d798e8fd302f",
      calls: [
        {
          from: "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb",
          gas: "0x2408a",
          gasUsed: "0xaaf",
          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
          input:
            "0xe985e9c50000000000000000000000005fe156f51443ae995300efc719ddeae1d2c767300000000000000000000000005ca1e1ab50e1c9765f02b01fd2ed340f394c5dda",
          output: "0x0000000000000000000000000000000000000000000000000000000000000001",
          type: "STATICCALL",
        },
        {
          from: "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb",
          gas: "0x222df",
          gasUsed: "0xc8f0",
          to: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
          input:
            "0x5ef2c7f091d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2c767c9d51160e88a620e26aa56ba3efdfff68bb392984a67d50557df3d0cd94b0000000000000000000000005ca1e1ab50e1c9765f02b01fd2ed340f394c5dda000000000000000000000000231b0ee14048e9dccd1d247744d114a4eb5e8e630000000000000000000000000000000000000000000000000000000000000000",
          value: "0x0",
          type: "CALL",
        },
        {
          from: "0xa58e81fe9b61b5c3fe2afd33cf304c454abfc7cb",
          gas: "0x150f6",
          gasUsed: "0x6c0b",
          to: "0x231b0ee14048e9dccd1d247744d114a4eb5e8e63",
          input:
            "0x773722134ee2ce41b247e79bf952803c612d7d4f716c4c333d9e2e4e8022d798e8fd302f0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000f646576732e6862686172742e6574680000000000000000000000000000000000",
          value: "0x0",
          type: "CALL",
        },
      ],
      value: "0x0",
      type: "CALL",
    },
  } as const;

  return rpcResponse.result satisfies TraceTransactionSchema["ReturnType"];
}

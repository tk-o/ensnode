import { bytesToHex } from "viem";
import z from "zod/v4";
import { ParsePayload } from "zod/v4/core";
import {
  makeBytesSchema,
  makeChainIdSchema,
  makeCostSchema,
  makeLowercaseAddressSchema,
  makeUnixTimestampSchema,
} from "../internal";
import { type RegistrarAction, RegistrarActionType } from "./types";

export const makeRawReferrerSchema = (valueLabel: string = "Raw Referrer") =>
  makeBytesSchema(valueLabel).check(function invariant_rawReferrerIs32Bytes(ctx) {
    if (ctx.value.length !== 32) {
      console.log(ctx.value);
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: `${valueLabel} must be represented by exactly 32 bytes. Provided bytes count: ${ctx.value.length}.`,
      });
    }
  });

export const makeHashSchema = (valueLabel: string = "Hash") =>
  makeBytesSchema(valueLabel)
    .check(function invariant_hashIs32Bytes(ctx) {
      if (ctx.value.length !== 32) {
        ctx.issues.push({
          code: "custom",
          input: ctx.value,
          message: `${valueLabel} must be represented by exactly 32 bytes. Provided bytes count: ${ctx.value.length}`,
        });
      }
    })
    .transform((v) => bytesToHex(v));

const baseRegistrarAction = {
  node: makeHashSchema("Node"),

  baseCost: makeCostSchema(),

  premium: makeCostSchema(),

  total: makeCostSchema(),

  registrant: makeLowercaseAddressSchema(),

  /**
   * Raw Referrer
   *
   * A 32-bytes value.
   */
  rawReferrer: makeRawReferrerSchema(),

  /**
   * Interpreted Referrer
   *
   * Invariants:
   * - If the first `12`-bytes of “rawReferrer” are all `0`,
   *   then “interpretedReferrer” is the last `20`-bytes of “rawReferrer”,
   *   else: “interpretedReferrer” is the zero address.
   */
  interpretedReferrer: makeLowercaseAddressSchema(),

  /**
   * Block timestamp
   */
  blockTimestamp: makeUnixTimestampSchema(),

  /**
   * Chain ID
   */
  chainId: makeChainIdSchema(),

  /**
   * Transaction Hash
   */
  transactionHash: makeHashSchema("Transaction Hash"),
};

function invariant_registrarActionTotalIsSumOfBaseCostAndPremium(
  ctx: ParsePayload<RegistrarAction>,
) {
  const registrarAction = ctx.value;

  if (registrarAction.total !== registrarAction.baseCost + registrarAction.premium) {
    ctx.issues.push({
      code: "custom",
      input: registrarAction,
      message: `"total" must be equal to the sum of "baseCost" and "premium"`,
    });
  }
}

export const RegistrarActionRegistrationSchema = z
  .strictObject({
    type: z.literal(RegistrarActionType.Registration),

    ...baseRegistrarAction,
  })
  .check(invariant_registrarActionTotalIsSumOfBaseCostAndPremium);

export const RegistrarActionRenewalSchema = z
  .strictObject({
    type: z.literal(RegistrarActionType.Renewal),

    ...baseRegistrarAction,

    premium: baseRegistrarAction.premium.max(0n, {
      error: "Premium must always be `0` for renewals",
    }),
  })
  .check(invariant_registrarActionTotalIsSumOfBaseCostAndPremium);

/**
 * Schema for {@link RegistrarAction}.
 */
export const RegistrarActionSchema = z.discriminatedUnion("type", [
  RegistrarActionRegistrationSchema,
  RegistrarActionRenewalSchema,
]);

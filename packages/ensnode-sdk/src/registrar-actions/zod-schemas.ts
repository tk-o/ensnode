import z from "zod/v4";
import type { ParsePayload } from "zod/v4/core";

import {
  makeChainIdSchema,
  makeHexStringSchema,
  makeLowercaseAddressSchema,
  makePriceSchema,
  makeUnixTimestampSchema,
} from "../internal";
import { decodeReferrer } from "./helpers";
import { type RegistrarAction, RegistrarActionType } from "./types";

/** Invariant: total is sum of baseCost and premium */
function invariant_registrarActionTotalIsSumOfBaseCostAndPremium(
  ctx: ParsePayload<Pick<RegistrarAction, "baseCost" | "premium" | "total">>,
) {
  const registrarAction = ctx.value;

  if (
    registrarAction.total.amount !==
    registrarAction.baseCost.amount + registrarAction.premium.amount
  ) {
    ctx.issues.push({
      code: "custom",
      input: registrarAction,
      message: `'total' must be equal to the sum of 'baseCost' and 'premium'`,
    });
  }

  if (registrarAction.total.currency !== registrarAction.baseCost.currency) {
    ctx.issues.push({
      code: "custom",
      input: registrarAction,
      message: `'total.currency' must be equal to 'baseCost.currency'`,
    });
  }

  if (registrarAction.total.currency !== registrarAction.premium.currency) {
    ctx.issues.push({
      code: "custom",
      input: registrarAction,
      message: `'total.currency' must be equal to 'premium.currency'`,
    });
  }
}

/** Invariant: decodedReferrer is based on encodedReferrer */
function invariant_registrarActionDecodedReferrerBasedOnRawReferrer(
  ctx: ParsePayload<Pick<RegistrarAction, "encodedReferrer" | "decodedReferrer">>,
) {
  const registrarAction = ctx.value;
  const expectedDecodedReferrer = decodeReferrer(registrarAction.encodedReferrer);

  console.log({
    actual: registrarAction.decodedReferrer,
    expectedDecodedReferrer,
  });

  if (registrarAction.decodedReferrer !== expectedDecodedReferrer) {
    ctx.issues.push({
      code: "custom",
      input: ctx.value,
      message: `'decodedReferrer' must be based on 'encodedReferrer'`,
    });
  }
}

const makeBaseRegistrarActionSchema = (valueLabel: string = "Base Registrar Action") =>
  z.object({
    node: makeHexStringSchema({ expectedLength: 32 }, `${valueLabel} Node`),

    baseCost: makePriceSchema(`${valueLabel} Base Cost`),
    premium: makePriceSchema(`${valueLabel} Premium`),
    total: makePriceSchema(`${valueLabel} Total`),

    registrant: makeLowercaseAddressSchema(`${valueLabel} Registrant`),
    encodedReferrer: makeHexStringSchema({ expectedLength: 32 }, `${valueLabel} Encoded Referrer`),
    decodedReferrer: makeLowercaseAddressSchema(`${valueLabel} Decoded Referrer`),

    timestamp: makeUnixTimestampSchema(`${valueLabel} Block Timestamp`),
    chainId: makeChainIdSchema(`${valueLabel} Chain ID`),
    transactionHash: makeHexStringSchema({ expectedLength: 32 }, `${valueLabel} Transaction Hash`),
  });

export const makeRegistrarActionRegistrationSchema = (valueLabel: string = "Registration ") =>
  makeBaseRegistrarActionSchema(valueLabel)
    .extend({
      type: z.literal(RegistrarActionType.Registration),
    })
    .check(invariant_registrarActionTotalIsSumOfBaseCostAndPremium)
    .check(invariant_registrarActionDecodedReferrerBasedOnRawReferrer);

export const makeRegistrarActionRenewalSchema = (valueLabel: string = "Renewal") =>
  makeBaseRegistrarActionSchema(valueLabel)
    .extend({
      type: z.literal(RegistrarActionType.Renewal),

      premium: makePriceSchema(`${valueLabel} Premium`).refine((v) => v.amount === 0n, {
        error: `Renewal Premium must always be '0'`,
      }),
    })
    .check(invariant_registrarActionTotalIsSumOfBaseCostAndPremium)
    .check(invariant_registrarActionDecodedReferrerBasedOnRawReferrer);

/**
 * Schema for {@link RegistrarAction}.
 */
export const makeRegistrarActionSchema = (valueLabel: string = "Registrar Action") =>
  z.discriminatedUnion("type", [
    makeRegistrarActionRegistrationSchema(`${valueLabel}.Registration`),
    makeRegistrarActionRenewalSchema(`${valueLabel}.Renewal`),
  ]);

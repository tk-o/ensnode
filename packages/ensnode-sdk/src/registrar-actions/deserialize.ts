import { prettifyError } from "zod/v4";
import type { SerializedRegistrarAction } from "./serialized-types";
import type { RegistrarAction } from "./types";
import { RegistrarActionSchema } from "./zod-schemas";

export function deserializeRegistrarAction(
  maybeRegistrarAction: SerializedRegistrarAction,
): RegistrarAction {
  const parsed = RegistrarActionSchema.safeParse(maybeRegistrarAction);

  if (parsed.error) {
    throw new Error(`Cannot deserialize RegistrarAction:\n${prettifyError(parsed.error)}\n`);
  }

  return parsed.data;
}

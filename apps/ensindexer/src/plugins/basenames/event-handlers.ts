/**
 * A list of callbacks attaching event handlers for the `basenames` plugin.
 * The event handlers will be attached only if the plugin set as active
 * in the ENSIndexerConfig.
 */

import attachResolverHandlers from "@/plugins/shared/Resolver";
import attachRegistrarHandlers from "./handlers/Registrar";
import attachRegistryHandlers from "./handlers/Registry";

export default [attachResolverHandlers, attachRegistrarHandlers, attachRegistryHandlers];

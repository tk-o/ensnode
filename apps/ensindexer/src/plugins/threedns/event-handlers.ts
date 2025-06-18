/**
 * A list of callbacks attaching event handlers for the `threedns` plugin.
 * The event handlers will be attached only if the plugin set as active
 * in the ENSIndexerConfig.
 */

import attachThreeDNSTokenHandlers from "./handlers/ThreeDNSToken";

export default [attachThreeDNSTokenHandlers];

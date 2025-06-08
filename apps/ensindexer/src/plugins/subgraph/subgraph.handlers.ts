import resolverHandlers from "@/plugins/shared/Resolver";
import nameWrapperHandlers from "./handlers/NameWrapper";
import registrarHandlers from "./handlers/Registrar";
import registryHandlers from "./handlers/Registry";

export default [resolverHandlers, nameWrapperHandlers, registrarHandlers, registryHandlers];

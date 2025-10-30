import config from "@/config";

import { PluginName } from "@ensnode/ensnode-sdk";

import attach_Basenames_Registrars from "./basenames/handlers/Basenames_Registrar";
import attach_Basenames_RegistrarControllers from "./basenames/handlers/Basenames_RegistrarController";
import attach_ENSRoot_Registrars from "./ens-root/handlers/ENSRoot_Registrar";
import attach_ENSRoot_RegistrarControllers from "./ens-root/handlers/ENSRoot_RegistrarController";
import attach_Lineanames_Registrars from "./lineanames/handlers/Lineanames_Registrar";
import attach_Lineanames_RegistrarControllers from "./lineanames/handlers/Lineanames_RegistrarController";

// conditionally attach event handlers when Ponder executes this file
if (config.plugins.includes(PluginName.Registrars)) {
  attach_ENSRoot_Registrars();
  attach_ENSRoot_RegistrarControllers();

  attach_Basenames_Registrars();
  attach_Basenames_RegistrarControllers();

  attach_Lineanames_Registrars();
  attach_Lineanames_RegistrarControllers();
}

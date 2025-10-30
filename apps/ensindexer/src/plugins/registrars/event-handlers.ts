import config from "@/config";

import { PluginName } from "@ensnode/ensnode-sdk";

import attach_BaseEth_Registrars from "./basenames/handlers/BaseEth_Registrar";
import attach_BaseEth_RegistrarControllers from "./basenames/handlers/BaseEth_RegistrarController";
import attach_Eth_Registrars from "./ens-root/handlers/Eth_Registrar";
import attach_Eth_RegistrarControllers from "./ens-root/handlers/Eth_RegistrarController";
import attach_LineaEth_Registrars from "./lineanames/handlers/LineaEth_Registrar";
import attach_LineaEth_RegistrarControllers from "./lineanames/handlers/LineaEth_RegistrarController";

// conditionally attach event handlers when Ponder executes this file
if (config.plugins.includes(PluginName.Registrars)) {
  attach_Eth_Registrars();
  attach_Eth_RegistrarControllers();

  attach_BaseEth_Registrars();
  attach_BaseEth_RegistrarControllers();

  attach_LineaEth_Registrars();
  attach_LineaEth_RegistrarControllers();
}

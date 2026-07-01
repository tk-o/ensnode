import type { IndexingEngineAdapter } from "../../adapter";
import attach_Basenames_Registrars from "./basenames/handlers/Basenames_Registrar";
import attach_Basenames_RegistrarControllers from "./basenames/handlers/Basenames_RegistrarController";
import attach_Ethnames_Registrars from "./ethnames/handlers/Ethnames_Registrar";
import attach_Ethnames_RegistrarController from "./ethnames/handlers/Ethnames_RegistrarController";
import attach_Lineanames_Registrars from "./lineanames/handlers/Lineanames_Registrar";
import attach_Lineanames_RegistrarControllers from "./lineanames/handlers/Lineanames_RegistrarController";

export default function (adapter: IndexingEngineAdapter) {
  attach_Ethnames_Registrars(adapter);
  attach_Ethnames_RegistrarController(adapter);

  attach_Basenames_Registrars(adapter);
  attach_Basenames_RegistrarControllers(adapter);

  attach_Lineanames_Registrars(adapter);
  attach_Lineanames_RegistrarControllers(adapter);
}

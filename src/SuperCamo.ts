import { NedbClient } from "./structures/NedbClient";
import { SuperCamoLogger } from "./utils/logging";
import { isDatabaseConnected_RootHelper } from "./validators/functions/isDatabaseConnected";
import path from "node:path";


export class SuperCamo {

	static clients: typeof NedbClient[];

	static clientConnect(targetClient: string){

	}

	static clientDisconnect(targetClient: string){

	}

	static clientGet(targetClient: string){

	}


}


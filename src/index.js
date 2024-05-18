import { NedbDocument, NedbClient } from "./structures/index.js";
import { doesExtendNedbClient, isDatabaseConnected } from "./validators/index.js";
import * as path from "node:path";

export default class SuperCamo {
	// No constructor! Only statics!
	// Use this library like: 
	// SuperCamo.connect(clientClass, databaseName, databaseDirectory);
	// SuperCamo.getDatabase(databaseName)[modelName].findOne(collectionQuery);
	// etc etc.


	//#region SuperCamo.activeClients

	static #activeClients = {};

	/**
	 * An object containing each connected database client. 
	 * Access a specific database client using its name.
	 * @author BigfootDS
	 *
	 * @static
	 */
	static get activeClients(){
		return SuperCamo.#activeClients;
	}

	static set activeClients(newValue){
		throw new Error("Performing direct operations on this variable is not allowed for database safety. Please use methods that do modifications to this variable, such as SuperCamo.connect(), instead.");
	}
	//#endregion

	
	/**
	 * Connect to a new database client instance, store its reference in SuperCamo's `SuperCamo.activeClients` property, and return the newly-connected instance.
	 * 
	 * This also creates the database if it didn't already exist.
	 * @author BigfootDS
	 *
	 * @async
	 * @param databaseName A string that follows JavaScript variable naming rules. This will be the key needed to access this database from the SuperCamo.activeClients object, and doesn't need to have any commonality with the database directory path.
	 * @param databaseDirectory A path to a directory to store all NeDB files.
	 * @param {[{name: string, model: NedbDocument}]} collectionsList An array of objects containing a desired name for a collection as well as the Document-inheriting model that should be used for that collection. You must provide ALL intended models & collections for the database client in this property - don't leave anything out!
	 * @returns An instance of a NeDB database client.
	 */
	static connect = async (databaseName, databaseDirectory = "", collectionsList = []) => {
		
		if (isDatabaseConnected(databaseName)){
			throw new Error(`Database name already in use: ${databaseName}`);
		}

		let clientInstance = new NedbClient(path.join(databaseDirectory, databaseName), collectionsList);
		SuperCamo.#activeClients[databaseName] = clientInstance;
		return clientInstance;
	}

	static getClientByName = (name) => {
		return SuperCamo.#activeClients[databaseName];
	}

	static getClientList = () => {
		return Object.keys(SuperCamo.#activeClients);
	}

}
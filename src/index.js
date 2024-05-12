import { doesExtendNedbClient, isDatabaseConnected } from "./validators/index.js";


export default class SuperCamo {
	// No constructor! Only statics!
	// Use this library like: 
	// SuperCamo.connect(clientClass, databaseName, databaseDirectory);
	// SuperCamo.getDatabase(databaseName)[modelName].findOne(collectionQuery);
	// etc etc.

	//#region Supercamo.activeClients

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
	 * Connect to a new database client instance, store its reference in SuperCamo, and return the newly-connected instance.
	 * 
	 * This also creates the database if it didn't already exist.
	 * @author BigfootDS
	 *
	 * @async
	 * @param clientClass A class that inherits from NedbClient, containing your customisations such as allowed Documents.
	 * @param databaseName A string that follows JavaScript variable naming rules. This will be the key needed to access this database from the SuperCamo.activeClients object, and doesn't need to have any commonality with the database directory path.
	 * @param databaseDirectory A path to a directory to store all NeDB files.
	 * @returns An instance of the provided clientClass.
	 */
	static connect = async (clientClass, databaseName, databaseDirectory) => {
		if (!doesExtendNedbClient(clientClass)){
			throw new Error(`Provided client class doesn't inherit from NedbClient: ${clientClass.name}`);
		}
		if (isDatabaseConnected(databaseName)){
			throw new Error(`Database name already in use: ${databaseName}`);
		}

		let clientInstance = new clientClass(databaseDirectory);
		SuperCamo.#activeClients[databaseName] = clientInstance;
		return clientInstance;
	}

}
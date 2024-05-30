const { NedbClient } = require("./structures/index.js");
const { isDatabaseConnected_RootHelper } = require("./validators/index.js");
const path = require("node:path");

/**
 * Main interface of the SuperCamo system.
 * @author BigfootDS
 *
 * @export
 * @class
 */
module.exports = class SuperCamo {
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
	 * @param {[{name: string, model: any}]} collectionsList An array of objects containing a desired name for a collection as well as the Document-inheriting model that should be used for that collection. You must provide ALL intended models & collections for the database client in this property - don't leave anything out!
	 * @returns {NedbClient} An instance of a NeDB database client.
	 */
	static connect = async (databaseName, databaseDirectory = "", collectionsList = []) => {
		if (isDatabaseConnected_RootHelper(databaseName, Object.keys(SuperCamo.#activeClients))){
			throw new Error(`Database name already in use: ${databaseName}`);
		}

		let clientInstance = new NedbClient(path.join(databaseDirectory, databaseName), databaseName, collectionsList);
		SuperCamo.#activeClients[databaseName] = clientInstance;
		return clientInstance;
	}

	
	/**
	 * Retrieve a specific active database client instance from SuperCamo.
	 * @author BigfootDS
	 *
	 * @param name The name of the database you wish to access.
	 * @returns {NedbClient} A client managing a specific database.
	 */
	static getClientByName = (name) => {
		return SuperCamo.#activeClients[name];
	}

	static getClientList = () => {
		return Object.keys(SuperCamo.#activeClients);
	}

}

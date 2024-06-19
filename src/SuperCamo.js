const NedbClient = require("./structures/database/NedbClient.js");
const SuperCamoLogger = require("./utils/logging.js");
const { isDatabaseConnected_RootHelper } = require("./validators/index.js");
const path = require("node:path");

/**
 * Main interface of the SuperCamo system. The functionality of SuperCamo is declared as static items on ths SuperCamo class.
 * So, use expressions like:
 * 
 * @example
 * let myDatabase = await SuperCamo.connect(
 * 	// Read documentation to see what properties go into the SuperCamo.connect() method!
 * );
 * 
 * @author BigfootDS
 *
 * @class
 */
class SuperCamo {
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
	 * @param {String} databaseName A string that follows JavaScript variable naming rules. This will be the key needed to access this database from the SuperCamo.activeClients object, and doesn't need to have any commonality with the database directory path.
	 * @param databaseDirectory A path to a directory to store all NeDB files.
	 * @param {[{name: String, model: any}]} collectionsList An array of objects containing a desired name for a collection as well as the Document-inheriting model that should be used for that collection. You must provide ALL intended models & collections for the database client in this property - don't leave anything out!
	 * @param {[any]} subdocumentsList An array of classes that inherit from NedbEmbeddedDocument. Do not leave this out if you're using subdocs/embedded docs! This is required for validation.
	 * @returns {NedbClient} An instance of a NeDB database client.
	 */
	static connect = async (databaseName, databaseDirectory = "", collectionsList = [], subdocumentsList = []) => {
		if (isDatabaseConnected_RootHelper(databaseName, Object.keys(SuperCamo.#activeClients))){
			throw new Error(`Database name already in use: ${databaseName}`);
		}

		let clientInstance = new NedbClient(path.join(databaseDirectory, databaseName), databaseName, collectionsList, subdocumentsList);
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

	
	/**
	 * Retrieve the list of database names registered to SuperCamo within this app's current lifetime.
	 * @author BigfootDS
	 *
	 * @returns {String[]} Array of database names registered in this app's lifetime to SuperCamo.
	 */
	static getClientList = () => {
		return Object.keys(SuperCamo.#activeClients);
	}

	
	/**
	 * Return an array of all NedbDocuments and NedbEmbeddedDocuments registered in this app's current session usage of SuperCamo. Should be a unique list, no duplicate models.
	 * @author BigfootDS
	 *
	 * @returns
	 */
	static getRegisteredModels = () => {
		let modelList = [];
		
		for (const client in SuperCamo.#activeClients) {
			if (Object.hasOwnProperty.call(SuperCamo.#activeClients, client)) {

				
				/**
				 * @type {NedbClient}
				 * @author BigfootDS
				 */
				const localClient = SuperCamo.#activeClients[client];
				
				let clientModels = localClient.getModelsList();
				SuperCamoLogger(`Adding this list of models from  ${localClient.databaseName} to the SuperCamo registered models list:`, "Root");
				SuperCamoLogger(clientModels, "Root");

				modelList = [...new Set(...modelList, clientModels)];
			}
		}

		return modelList;
	}
}


module.exports = SuperCamo;
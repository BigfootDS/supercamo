import { CollectionsListEntry } from "./structures/interfaces/CollectionsListEntryInterface";
import { NedbClient } from "./structures/types/NedbClient";
import { SuperCamoLogger } from "./utils/logging";
import { isDatabaseConnected_RootHelper } from "./validators/functions/isDatabaseConnected";
import path from "node:path";


export class SuperCamo {

	
	/**
	 * An object containing the app's currently-connected database clients. Each key in this object is one client, and the name of each key is the name of that database.
	 * @author BigfootDS
	 *
	 * @static
	 * 
	 * @example 
	 * ```js
	 *	let pokemonDatabase = SuperCamo.clientConnect(
	 *		"Pokemon Database", 
	 *		"./Storage", 
	 *		[
	 *			new CollectionListEntry("Users", User),
	 *			new CollectionListEntry("CapturedPokemon", Pokemon),
	 *			new CollectionListEntry("WildPokemon", Pokemon)
	 *		]
	 * );
	 * ```
	 */
	static clients: {[key: string]: NedbClient} = {};

	
	/**
	 * Create a database client instance, connecting to it and returning its instance.
	 * @author BigfootDS
	 *
	 * @static
	 * @param {string} databaseName A unique name for the database. 
	 * @param {string} [databaseDirectory=""] The folder path for where the database and its collections will be stored.
	 * @param {Array<CollectionsListEntry>} [collectionsList=[]] An array of collections, where each item in this array is an object containing the name of the collection and the model or document that the collection will use.
	 * @param {typeof NedbClient} [clientType=NedbClient] A custom type of database client, though you can leave this blank to use the default SuperCamo database client.
	 * @returns The newly-created database client instance.
	 */
	static clientConnect(databaseName: string, databaseDirectory: string = "", collectionsList: Array<CollectionsListEntry> = [], clientType: typeof NedbClient = NedbClient){
		if (SuperCamo.clientList().includes(databaseName)){
			throw new Error(`Database name already in use: ${databaseName}`);
		}

		let clientInstance = new clientType(databaseName, databaseDirectory, collectionsList);

		SuperCamo.clients[databaseName] = clientInstance;

		return clientInstance;
	}

	
	/**
	 * Disconnect from the specified database.
	 * @author BigfootDS
	 *
	 * @static
	 * @param targetClient The name of the database that you wish to disconnect from.
	 * @returns Number of clients disconnected.
	 */
	static clientDisconnect(targetClient: string): number{
		let tempFiltered = Object.keys(SuperCamo.clients).filter(client => SuperCamo.clients[targetClient].name !== targetClient);
		return Object.keys(SuperCamo.clients).length - tempFiltered.length;;
	}

	
	/**
	 * Create an accessor for a database that is connected in the app.
	 * @author BigfootDS
	 *
	 * @static
	 * @param targetClient The name of the database that you wish to disconnect from.
	 * @returns A NedbClient instance.
	 */
	static clientGet(targetClient: string): typeof NedbClient|null{
		if (SuperCamo.clients){
			// @ts-ignore
			return SuperCamo.clients[targetClient];
		} else {
			return null;
		}
		
	}

	
	/**
	 * Get a list of databases connected.
	 * @author BigfootDS
	 *
	 * @static
	 * @returns
	 */
	static clientList(): string[]{
		return SuperCamo.clients ? Object.keys(SuperCamo.clients) : [];
	}


}

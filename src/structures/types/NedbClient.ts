import path from "node:path";
import { CollectionAccessor } from "../interfaces/CollectionAccessorInterface";
import { NedbClientEntry } from "../interfaces/NedbClientEntryInterface";
import { NedbDocument } from "./NedbDocument";
import { NedbEmbeddedDocument } from "./NedbEmbeddedDocument";
import {default as Datastore} from "@seald-io/nedb";
import { parseCollectionsListForEmbeddeddocuments } from "../../utils/nedbClientHelper";
import { CollectionListEntry } from "./CollectionListEntry";


export class NedbClient implements NedbClientEntry {
	
	/**
	 * The name of the database.
	 * @author BigfootDS
	 */
	name: string = "";
	
	/**
	 * The database's folder path, where it stores all collections.
	 * @author BigfootDS
	 */
	path: string = "";
	
	/**
	 * A list of meta-objects defining categories of documents in the database. 
	 * 
	 * A collection is an object containing a collection name, document type, plus other properties to help access that data. This means that multiple collections could use the same document type while still keeping database records in separate collections in the database.
	 * @author BigfootDS
	 */
	collections: CollectionAccessor[] = [];
	
	/**
	 * The set of document types used in this database. 
	 * 
	 * This is calculated based on the collections that the database is configured to use, since multiple collections could use the same document type.
	 * @author BigfootDS
	 */
	documents: typeof NedbDocument[] = [];

	/**
	 * The set of embedded-document types used in this database. 
	 * 
	 * This is calculated based on the collections that the database is configured to use, since multiple collections could use the same embedded-document type.
	 * @author BigfootDS
	 */
	embeddedDocuments: typeof NedbEmbeddedDocument[] = [];
	
	
	/**
	 * Creates an instance of NedbClient.
	 * @author BigfootDS
	 *
	 * @constructor
	 * @param {string} dbName A unique name for the database. 
	 * @param {string} dbDirectoryPath The folder path for where the database and its collections will be stored.
	 * @param {Array<CollectionListEntry>} collectionsList An array of collections, where each item in this array is an object containing the name of the collection and the model or document that the collection will use.
	 */
	constructor(dbName: string, dbDirectoryPath: string, collectionsList: Array<CollectionListEntry>){
		this.name = dbName;
		this.path = dbDirectoryPath;

		this.collections = collectionsList.map((kvp) => {
			return this.createCollection(kvp.model, kvp.name);
		})

		this.documents = [...new Set(collectionsList.map((kvp) => {
			return kvp.model;
		}))];

		this.embeddedDocuments = parseCollectionsListForEmbeddeddocuments(collectionsList);
	}



	//#region Client Collection Utilities

	/**
	 * Retrieve the collection meta object stored on the NeDB client instance matching a given collection name.
	 * 
	 * @author BigfootDS
	 *
	 * @param {string} collectionName A string of the collection name to target within the database.
	 * @returns {CollectionAccessor} An object containing helper properties to perform collection-related operations.
	 */
	getCollectionAccessor = (collectionName: string): CollectionAccessor => {
		let foundAccessor = this.collections.find(collection => {
			return collection.name === collectionName
		});

		if (foundAccessor){
			return foundAccessor;
		} else {
			throw new Error(`Collection not found in the database client instance:\n\t${collectionName}\nAvailable collections are:\n\t${this.collections.map((obj) => obj.name)}\n`);
		}
	}

	
	/**
	 * Configure an enforced constraint on a collection.
	 * 
	 * See the [@seald/nedb](https://github.com/seald/nedb?tab=readme-ov-file#indexing) documentation for more info about NeDB indexes.
	 * @author BigfootDS
	 *
	 * @async
	 * @param {string} collectionName A string of the collection name to target within the database.
	 * @param {Datastore.EnsureIndexOptions} indexOptions An object per the [@seald/nedb](https://github.com/seald/nedb?tab=readme-ov-file#indexing) documentation to configure the index that is to be created.
	 * @returns {Promise<void>} Promise.
	 */
	createIndex = async (collectionName: string, indexOptions: Datastore.EnsureIndexOptions): Promise<void> => {
		let accessor = this.getCollectionAccessor(collectionName);
		return await accessor.datastore.ensureIndexAsync(indexOptions);
	}

	
	/**
	 * Remove a collection's index from an array of given field names.
	 * @author BigfootDS
	 *
	 * @async
	 * @param {string} collectionName A string of the collection name to target within the database.
	 * @param {string[]} fieldNames An array containing one or more fields on the collection that you'd like to remove the index from.
	 * @returns {Promise<void>} Promise.
	 */
	removeIndex = async (collectionName: string, fieldNames: string[]): Promise<void> => {
		let accessor = this.getCollectionAccessor(collectionName);
		return await accessor.datastore.removeIndexAsync(fieldNames);
	}

	
	/**
	 * Add a new collection to an existing database.
	 * @author BigfootDS
	 *
	 * @param {typeof NedbDocument} model
	 * @param {string} name
	 * @returns
	 */
	createCollection = (model: typeof NedbDocument, name: string): CollectionAccessor => {
        let newCollectionPath = path.join(this.path, name + ".db");
        let newCollectionObj = {
            model: model,
            name: name,
            path: newCollectionPath,
            datastore: new Datastore({filename: newCollectionPath, autoload: true})
        };

        if (this.collections.some(collectionObj => collectionObj.name == newCollectionObj.name)){
            throw new Error("Collection already exists in the database client, will not make duplicate datastores: " + newCollectionObj.name + "\n\tWe currently have these collections in the database client: " + this.collections.map((collectionObj => collectionObj.name)));
        } else {
            this.collections.push(newCollectionObj);
        }
            
        // Return an object to stick into collections, containing info about the specific collection based on the given model.
        return newCollectionObj;
    }

	deleteCollectionByName = async (name: string, deleteData: boolean = true): Promise<number> => {
		let numDeleted: number = 0;

		if (deleteData){
			let accessor = this.getCollectionAccessor(name);
			await accessor.datastore.dropDatabaseAsync();
		}

		let tempFiltered = this.collections.filter(collectionObj => collectionObj.name !== name);

		numDeleted = this.collections.length - tempFiltered.length;

		this.collections = tempFiltered;

		return numDeleted;
	}

	deleteCollectionByModel = async (model: typeof NedbDocument, deleteData: boolean = true): Promise<number> => {
		let numDeleted: number = 0;

		if (deleteData){
			let collectionsToDelete = this.collections.filter(collectionObj => collectionObj.model === model);
			for (const collection of collectionsToDelete){
				let accessor = this.getCollectionAccessor(collection.name);
				await accessor.datastore.dropDatabaseAsync();
			}
			
		}

		let tempFiltered = this.collections.filter(collectionObj => collectionObj.model !== model);
		
		numDeleted = this.collections.length - tempFiltered.length;

		this.collections = tempFiltered;

		return numDeleted;
	}

	//#endregion

	//#region Database General Data Utilities

	dumpDatabaseAsObjects = async () => {

	}

	dumpDatabaseAsDocuments = async () => {
		
	}

	dropDatabase = async () => {

	}

	//#endregion


	//#region Collection-specific Data CREATE Utilities

	
	/**
	 * Insert a document instance into the database.
	 * @author BigfootDS
	 *
	 * @async
	 * @returns
	 */
	insertOne = async () => {

	}

	/**
	 * Insert multiple document instances into the database.
	 * @author BigfootDS
	 *
	 * @async
	 * @returns
	 */
	insertMany = async () => {
		
	}

	
	/**
	 * Create a document instance, insert it into the database, and return the document instance.
	 * @author BigfootDS
	 *
	 * @async
	 * @returns
	 */
	createOne = async () => {
		
	}

	/**
	 * Create multiple document instaces, insert them into the database, and return the array of document instances.
	 * @author BigfootDS
	 *
	 * @async
	 * @returns
	 */
	createMany = async () => {
		
	}

	//#endregion


	//#region Collection-specific Data READ Utilities
	
	findOneDocument = async () => {
		
	}

	findOneObject = async () => {
		
	}

	findManyDocuments = async () => {
		
	}

	findManyObjects = async () => {
		
	}

	/**
     * Query a collection and receive a number representing the count of documents matching that query.
     * @author BigfootDS
     *
     * @async
     * @param {string} collectionName The name of the collection that you wish search through.
     * @param {object} query The NeDB query used to find the specific document within the collection.
     * @returns {Promise<number>} Integer number of documents within the specified collection that match the query.
     */
	count = async (collectionName: string, query: object): Promise<number> => {
		let accessor = this.getCollectionAccessor(collectionName);
		let result: number = await accessor.datastore.countAsync(query);
        return result;
	}

	//#endregion

	//#region Collection-specific Data UPDATE Utilities
	findAndUpdateOneDocument = async () => {
		
	}

	findAndUpdateOneObject = async () => {
		
	}

	findAndUpdateManyDocuments = async () => {
		
	}

	findAndUpdateManyObjects = async () => {
		
	}
	//#endregion

	//#region Collection-specific Data DELETE Utilities

	/**
     * Find and delete one document from a specified collection.
     * @author BigfootDS
     * @async
     * @param {string} collectionName The name of the collection that you wish to search through and modify.
     * @param {object} query The NeDB query used to find the specific document within the collection.
     * @param {Datastore.RemoveOptions} options Options to pass to the query system in NeDB. For this particular method, `multi` is always set to `false`.
     * @returns {Promise<number>} Number of removed documents.
     */
    findAndDeleteOne = async (collectionName: string, query: object, options: Datastore.RemoveOptions = {multi: false}): Promise<number> => {
        options.multi = false;
        let accessor = this.getCollectionAccessor(collectionName);
        return await accessor.datastore.removeAsync(query, options);
    }

	/**
     * Find and delete multiple documents from a specified collection.
     * @author BigfootDS
     * @async
     * @param {string} collectionName The name of the collection that you wish to search through and modify.
     * @param {object} query The NeDB query used to find the specific documents within the collection.
     * @param {Datastore.RemoveOptions} options Options to pass to the query system in NeDB. For this particular method, `multi` is always set to `true`.
     * @returns {Promise<number>} Number of removed documents.
     */
    findAndDeleteMany = async (collectionName: string, query: object, options: Datastore.RemoveOptions = {multi: true}): Promise<number> => {
        options.multi = true;
        let accessor = this.getCollectionAccessor(collectionName);
        return await accessor.datastore.removeAsync(query, options);
    }

	//#endregion
}
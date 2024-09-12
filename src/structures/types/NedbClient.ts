import path from "node:path";
import { CollectionAccessor } from "../interfaces/CollectionAccessorInterface";
import { NedbClientEntry } from "../interfaces/NedbClientEntryInterface";
import { NedbDocument } from "./NedbDocument";
import { NedbEmbeddedDocument } from "./NedbEmbeddedDocument";
import {default as Datastore} from "@seald-io/nedb";
import { parseCollectionsListForEmbeddeddocuments } from "../../utils/nedbClientHelper";
import { CollectionListEntry } from "./CollectionListEntry";
import { findManyDocumentsOptions, findManyObjectsOptions, findOneObjectOptions } from "../interfaces/QueryOptions";
import { CollectionAccessError } from "../errors/NedbClientErrors";


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
			throw new CollectionAccessError(collectionName);
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

	
	/**
	 * Delete collections by name. Can delete multiple collections that use the same name.
	 * 
	 * You can also specify whether or not the data within the collection should be deleted, just as a sanity-check. This is enabled by default.
	 * 
	 * @author BigfootDS
	 *
	 * @async
	 * @param {string} name The name of the collections to search for.
	 * @param {boolean} [deleteData=true] Whether or not data within the collection should be deleted. Defaults to true.
	 * @returns {Promise<number>} The number of collections with a matching name that were deleted.
	 */
	deleteCollectionByName = async (name: string, deleteData: boolean = true): Promise<number> => {
		let numDeleted: number = 0;

		if (deleteData){
			for await (const collection of this.collections){
				if (collection.name == name){
					await collection.datastore.dropDatabaseAsync();
				}
			}
		}

		let tempFiltered = this.collections.filter(collectionObj => collectionObj.name !== name);

		numDeleted = this.collections.length - tempFiltered.length;

		this.collections = tempFiltered;

		return numDeleted;
	}

	/**
	 * Delete collections by model. Can delete multiple collections that use the same model.
	 * 
	 * You can also specify whether or not the data within the collection should be deleted, just as a sanity-check. This is enabled by default.
	 * 
	 * @author BigfootDS
	 *
	 * @async
	 * @param {typeof NedbDocument} model The model to search for.
	 * @param {boolean} [deleteData=true] Whether or not data within the collection should be deleted. Defaults to true.
	 * @returns {Promise<number>} The number of collections with a matching name that were deleted.
	 */
	deleteCollectionByModel = async (model: typeof NedbDocument, deleteData: boolean = true): Promise<number> => {
		let numDeleted: number = 0;

		if (deleteData){
			for await (const collection of this.collections){
				if (collection.model == model){
					await collection.datastore.dropDatabaseAsync();
				}
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
		for await (const collectionAccessor of this.collections){
			await this.deleteCollectionByName(collectionAccessor.name);
		}
	}

	//#endregion


	//#region Collection-specific Data CREATE Utilities

	
	
	
	/**
	 * Insert an object of data into the database, following a document schema, and return the saved object of data.
	 * @author BigfootDS
	 *
	 * @async
	 * @param {string} collectionName The name of the collection to insert the data into.
	 * @param {object} dataObject The data to be inserted.
	 * @returns {Promise<object>} The data saved in the database, as an object.
	 */
	insertOne = async (collectionName: string, dataObject: object): Promise<object> => {
		if (Array.isArray(dataObject)){
			throw new Error("Don't use insertOne to create multiple documents. Use insertMany instead, please!");
		}

		return await (await this.createOne(collectionName, dataObject)).toPopulatedObject();
	}

	/**
	 * Insert an array of objects of data into the database, following a document schema, and return the saved array of objects of data.
	 * @author BigfootDS
	 *
	 * @async
	 * @param {string} collectionName The name of the collection to insert the data into.
	 * @param {object[]} dataObjectArray The data to be inserted.
	 * @returns {Promise<object[]>} The data saved in the database, as an object.
	 */
	insertMany = async (collectionName: string, dataObjectArray: object[]): Promise<object[]> => {
		let result: object[] = [];
		for await (const dataObject of dataObjectArray) {
			let newInsertion = await this.insertOne(collectionName, dataObject);
			result.push(newInsertion);
		}

		return result;
	}

	

	/**
	 * Create a document instance from a provided object of data, insert the new document instance into the database, and return the new document instance.
	 * @author BigfootDS
	 *
	 * @async
	 * @param {string} collectionName
	 * @param {object} dataObject
	 * @returns {Promise<NedbDocument>}
	 */
	createOne = async (collectionName: string, dataObject: object): Promise<NedbDocument> => {
		let newInstance: NedbDocument|null = null;
		let accessor: CollectionAccessor = this.getCollectionAccessor(collectionName);
		try {
			newInstance = await accessor.model.create(dataObject, this.name, collectionName);

			let insertedResult = await accessor.datastore.insertAsync(await newInstance.toPopulatedObject());

			let confirmedDatabaseResult = await this.findOneDocument(collectionName, {_id: insertedResult._id});

			if (confirmedDatabaseResult){
				return confirmedDatabaseResult;
			} else {
				throw new Error("Something went wrong when creating data.");
			}
		} catch (error) {
			throw error;
		}
		
	}

	/**
	 * Create multiple document instances from a provided array of object data, insert each document instance into the database, and return the array of document instances.
	 * @author BigfootDS
	 * @async
	 * @param {string} collectionName
	 * @param {object[]} dataObjectArray
	 * @returns {Promise<NedbDocument[]>}
	 */
	createMany = async (collectionName: string,dataObjectArray: object[]): Promise<NedbDocument[]> => {
		let result: NedbDocument[] = [];
		for await (const dataObject of dataObjectArray) {
			let newInsertion = await this.createOne(collectionName, dataObject);
			result.push(newInsertion);
		}

		return result;
	}

	//#endregion


	//#region Collection-specific Data READ Utilities
	
	/**
     * Query a collection and receive the first document matching that query.
     * 
     * This method is NOT compatible with NeDB projections, and thus returns an instance of the document used by the specified collection.
     * 
     * @author BigfootDS
     *
     * @async
     * @param {string} collectionName The name of the collection that you wish to search through.
     * @param {object} query The NeDB query used to find the specific document within the collection. Read more about NeDB queries here: https://github.com/seald/nedb?tab=readme-ov-file#finding-documents
     * @returns {Promise<NedbDocument | null>} An instance of the collection's model.
     */
    findOneDocument = async (collectionName: string, query: object): Promise<NedbDocument | null> => {
        let accessor = this.getCollectionAccessor(collectionName);
        let result = await accessor.datastore.findOneAsync(query);
        if (result) {
            return await accessor.model.create(result, this.name, collectionName);
        } else {
            return null;
        }
	}

	findOneObject = async (collectionName: string, query: object, options?: findOneObjectOptions): Promise<object | null> => {
		let accessor = this.getCollectionAccessor(collectionName);
        let result = await accessor.datastore.findOneAsync(query, options?.projection);
        if (result) {
            return result;
        } else {
            return null;
        }
	}

	findManyDocuments = async (collectionName: string, query: object, options?: findManyDocumentsOptions): Promise<NedbDocument[]> => {
		let accessor = this.getCollectionAccessor(collectionName);
        let result = await accessor.datastore.findAsync(query);
        if (result) {
			let tempDocuments: NedbDocument[] = await Promise.all(result.map(async (resultItem: object) => {
				return await accessor.model.create(resultItem, this.name, collectionName);
			}));

			if (options?.limit && options.limit < tempDocuments.length){
				tempDocuments.length = options.limit;
			}

			return tempDocuments;
            
        } else {
            return [];
        }
	}

	findManyObjects = async (collectionName: string, query: object, options?: findManyObjectsOptions): Promise<object[]> => {
		let accessor = this.getCollectionAccessor(collectionName);
        let result = await accessor.datastore.findAsync(query, options?.projection);
        if (result) {
			if (options?.limit && options.limit < result.length){
				result.length = options.limit;
			}
            return result;
        } else {
            return [];
        }
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
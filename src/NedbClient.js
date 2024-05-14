import Datastore from "@seald-io/nedb";
import path from "node:path";
import fs from "node:fs";
import { doesExtendBaseDocument } from "../src/validators/index.js";
import Document from "./Document.js";

const processModelArgToString = (modelName) => {
    let isModelNameAClassRef = doesExtendBaseDocument(modelName);
    let modelNameString = isModelNameAClassRef ? modelName.name : modelName.toString();

    return modelNameString;
}

const urlToPath = function(url) {
    if (url.indexOf('nedb://') > -1) {
        return url.slice(7, url.length);
    }
    return url;
};

const getCollectionPath = function(dbLocation, collection) {
    if (dbLocation === 'memory') {
        return dbLocation;
    }
    return path.join(dbLocation, collection) + '.db';
};

const createCollection = (collectionName, url) => {
	if (url === 'memory'){
		return new Datastore({inMemoryOnly: true});
	}
	let collectionPath = getCollectionPath(url, collectionName);
    return new Datastore({filename: collectionPath, autoload: true});
}

const getCollection = function(name, collections, path) {
    if (!(name in collections)) {
        let collection = createCollection(name, path);
        collections[name] = collection;
        return collection;
    }
    
    return collections[name];
};


/**
 * @typedef {Object} CollectionAccessor 
 * @property {String} name Name of the collection.
 * @property {Document} model Reference to the Document-inheriting class used to define the collection's data structure.
 * @property {String} path Path to its ".db" NeDB file.
 * @property {Datastore} datastore Reference to the NeDB Datastore object for this collection.
 * 
 */


export default class NedbClient {
	/**
     * Creates an instance of NedbClient.
     * @author BigfootDS
     *
     * @constructor
     * @param {String} dbDirectoryPath A string representing a resolved path to a directory. This directory will store many ".db" files in it. 
     * @param {[{name: string, model: Document}]} collectionsList An array of objects containing a desired name for a collection as well as the Document-inheriting model that should be used for that collection. You must provide ALL intended models & collections for the database client in this property - don't leave anything out!
     * 
     * @example
     * let settingsDb = new NedbClient(
     *      somePathToFolder,
     *      [
     *          {name:"Users", model: User}, 
     *          {name:"Admins", model: User}, 
     *          {name: "Config", model: Config}
     *      ]
     * );
     * 
     */
    constructor(dbDirectoryPath, collectionsList = []){

		this.rootPath = dbDirectoryPath;

        this.collections = collectionsList.map((kvp) => {
            let newCollectionPath = getCollectionPath(this.rootPath, kvp.name)
            
            // Return an object to stick into collections, containing info about the specific collection based on the given model.
            return {
                model: kvp.model,
                name: kvp.name,
                path: newCollectionPath,
                datastore: new Datastore({filename: newCollectionPath, autoload: true})
            }
        })

        

        
	}
	

	// #region Client instance properties


    
    /**
     * Determine whether or not a specific collection name exists in the used database client instance.
     * 
     * @author BigfootDS
     *
     * @param collectionName
     * @returns {Boolean}
     */
    collectionExistsInInstance = (collectionName) => {
        return this.collections.some((collection) => collection.name === collectionName);
    }

    
    /**
     * Description placeholder
     * @author BigfootDS
     *
     * @param collectionName
     * @returns {CollectionAccessor}
     */
    getCollectionAccessor = (collectionName) => {
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
	 * Remove all database data from the filesystem.
	 * 
	 * @author BigfootDS
	 * @async
	 */
	dropDatabase = async () => {
        return Promise.all(this.collections.map(collectionObj => {
            return this.dropCollection(collectionObj.name);
        }));
    }

    
	/**
     * Empty out a specific collection's data.
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName Target collection name as a string.
     */
    dropCollection = async (collectionName) => {
        let accessor = this.getCollectionAccessor(collectionName);
        return accessor.datastore.removeAsync({}, {multi: true});
    }




    
    /**
     * Gets the raw collections list from the database client instance.
     * 
     * Try not to use this - use the methods on the instance to do things to/with collections instead.
     * 
     * @author BigfootDS
     *
     * @returns {CollectionAccessor[]}
     */
    driver() {
        return this.collections;
    }

	save(collection, query, values) {
        throw new TypeError('You must override save.');
    }

    
    /**
     * Find and delete one document from a specified collection.
     * @author BigfootDS
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through and modify.
     * @param {Object} query The NeDB query used to find the specific document within the collection.
     * @param {Datastore.RemoveOptions} options Options to pass to the query system in NeDB. For this particular method, `multi` is always set to `false`.
     * @returns
     */
    deleteOne = async (collectionName, query, options = {multi: false}) => {
        options.multi = false;
        let accessor = this.getCollectionAccessor(collectionName);
        return accessor.datastore.removeAsync(query, options);
    }

    /**
     * Find and delete multiple documents from a specified collection.
     * @author BigfootDS
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through and modify.
     * @param {Object} query The NeDB query used to find the specific documents within the collection.
     * @param {Datastore.RemoveOptions} options Options to pass to the query system in NeDB. For this particular method, `multi` is always set to `true`.
     * @returns
     */
    deleteMany = async (collectionName, query, options = {multi: true}) => {
        options.multi = true;
        let accessor = this.getCollectionAccessor(collectionName);
        return accessor.datastore.removeAsync(query, options);
    }

    findOne = async (collectionName, query) => {
        let accessor = this.getCollectionAccessor(collectionName);
        return accessor.datastore.findOneAsync(query);        
	}

    findOneAndUpdate = async (modelName, collection, query, values, options) => {
        throw new TypeError('You must override findOneAndUpdate.');
    }

    findOneAndDelete = async (collection, query, options) => {
        throw new TypeError('You must override findOneAndDelete.');
    }

    find = async (collection, query, options) => {
        throw new TypeError('You must override findMany.');
    }

    count = async (collection, query) => {
        throw new TypeError('You must override count.');
    }

    createIndex(collection, field, options) {
        throw new TypeError('You must override createIndex.');
    }

	//#endregion
}
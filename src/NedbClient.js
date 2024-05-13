import Datastore from "@seald-io/nedb";
import path from "node:path";
import fs from "node:fs";

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

export default class NedbClient {
	constructor(url){
		this._url = url;
	}


	// #region Client static properties

	/**
	 * 
	 */
	static documents = {
		// DocumentName: some imported ref of the Document
	}

	static collections = [

	]
	
    static connect(url, options) {
        throw new TypeError('You must override connect (static).');
    }

	//#endregion
	

	// #region Client instance properties

    /**
	 * Disconnect from the database.
	 * 
	 * This keeps all database data on the filesystem, 
	 * but just removes the database from the SuperCamo.databases collection.
	 * @author BigfootDS
	 */
	close() {
        throw new TypeError('You must override close.');
    }

	

	/**
	 * Remove all database data from the filesystem.
	 * 
	 * By default, this also disconnects from the database, 
	 * removing it from the SuperCamo.databases collection.
	 * @author BigfootDS
	 *
	 * @param {boolean} [disconnect=true] Perform a `database.close()` operation after wiping its data. Default is true.
	 */
	dropDatabase(disconnect = true) {
        throw new TypeError('You must override dropDatabase.');
    }

	clearCollection(collection) {
        throw new TypeError('You must override clearCollection.');
    }

	toCanonicalId(id) {
        return id;
    }

	// Native ids are the same as NeDB ids
    isNativeId(value) {
        return String(value).match(/^[a-zA-Z0-9]{16}$/) !== null;
    }

	nativeIdType() {
        return String;
    }

    driver() {
        return this._collections;
    }

	save(collection, query, values) {
        throw new TypeError('You must override save.');
    }

    delete(collection) {
        throw new TypeError('You must override delete.');
    }

    deleteOne(collection, query) {
        throw new TypeError('You must override deleteOne.');
    }

    deleteMany(collection, query) {
        throw new TypeError('You must override deleteMany.');
    }

    findOne(collection, query) {
        throw new TypeError('You must override findOne.');
    }

    findOneAndUpdate(collection, query, values, options) {
        throw new TypeError('You must override findOneAndUpdate.');
    }

    findOneAndDelete(collection, query, options) {
        throw new TypeError('You must override findOneAndDelete.');
    }

    find(collection, query, options) {
        throw new TypeError('You must override findMany.');
    }

    count(collection, query) {
        throw new TypeError('You must override count.');
    }

    createIndex(collection, field, options) {
        throw new TypeError('You must override createIndex.');
    }

	//#endregion
}
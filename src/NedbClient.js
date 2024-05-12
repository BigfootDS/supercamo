import Datastore from "@seald-io/nedb";
import path from "node:fs";

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

	static documents = {
		// DocumentName: some imported ref of the Document
	}

	
    static connect(url, options) {
        throw new TypeError('You must override connect (static).');
    }

	
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
}
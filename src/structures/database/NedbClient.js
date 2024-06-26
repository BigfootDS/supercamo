const Datastore = require("@seald-io/nedb");
const path = require("node:path");
const { isObject } = require("../../validators/index.js");
// const { doesExtendDocument } = require("../../validators/functions/doesExtendClass.js");
const SuperCamoLogger = require("../../utils/logging.js");
const { isESClass } = require("../../validators/functions/typeValidators.js");
const { getClassInheritanceList } = require("../../validators/functions/ancestors.js");
const { parseCollectionsListForSubdocuments } = require("../../utils/nedbClientHelper.js");

require("../../utils/miscTypes.js");





class NedbClient {

    
    /**
     * Path to a folder that contains all of this database client's datastore files.
     * @type {String}
     * @author BigfootDS
     */
    #rootPath = "";

    
    /**
     * @type {CollectionAccessor[]}
     * @author BigfootDS
     */
    #collections = [];

    #documentsList = [];

    #subdocumentsList = [];

	/**
     * Creates an instance of NedbClient.
     * @author BigfootDS
     *
     * @constructor
     * @param {String} dbDirectoryPath A string representing a resolved path to a directory. This directory will store the database client's specific directory - so dbDirectoryPath is not the folder that contains any ".db" files in it.
     * @param {String} dbName A string used to identify a database. No checks for uniqueness will happen, that's up to you to manage. The directory that is a resolved path from dbDirectoryPath and dbName will contain many ".db" files in it. 
     * @param {CollectionsList[]} collectionsList An array of objects containing a desired name for a collection as well as the NedbDocument-inheriting model that should be used for that collection. You must provide ALL intended models & collections for the database client in this property - don't leave anything out!
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
    constructor(dbDirectoryPath, dbName, collectionsList = []){


		this.#rootPath = dbDirectoryPath;

        this.#collections = collectionsList.map((kvp) => {
            return this.createCollection(kvp.model, kvp.name);
        });

        this.databaseName = dbName;

        this.#documentsList = [...new Set(collectionsList.map((kvp) => {
            return kvp.model
        }))];

        this.#subdocumentsList = parseCollectionsListForSubdocuments(collectionsList);

	}

    get rootPath(){
        return this.#rootPath;
    }

    get collections(){
        return this.#collections;
    }

    set collections(newValue){
        SuperCamoLogger(newValue, "Client");
        this.#collections = newValue;
        
    }

    



	// #region Client instance utilities

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
     * Retrieve a distinct list of models used in the collections of this NedbClient.
     * @author BigfootDS
     * @return {Object[]} Array of classes that inherit from NedbDocument.
     */
    getModelsList = () => {
        SuperCamoLogger("NedbClient model list should be a combined list of these two arrays:", "Client");
        SuperCamoLogger("Documents list:", "Client");
        SuperCamoLogger(this.#documentsList, "Client");
        SuperCamoLogger("Subdocuments list:", "Client");
        SuperCamoLogger(this.#subdocumentsList, "Client");
        let combinedList = [...this.#documentsList, ...this.#subdocumentsList];
        return [...new Set(combinedList)];
    }

    
    /**
     * Retrieve the collection meta object stored on the NeDB client instance matching a given collection name.
     * 
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
     * Gets the raw collections list from the database client instance.
     * 
     * Try not to use this - use the methods on the instance to do things to/with collections instead.
     * 
     * @author BigfootDS
     *
     * @returns {CollectionAccessor[]}
     */
    driver = () => {
        return this.collections;
    }

    // #endregion

    // #region Client database-wide utilities

    
    /**
     * Retrieves all documents from all collections, turns them all into objects, and puts them all into an array.
     * @author BigfootDS
     *
     * @async
     * @returns {Object[]} An array of objects representing all documents in all collections of this database client.
     */
    dumpDatabase = async () => {
        return Promise.all(this.collections.map(collectionObj => {
            return this.findManyObjects(collectionObj.name, {});
        }));
    }

        /**
     * Retrieves all documents from all collections, turns them all into objects, and puts them all into an array.
     * @author BigfootDS
     *
     * @async
     * @returns {Object[]} An array of objects representing all documents in all collections of this database client.
     */
    dumpDatabaseDocuments = async () => {
        return Promise.all(this.collections.map(collectionObj => {
            return this.findManyDocuments(collectionObj.name, {});
        }));
    }

	/**
	 * Remove all documents from all collections.
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
	 * Remove all database data from the filesystem. This means that all documents within this NeDB client instance's collections are removed, all collection objects on the NeDB client instance are removed, and all `.db` files relevant to this NeDB client instance are removed from the file system.
	 * 
	 * @author BigfootDS
	 * @async
	 */
    removeDatabase = async () => {
        return Promise.all(this.collections.map((collectionObj) => {
            return this.removeCollection(collectionObj.name);
        }))
    }

    // #endregion
    


    // #region Client collection-specific Collection CREATE operations

    /**
     * Create an index on a specified collection's field(s), as per the NeDB documentation:
     * 
     * https://github.com/seald/nedb?tab=readme-ov-file#indexing
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection to create an index for.
     * @param {Datastore.EnsureIndexOptions} indexOptions Configuration object for the index you wish to create.
     * @returns {Promise<void>}
     */
    createIndex = async (collectionName, indexOptions) => {
        let accessor = this.getCollectionAccessor(collectionName);
        return await accessor.datastore.ensureIndexAsync(indexOptions);
    }

    createCollection = (model, name) => {
        let newCollectionPath = path.join(this.rootPath, name, ".db");
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

    // #endregion

    // #region Client collection-specific Collection READ operations
    // What would we reasonably want to do to a whole collection that we can't already do with findMany()?
    // #endregion

    // #region Client collection-specific Collection UPDATE operations
    // What would we reasonably want to do to a whole collection that we can't already do with findAndUpdateMany()?
    // #endregion

    // #region Client collection-specific Collection DELETE operations

    dropCollection = async(collectionName) => {
        return this.findAndDeleteMany(collectionName, {});
    }

    removeCollection = async(collectionName) => {
        let accessor = this.getCollectionAccessor(collectionName);
        await this.findAndDeleteMany(accessor.name, {});
        await accessor.datastore.dropDatabaseAsync();
        this.collections = this.collections.filter((collectionObj) => collectionObj.name !== collectionName);
        return {removed: {model: accessor.model, name: accessor.name, path: accessor.path}};
    }

    /**
     * Remove an index on a specified collection's field(s), as per the NeDB documentation:
     * 
     * https://github.com/seald/nedb?tab=readme-ov-file#indexing
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection to remove an index from.
     * @param {String[]} fieldNames Array of strings, where each string is a field in the specific collection.
     * @returns {Promise<void>}
     */
    removeIndex = async (collectionName, fieldNames) => {
        let accessor = this.getCollectionAccessor(collectionName);
        return await accessor.datastore.removeIndexAsync(fieldNames);
    }

    // #endregion
    



    // #region Client collection-specific Document CREATE operations

    /**
     * Create a singular new document within a specified collection, as per the NeDB documentation.
     * 
     * https://github.com/seald/nedb?tab=readme-ov-file#inserting-documents
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish to insert a document into.
     * @param {Object} dataObject The object of data you wish to save as a document in the specified collection.
     * @returns {Object}
     */
    insertOne = async (collectionName, dataObject) => {
        let localDataObj = dataObject;

        if (Array.isArray(localDataObj)){
            throw new Error("Don't use insertOne to create multiple documents. Use insertMany instead, please!");
        }

        let accessor = this.getCollectionAccessor(collectionName);

        // If the provided data is a bunch of document instances, convert them to objects and save them.
        // Otherwise, assuming we were given raw objects instead, we need to convert them into 
        // document instances to trigger some validation steps and then convert that back into an object.
        // This lets things like default property values in a document get applied.
        // if (localDataObj !== null && typeof localDataObj !== 'object' ){
        //     localDataObj = localDataObj.convertInstanceToObject();
        // } else if (isObject(localDataObj)){
        //     let tempInstance = await accessor.model.create(localDataObj, this.databaseName, collectionName);

        //     localDataObj = tempInstance.convertInstanceToObject();
        // } else {
        //     throw new Error("Data provided is not an object or based on a Document: " + JSON.stringify(localDataObj));
        // }

        let tempInstance = null;
        try {
            tempInstance = await accessor.model.create(localDataObj, this.databaseName, collectionName);
        } catch (error) {
            throw error;
        }

        let result = null;
        try {
            let result = await accessor.datastore.insertAsync(await tempInstance.getData(false));
            SuperCamoLogger("insertOne insert result:", "Client");
            SuperCamoLogger(result, "Client");
            let tempInstanceData = await tempInstance.getData(false);
            SuperCamoLogger("insertOne tempInstance result:", "Client");
            SuperCamoLogger(tempInstance, "Client");
            return await this.findOneDocument(collectionName, {_id: result._id});
        } catch (error) {
            throw error;
        }

        // return accessor.model.create(result, this.databaseName, collectionName, false);
    }

    /**
     * Create multiple new documents within a specified collection, as per the NeDB documentation.
     * 
     * https://github.com/seald/nedb?tab=readme-ov-file#inserting-documents
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish to insert documents into.
     * @param {Object[]} dataObject The object of data you wish to save as documents in the specified collection.
     * @returns {Object[]} Array of successfully-created data, reflecting what is now in the database from this operation.
     */
    insertMany = async (collectionName, dataObjects) => {
        if (!Array.isArray(dataObjects)){
            throw new Error("Don't use insertMany to create singular documents. Use insertOne instead, please!");
        }

        let accessor = this.getCollectionAccessor(collectionName);

        // If the provided data is a bunch of document instances, convert them to objects and save them.
        // Otherwise, assuming we were given raw objects instead, we need to convert them into 
        // document instances to trigger some validation steps and then convert that back into an object.
        // This lets things like default property values in a document get applied.
        let localDataObjs = await Promise.all(dataObjects.map(async (dataObject) => {
            if (dataObject !== null && typeof dataObject !== 'object' ){
                return dataObject.convertInstanceToObject();
            } else if (isObject(dataObject)){
                let tempInstance = await accessor.model.create(dataObject, this.databaseName, collectionName);
                return tempInstance.convertInstanceToObject();
            } else {
                throw new Error("Data provided is not an object or based on a Document: " + JSON.stringify(dataObject));
            }
        }))

        let tempInstances = await Promise.all(dataObjects.map(async (dataObject) => {
            try {
                SuperCamoLogger("Making temp instance for validation purposes...", "Client");

                let tempInstance = await accessor.model.create(dataObject, this.databaseName, collectionName);
                return await tempInstance.getData(false);
            } catch (error) {
                throw error;
            }
        })).catch(error => {
            throw new Error("Something went wrong with document validation. Seeing this message means it was probably a uniqueness constraint not being adhered to. Original error: \n" + JSON.stringify(error));

        });
        
        let results = null;
        try {
            results = await accessor.datastore.insertAsync(tempInstances);
            let resultsAsInstances = Promise.all(results.map(async (result) => {
                return await this.findOneDocument(collectionName, {_id: result._id});
            }))
            return resultsAsInstances;
        } catch (error) {
            throw new Error("Something went wrong with document validation. Seeing this message means it was probably a uniqueness constraint not being adhered to.");
        }
        
    }


    // #endregion
    
    // #region Client collection-specific Document READ operations

    /**
     * Query a collection and receive the first document matching that query.
     * 
     * This method is NOT compatible with NeDB projections, and thus returns an instance of the document used by the specified collection.
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through.
     * @param {Object} query The NeDB query used to find the specific document within the collection. Read more about NeDB queries here: https://github.com/seald/nedb?tab=readme-ov-file#finding-documents
     * @returns An instance of the collection's model.
     */
    findOneDocument = async (collectionName, query) => {
        let accessor = this.getCollectionAccessor(collectionName);
        let result = await accessor.datastore.findOneAsync(query);
        if (result) {
            return await accessor.model.create(result, this.databaseName, collectionName);
        } else {
            return null;
        }
	}

    /**
     * Query a collection and receive the first document (as an object) matching that query.
     * 
     * This method is compatible with NeDB projections, and thus returns a plain object.
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through.
     * @param {Object} query The NeDB query used to find the specific document within the collection. Read more about NeDB queries here: https://github.com/seald/nedb?tab=readme-ov-file#finding-documents
     * @param {boolean} populate Whether or not the returned object should include nested data for any referenced documents, as objects.
     * @param {Object} projections The NeDB projections used to filter the data returned by the matched query documents. Read more about NeDB projections here: https://github.com/seald/nedb?tab=readme-ov-file#projections
     * @returns {Object}
     */
    findOneObject = async (collectionName, query, populate = false, projections = null) => {
        let accessor = this.getCollectionAccessor(collectionName);
        let result = null;

        if (projections){
            result = await accessor.datastore.findOneAsync(query, projections);        
        } else {
            result = await accessor.datastore.findOneAsync(query);
        }

        if (populate){
            // loop through all keys on accessor.model
            let tempModelInstance = new accessor.model();
            let docKeys = Object.keys(tempModelInstance);
            SuperCamoLogger("Searching for object, populating based on these keys:", "Client");
            SuperCamoLogger(accessor.model, "Client");
            SuperCamoLogger(docKeys, "Client");
       
            for await (const key of docKeys){
                let propertyIsArray = Array.isArray(tempModelInstance[key].type);
                let potentialClassRef = propertyIsArray ? tempModelInstance[key].type[0] : tempModelInstance[key].type;
                let classInheritanceList = [];
                try {
                    classInheritanceList = getClassInheritanceList(potentialClassRef);
                } catch {
                    classInheritanceList = [];
                }
                SuperCamoLogger("Potential class ref value:", "Client");
                SuperCamoLogger(potentialClassRef, "Client");
                SuperCamoLogger("Class inheritance list of potential class ref value:", "Client");
                SuperCamoLogger(classInheritanceList, "Client");

                if (isESClass(potentialClassRef) && classInheritanceList.includes("NedbDocument")){
                    SuperCamoLogger(`Key ${key} is of type ${potentialClassRef.name} which inherits from NedbDocument.`);
                    SuperCamoLogger(`Key ${key} is in the ${tempModelInstance[key].collection} collection of the database client.`);

                    if (propertyIsArray){
                        result[key] = await Promise.all(result[key].map((item) => {
                            SuperCamoLogger(`Searching for data with id of ${item}`);
                            return this.findOneObject(tempModelInstance[key].collection, {_id: item});
                        }));
                    } else {
                        result[key] = await this.findOneObject(tempModelInstance[key].collection, {_id: result[key]});
                    }
                }
            }
        }


        return result;   
	}


    /**
     * Query a collection and receive one or more documents matching that query.
     * 
     * This method is NOT compatible with NeDB projections, and thus returns an array of instances of the document used by the specified collection.
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through.
     * @param {Object} query The NeDB query used to find the specific documents within the collection. Read more about NeDB queries here: https://github.com/seald/nedb?tab=readme-ov-file#finding-documents
     * @returns An array of instances of the collection's model.
     */
    findManyDocuments = async (collectionName, query) => {
        let accessor = this.getCollectionAccessor(collectionName);
        let results = await accessor.datastore.findAsync(query);   
        let resultsAsInstances = Promise.all(results.map(async (result) => {
            return await accessor.model.create(result, this.databaseName, collectionName);
        }))
        return resultsAsInstances;
    } 

    /**
     * Query a collection and receive one or more objects matching that query.
     * 
     * This method is compatible with NeDB projections, and thus returns an array of plain object.
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through.
     * @param {Object} query The NeDB query used to find the specific documents within the collection. Read more about NeDB queries here: https://github.com/seald/nedb?tab=readme-ov-file#finding-documents
     * @param {Object} projections The NeDB projections used to filter the data returned by the matched query documents. Read more about NeDB projections here: https://github.com/seald/nedb?tab=readme-ov-file#projections
     * @returns An array of found objects.
     */
    findManyObjects = async (collectionName, query, populate = false, projections = null) => {
        let accessor = this.getCollectionAccessor(collectionName);
        let results = null;

        if (projections){
            results = await accessor.datastore.findAsync(query, projections);       
        } else {
            results = await accessor.datastore.findAsync(query);
        }

        if (populate){
            for await (let result of results) {
                // loop through all keys on accessor.model
            let tempModelInstance = new accessor.model();
            let docKeys = Object.keys(tempModelInstance);
            SuperCamoLogger("Searching for object, populating based on these keys:", "Client");
            SuperCamoLogger(accessor.model, "Client");
            SuperCamoLogger(docKeys, "Client");

            for await (const key of docKeys){
                let propertyIsArray = Array.isArray(tempModelInstance[key].type);
                let potentialClassRef = propertyIsArray ? tempModelInstance[key].type[0] : tempModelInstance[key].type;
                let classInheritanceList = [];
                try {
                    classInheritanceList = getClassInheritanceList(potentialClassRef);
                } catch {
                    classInheritanceList = [];
                }
                SuperCamoLogger("Potential class ref value:", "Client");
                SuperCamoLogger(potentialClassRef, "Client");
                SuperCamoLogger("Class inheritance list of potential class ref value:", "Client");
                SuperCamoLogger(classInheritanceList, "Client");

                if (isESClass(potentialClassRef) && classInheritanceList.includes("NedbDocument")){
                    SuperCamoLogger(`Key ${key} is of type ${potentialClassRef.name} which inherits from NedbDocument.`);
                    SuperCamoLogger(`Key ${key} is in the ${tempModelInstance[key].collection} collection of the database client.`);

                    if (propertyIsArray){
                        result[key] = await Promise.all(result[key].map((item) => {
                            SuperCamoLogger(`Searching for data with id of ${item}`);
                            return this.findOneObject(tempModelInstance[key].collection, {_id: item});
                        }));
                    } else {
                        result[key] = await this.findOneObject(tempModelInstance[key].collection, {_id: result[key]});
                    }
                }
            }
            }
        }


        return results;   
    } 
    
    /**
     * Query a collection and receive a number representing the count of documents matching that query.
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish search through.
     * @param {Object} query The NeDB query used to find the specific document within the collection.
     * @returns {Number} Integer number of documents within the specified collection that match the query.
     */
    count = async (collectionName, query) => {
        let accessor = this.getCollectionAccessor(collectionName);
        return await accessor.datastore.countAsync(query);   
    }

    // #endregion

    // #region Client collection-specific Document UPDATE operations

    
    /**
     * Find and update one matching document within a specified collection, as per the NeDB documentation.
     * 
     * https://github.com/seald/nedb?tab=readme-ov-file#updating-documents
     * 
     * Note that if multiple documents would match the given query, only the first matched document will be updated.
     * 
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through and modify.
     * @param {Object} query The NeDB query used to find the specific document within the collection.
     * @param {Object} update The updated data to apply to the found document.
     * @param {Boolean} returnDocument If true, this function returns the updated document as a document instance. If false, the returned value is just a plain object of data.
     * @returns {{numAffected: Number, upsert: Boolean, affectedDocuments: BaseDocument}}
     */
    findAndUpdateOne = async (collectionName, query, update, upsert = false, returnDocument = true) => {
        let options = {
            multi: false,
            upsert: upsert,
            returnUpdatedDocs: true
        }
        let accessor = this.getCollectionAccessor(collectionName);
        
        if (returnDocument){
            let result = await accessor.datastore.updateAsync(query, update, options);
            return await accessor.model.create(result.affectedDocuments[0], this.databaseName, collectionName);
        } else {         
            return await accessor.datastore.updateAsync(query, update, options);

        }
    }


    /**
     * Find and update or or more matching documents within a specified collection, as per the NeDB documentation.
     * 
     * https://github.com/seald/nedb?tab=readme-ov-file#updating-documents
     *  
     * @author BigfootDS
     *
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through and modify.
     * @param {Object} query The NeDB query used to find the specific document within the collection.
     * @param {Object} update The updated data to apply to the found document.
     * @param {Boolean} returnDocuments If true, this function returns the updated documents as document instances. Otherwise, the data is returned as an array of plain objects.
     * @returns {{numAffected: Number, upsert: Boolean, affectedDocuments: BaseDocument[]}}
     */
    findAndUpdateMany = async (collectionName, query, update, upsert = false, returnDocuments = true) => {
        let options = {
            multi: true,
            upsert: upsert,
            returnUpdatedDocs: true
        }
        let accessor = this.getCollectionAccessor(collectionName);

        if (returnDocuments){
            let result = await accessor.datastore.updateAsync(query, update, options);

            let documentList = Promise.all(result.affectedDocuments.map((doc) => {
                return accessor.model.create(doc, this.databaseName, collectionName)
            }));

            return documentList;
        } else {
            
            let result = await accessor.datastore.updateAsync(query, update, options);

            return result.affectedDocuments;
        }
    }

    // #endregion

    // #region Client collection-specific Document DELETE operations

    /**
     * Find and delete one document from a specified collection.
     * @author BigfootDS
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through and modify.
     * @param {Object} query The NeDB query used to find the specific document within the collection.
     * @param {Datastore.RemoveOptions} options Options to pass to the query system in NeDB. For this particular method, `multi` is always set to `false`.
     * @returns {Number} Number of removed documents.
     */
    findAndDeleteOne = async (collectionName, query, options = {multi: false}) => {
        options.multi = false;
        let accessor = this.getCollectionAccessor(collectionName);
        return await accessor.datastore.removeAsync(query, options);
    }

    /**
     * Find and delete multiple documents from a specified collection.
     * @author BigfootDS
     * @async
     * @param {String} collectionName The name of the collection that you wish to search through and modify.
     * @param {Object} query The NeDB query used to find the specific documents within the collection.
     * @param {Datastore.RemoveOptions} options Options to pass to the query system in NeDB. For this particular method, `multi` is always set to `true`.
     * @returns {Number} Number of removed documents.
     */
    findAndDeleteMany = async (collectionName, query, options = {multi: true}) => {
        options.multi = true;
        let accessor = this.getCollectionAccessor(collectionName);
        return await accessor.datastore.removeAsync(query, options);
    }

    // #endregion

}


module.exports = NedbClient;
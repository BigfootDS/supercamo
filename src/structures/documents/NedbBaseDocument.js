const SuperCamoLogger = require("../../utils/logging.js");
const { getBaseClass, getClassInheritanceList } = require("../../validators/functions/ancestors.js");
const { isArray, isInChoices, isObject, isType, isFunction, isPromise, isAsyncFunction, isSupportedType } = require("../../validators/functions/typeValidators.js");


module.exports = class NedbBaseDocument {
	#data = {};
	#parentDatabaseName = null;
	#collectionName = null;

	constructor(incomingData, incomingParentDatabaseName = null, incomingCollectionName = null){
		// This _id value comes from NeDB datastores, the dev or user should never be editing this.
		this._id = {
			type: String,
			required: false // If a document is created but not saved, it won't have an _id value.
		}

		this.#data = {...incomingData};

		this.#parentDatabaseName = incomingParentDatabaseName;

		this.#collectionName = incomingCollectionName;
	}

	get parentDatabaseName(){
		return this.#parentDatabaseName;
	}

	get collectionName(){
		return this.#collectionName;
	}

	
	/**
	 * Create a new instance of the model.
	 * @author BigfootDS
	 *
	 * @async
	 * @param dataObj An object of data matching the model's schema.
	 * @param {Boolean} [validateOnCreate=false] If you want the instance data to be validated when this function runs, set this to true. Otherwise, you have to save the instance into the database to trigger the validation step.
	 * @returns {this} An instance of the model.
	 */
	static async create (dataObj, incomingParentDatabaseName, incomingCollectionName, validateOnCreate = true) {
		// For educational notes:
		// The "this" reference below correctly points to an inheriting class
		// ONLY when the function is declared with function syntax
		// (including the weird static async funcName() declaration syntax)
		// If you declared with const/"fat arrow" syntax, then 
		// "this" will refer to the originating class of the method instead.
		// SuperCamoLogger(this, "BaseDocument");
		SuperCamoLogger(`New document being created based on collection ${incomingCollectionName} in database ${incomingParentDatabaseName}.`, "BaseDocument");
		let newInstance = new this(dataObj, incomingParentDatabaseName, incomingCollectionName);
		if (validateOnCreate){
			try {
				let isValid = await newInstance.#validate();
				let newInstanceData = await newInstance.getData();
				SuperCamoLogger("This document is valid:", "BaseDocument");
				SuperCamoLogger(newInstanceData, "BaseDocument");
			} catch (error) {
				throw error;
			}
		}
		return newInstance;
	}

	async preValidate() {

	}

	async #validate(){
		let passedPreValidate = await this.preValidate().catch(error => error);
		if (Error.isPrototypeOf(passedPreValidate)){
			throw passedPreValidate;
		}

		// Validation stuff 
		for await (const [key, value] of Object.entries(this)){
			// #region Compile the data that could potentially trigger a validation failure.
		
			let modelExpectsProperty = isObject(this[key]);
			if (!modelExpectsProperty){
				throw new Error("Unexpected property on model instance: " + key);
			}

			SuperCamoLogger(`Validating ${key} with value of\n${isObject(this.#data[key]) ? JSON.stringify(this.#data[key]) : this.#data[key]}.`, "BaseDocument");
			// If no instance data was set, then apply the default value to it.
			// This is different to regular Camo, where setting a property
			// to have required & default keys still needs you to provide a value.
			// This way, we can set a property as required & default and not need
			// to provide a value to each instance constructor.
			if (this[key].default && !this.#data[key]){
				(this[key].default);

				if (isAsyncFunction(this[key].default)) {
					SuperCamoLogger(`${key} is an async function`, "BaseDocument");
					this.#data[key] ??= await this[key].default();
				} else if (isPromise(this[key].default)) {
					SuperCamoLogger(`${key} is a promise`, "BaseDocument");
					this.#data[key] ??= await Promise.race([this[key].default]);
				} else if (isFunction(this[key].default)){
					SuperCamoLogger(`${key} is a synchronous function`, "BaseDocument");
					this.#data[key] ??= this[key].default();
				} else {
					SuperCamoLogger(`${key} is a variable`, "BaseDocument");

					this.#data[key] ??= this[key].default;
				}

				
			}

			let modelPropertyIsRequired = this[key].required == true;
			let modelInstanceHasData = !(this.#data[key] == null);
			if (modelPropertyIsRequired && !modelInstanceHasData){
				throw new Error("Property requires a value but no value provided: " + key);
			}


			// Is the key type based on Document, EmbeddedDocument, or not?
			let typeToCheck = Array.isArray(this[key].type) ? this[key].type[0] : this[key].type;
			SuperCamoLogger(`Type to check is ${typeToCheck.name}`, "BaseDocument");

			const SuperCamo = require("../../index.js");
			let keyClassList = getClassInheritanceList(typeToCheck, SuperCamo.getRegisteredModels());
			if (keyClassList.length == 0 || (keyClassList.length == 1 && keyClassList[0] == "")) {
				keyClassList = [typeof key];
			}
			SuperCamoLogger(`Class inheritance list for key ${key} with type of ${typeToCheck.name} is:`, "BaseDocument");
			SuperCamoLogger(keyClassList, "BaseDocument");
			if (keyClassList.includes("NedbDocument")){
				// If so, validate the ID amongst the collection within the database
				SuperCamoLogger(`Key of ${key} is expecting this to be an ID referring to a document: \n${JSON.stringify(this.#data[key])}`, "BaseDocument")

				let targetCollectionName = this[key].collection;
				
				let targetCollection = await SuperCamo.activeClients[this.#parentDatabaseName].getCollectionAccessor(targetCollectionName);
				if (modelPropertyIsRequired || modelInstanceHasData){
					// If some ID is required or provided, make sure it's for an actual document in the collection that this key needs.


					if (isArray(this[key].type)){
						let foundDocArray = await Promise.all(this.#data[key].map(async (entry) => {

							let referencedDoc = await targetCollection.datastore.findOneAsync({_id: entry});
							if (referencedDoc == null){
								let forgotToCallGetData = null;
								if (JSON.stringify(this.#data[key]).includes("required")){
									forgotToCallGetData = true;
								}
								let errorToThrow = new Error(`Key expects a reference to a document. ${forgotToCallGetData ? 'Make sure you call ".getData()" before calling _id, otherwise you\'re just accessing the schema in the reference document instead of its data!' : ""}`);
								errorToThrow.data = {
									key: key,
									value: this.#data[key],
									rule: this[key]
								}
								throw errorToThrow;
							} 

							return referencedDoc;
						}));
					} else {
						let referencedDoc = await targetCollection.datastore.findOneAsync({_id: this.#data[key]});
						if (referencedDoc == null){
							let forgotToCallGetData = null;
							if (JSON.stringify(this.#data[key]).includes("required")){
								forgotToCallGetData = true;
							}
							let errorToThrow = new Error(`Key expects a reference to a document. ${forgotToCallGetData ? 'Make sure you call ".getData()" before calling _id, otherwise you\'re just accessing the schema in the reference document instead of its data!' : ""}`);
							errorToThrow.data = {
								key: key,
								value: this.#data[key],
								rule: this[key]
							}
							throw errorToThrow;
						} 
					}

					
				}
			} else if (keyClassList.includes("NedbEmbeddedDocument")) { 
				// Make new instance of this.#data[key] and let it validate
				SuperCamoLogger("~~~~~~~~~~~~~", "BaseDocument");
				SuperCamoLogger(this.#data[key], "BaseDocument");
				SuperCamoLogger(this[key].type, "BaseDocument");
				
				if (isArray(this[key].type)){
					let embedDocInstanceArray = await Promise.all(this.#data[key].map(entry => {
						return this[key].type[0].create(entry)
					}));
				} else {
					// Create instance of the embedded doc and validate it
					let embedDocInstance = await this[key].type.create(this.#data[key]);
				}
				
				SuperCamoLogger("~~~~~~~~~~~~~", "BaseDocument");

			} else {
				let modelInstanceDataMatchesExpectedType = isType(this[key].type, this.#data[key]);
				if (modelPropertyIsRequired && !modelInstanceDataMatchesExpectedType) {
					throw new Error(`Property expects a certain data type but did not receive it:\n\tProperty:${key}\n\tType:${key}: ${(typeToCheck.name) ? typeToCheck.name : typeToCheck}\n\tReceived:${isObject(this.#data[key]) ? JSON.stringify(this.#data[key], null, 4) : this.#data[key]} (${typeof this.#data[key]})`);
				}
			}
			

			
			

			let modelHasChoices = isArray(this[key].choices);
			let modelInstanceDataIsInChoices = undefined; 
			if (modelPropertyIsRequired && modelHasChoices){
				modelInstanceDataIsInChoices = isInChoices(this[key].choices, this.#data[key]);

				if (!modelInstanceDataIsInChoices){
					throw new Error(`Property limits values to choices, and given value was not one of those allowed choices:\n\tChoices: ${JSON.stringify(this[key].choices)}\n\tReceived: ${this.#data[key]}`);
				}
			} 

			let modelExpectsUniqueValue = this[key].unique == true;
			if (modelExpectsUniqueValue){
				const SuperCamo = require("../../index.js");
				await SuperCamo.activeClients[this.#parentDatabaseName].getCollectionAccessor(this.#collectionName).datastore.ensureIndexAsync({fieldName: key, unique: true});
				// Using NeDB indexes will not actively do a unique validation here, 
				// but it sets up any unique-failing documents to fail when they are about to get written into the datastore.
			}



			// #endregion

			// #region Sanitise any properties that are invalid but without triggering a validation failure.
			if (
				(this[key].min !== null || this[key].min !== undefined)
				&&
				(this.#data[key] < this[key].min)
			) {
				this.#data[key] = this[key].min;
			}

			if (
				(this[key].max !== null || this[key].max !== undefined)
				&&
				(this.#data[key] > this[key].max)
			) {
				this.#data[key] = this[key].max;
			}

			// #endregion
			
			
		}
		

		let passedPostValidate = await this.postValidate().catch(error => error);
		if (Error.isPrototypeOf(passedPostValidate)){
			throw passedPostValidate;
		}

		SuperCamoLogger("Document's data after validation:", "BaseDocument");
		SuperCamoLogger(this.#data, "BaseDocument");


		return true;
	}
	
	async postValidate(){

	}

	async preSave(){

	}

	async postSave(){

	}

	async preDelete(){

	}

	async postDelete(){

	}

	convertInstanceToObject(){
		let result = {};

		// Disabling this here because I wanna let toString use it and stay synchronous
		// await this.#validate();

		for (const [key, value] of Object.entries(this)){

			result[key] = this.#data[key];
		}

		return result;
	}

	
	/**
	 * Get the plain JavaScript object representation of a SuperCamo document instance.
	 * @author BigfootDS
	 *
	 * @async
	 * @param {Boolean} [populate=true] Optional. Set this to true to return all referenced documents as objects within the parent object.
	 * @returns {Object}
	 */
	async getData(populate = true){
		let result = {};

		for (const [key, value] of Object.entries(this)){
			if (isObject(this[key]) && !(this.#data[key] == null)) {
				// Only add property to output if it
				// was defined in the model AND
				// has a value to export
				
				let keyClassList = getClassInheritanceList(this[key].type);
				if (keyClassList.includes("NedbDocument")) {
					if (populate){
						// Convert doc into JS obj
						
						const SuperCamo = require("../../index.js");
						let foundDocument = await SuperCamo.activeClients[this.#parentDatabaseName].findOneDocument(this[key].collection, {_id: this.#data[key]});
						result[key] = await foundDocument.getData();
					} else {
						result[key] = this.#data[key];
					}
				} else if (keyClassList.includes("NedbEmbeddedDocument")){
					// Convert doc into JS obj
					// Assume all embedded docs are instances, would simplify things greatly.
					SuperCamoLogger("-------------", "BaseDocument");
					SuperCamoLogger("Found embedded document:", "BaseDocument");
					SuperCamoLogger(this[key], "BaseDocument");
					SuperCamoLogger(this.#data[key], "BaseDocument");
					SuperCamoLogger("-------------", "BaseDocument");
					if (this.#data[key]['getData']){
						result[key] = await this.#data[key].getData();
					} else {
						result[key] = this.#data[key];
					}
					
				
				} else {
					result[key] = this.#data[key];
				}
			}
		}

		return result;
	}

	static async convertObjectToInstance(dataObj, incomingParentDatabaseName, incomingCollectionName, validateOnCreate = true){
		return this.create(dataObj, incomingParentDatabaseName, incomingCollectionName, validateOnCreate);
	}

	toJson(){
		return JSON.stringify(this.convertInstanceToObject());
	}

	toString() {
		return this.toJson();
	}


}
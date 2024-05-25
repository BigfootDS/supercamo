const { isArray, isInChoices, isObject, isType, isFunction, isPromise, isAsyncFunction } = require("../../validators/functions/typeValidators.js");


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
		// console.log(this);
		let newInstance = new this(dataObj, incomingParentDatabaseName, incomingCollectionName);
		if (validateOnCreate){
			try {
				let isValid = await newInstance.#validate();
				console.log("This document is valid: " + newInstance.toJson());
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

			// If no instance data was set, then apply the default value to it.
			// This is different to regular Camo, where setting a property
			// to have required & default keys still needs you to provide a value.
			// This way, we can set a property as required & default and not need
			// to provide a value to each instance constructor.
			if (this[key].default && !this.#data[key]){
				// console.log(this[key].default);

				if (isAsyncFunction(this[key].default)) {
					console.log(`${key} is an async function`);
					this.#data[key] ??= await this[key].default();
				} else if (isPromise(this[key].default)) {
					console.log(`${key} is a promise`);
					this.#data[key] ??= await Promise.race([this[key].default]);
				} else if (isFunction(this[key].default)){
					console.log(`${key} is a synchronous function`);
					this.#data[key] ??= this[key].default();
				} else {
					console.log(`${key} is a variable`);
					this.#data[key] ??= this[key].default;
				}

				
			}

			let modelPropertyIsRequired = this[key].required == true;
			let modelInstanceHasData = this.#data[key];
			if (modelPropertyIsRequired && !modelInstanceHasData){
				throw new Error("Property requires a value but no value provided: " + key);
			}


			
			let modelInstanceDataMatchesExpectedType = isType(this[key].type, this.#data[key]);
			if (modelPropertyIsRequired && !modelInstanceDataMatchesExpectedType) {
				throw new Error(`Property expects a certain data type but did not receive it:\n\tProperty:${key}\n\tType:${key}:${this[key].type.name}\n\tReceived:${this.#data[key]} (${typeof this.#data[key]})`);
			}

			let modelHasChoices = isArray(this[key].choices);
			let modelInstanceDataIsInChoices = undefined; 
			if (modelPropertyIsRequired && modelHasChoices){
				modelInstanceDataIsInChoices = isInChoices(this[key].choices, [this.#data[key]]);

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
			if (isObject(this[key]) && this.#data[key]) {
				// Only add property to output if it
				// was defined in the model AND
				// has a value to export
				result[key] = this.#data[key];
			}
		}

		return result;
	}

	static async convertObjectToInstance(dataObj, validateOnCreate = true){
		return this.create(dataObj, validateOnCreate);
	}

	toJson(){
		return JSON.stringify(this.convertInstanceToObject());
	}

	toString() {
		return this.toJson();
	}


}
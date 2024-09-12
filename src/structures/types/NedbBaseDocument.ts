import { SuperCamoLogger } from "../../utils/logging";
import { getClassInheritanceList } from "../../validators/functions/ancestors";
import { isArray, isAsyncFunction, isFunction, isInChoices, isObject, isPromise, isType } from "../../validators/functions/typeValidators";
import { PostDeleteFailure, PostSaveFailure, PostValidationFailure, PreDeleteFailure, PreSaveFailure, PreValidationFailure, ValidationFailure, ValidationFailureMissingValueForProperty, ValidationFailureMissingValueForReferencedDoc, ValidationFailureReferenceWithoutDatabase, ValidationFailureUnexpectedProperty, ValidationFailureValueNotInChoices } from "../errors/NedbBaseDocumentErrors";
import { BaseDocument } from "../interfaces/BaseDocumentInterface";
import { DocumentKeyRule } from "../interfaces/DocumentKeyRuleInterface";


export abstract class NedbBaseDocument implements BaseDocument {
	#data: object;
	#parentDatabaseName: string | null;
	#collectionName: string | null;


	constructor(newData: object, newParentDatabaseName: string|null, newCollectionName:string|null){
		this.#data = newData;
		this.#parentDatabaseName = newParentDatabaseName;
		this.#collectionName = newCollectionName;
	}

	public get data(){
		return this.#data;
	}

	public get parentDatabaseName(){
		return this.#parentDatabaseName;
	}

	public get collectionName(){
		return this.#collectionName;
	}

	//#region PRE hooks
	async preValidate(){

	}
	async preSave(){

	}
	async preDelete(){

	}
	//#endregion

	//#region POST hooks
	async postValidate(){

	}
	async postSave(){

	}
	async postDelete(){

	}
	//#endregion

	
	
	/**
	 * Create an instance of the document's type.
	 * This does not write any data to a database.
	 * @author BigfootDS
	 *
	 * @static
	 * @async
	 * @param {object} newData Object containing keys of data that the document requires per its schema.
	 * @param {string} newParentDatabaseName The name of the database/client that is managing this data.
	 * @param {string} newCollectionName The name of the collection that is using this document as a model for its data.
	 * @param {boolean} [validateOnCreate=true] Boolean flag for whether or not a document instance created with this method should be validated ASAP. Default is true.
	 * @returns
	 */
	static async create<Type extends NedbBaseDocument>(
		this: { 
			new (incomingData: object, incomingParentDatabaseName: string, incomingCollectionName: string): Type
		}, 
		newData: object, 
		newParentDatabaseName: string, 
		newCollectionName:string, 
		validateOnCreate: boolean = true)
		: Promise<Type>
	{
		SuperCamoLogger(`New document being created based on collection ${newCollectionName} in database ${newParentDatabaseName}.`, "BaseDocument");

		
		let newInstance = new this(newData, newParentDatabaseName, newCollectionName);
		if (validateOnCreate){
			try {
				let isValid = await newInstance.validate();
				SuperCamoLogger("Document created is valid.", "BaseDocument");
			} catch (error) {
				throw error;
			}
		}

		

		return newInstance;
	}

	async validate(): Promise<boolean>{
		let isValid: boolean = true;

		await this.preValidate().catch(error => {
			throw new PreValidationFailure(this.data);
		});
		
		for await (const [key, value] of Object.entries(this)){
			// #region Compile the data that could potentially trigger a validation failure.

			//@ts-ignore
			let keyRule: DocumentKeyRule = this[key];

			let modelExpectsProperty: boolean = isObject(keyRule);
			if (!modelExpectsProperty){
				throw new ValidationFailureUnexpectedProperty(key);
			}

			//@ts-ignore
			SuperCamoLogger(`Validating ${key} with value of\n${isObject(this.#data[key]) ? JSON.stringify(this.#data[key]) : this.#data[key]}.`, "BaseDocument");

			

			// If no instance data was set, then apply the default value to it.
			// This is different to regular Camo, where setting a property
			// to have required & default keys still needs you to provide a value.
			// This way, we can set a property as required & default and not need
			// to provide a value to each instance constructor.
			//@ts-ignore
			if (keyRule.default && !this.#data[key]){
				if (isAsyncFunction(keyRule.default)) {
					SuperCamoLogger(`${key} is an async function`, "BaseDocument");
					//@ts-ignore
					this.#data[key] ??= await keyRule.default();

				} else if (isPromise(keyRule.default)) {
					SuperCamoLogger(`${key} is a promise`, "BaseDocument");
					//@ts-ignore
					this.#data[key] ??= await Promise.race([keyRule.default]);
				} else if (isFunction(keyRule.default)){
					SuperCamoLogger(`${key} is a synchronous function`, "BaseDocument");
					//@ts-ignore
					this.#data[key] ??= keyRule.default();
				} else {
					SuperCamoLogger(`${key} is a variable`, "BaseDocument");
					//@ts-ignore
					this.#data[key] ??= keyRule.default;
				}
			}


			let modelPropertyIsRequired: boolean = keyRule.required == true;
			//@ts-ignore
			let modelInstanceHasData = !(this.#data[key] == null);
			if (modelPropertyIsRequired && !modelInstanceHasData){
				throw new ValidationFailureMissingValueForProperty(key);
			}


			// Is the key type based on Document, EmbeddedDocument, or not?
			let typeToCheck: any = Array.isArray(keyRule.type) ? keyRule.type[0] : keyRule.type;
			SuperCamoLogger(`Type to check is ${typeToCheck.name}`, "BaseDocument");

			const {SuperCamo} = require("../../index");
			let keyClassList = getClassInheritanceList(typeToCheck);
			if (keyClassList.length == 0 || (keyClassList.length == 1 && keyClassList[0] == "")) {
				keyClassList = [typeof key];
			}
			SuperCamoLogger(`Class inheritance list for key ${key} with type of ${typeToCheck.name} is:`, "BaseDocument");
			SuperCamoLogger(keyClassList, "BaseDocument");

			if (keyClassList.includes("NedbDocument")){
				// If so, validate the ID amongst the collection within the database
				//@ts-ignore
				SuperCamoLogger(`Key of ${key} is expecting this to be an ID referring to a document: \n${JSON.stringify(this.#data[key])}`, "BaseDocument")

				let targetCollectionName = keyRule.collection;
				if (this.#parentDatabaseName == null){
					throw new ValidationFailureReferenceWithoutDatabase(key);
				}
				let targetCollection = await SuperCamo.activeClients[this.#parentDatabaseName].getCollectionAccessor(targetCollectionName);

				if (modelPropertyIsRequired || modelInstanceHasData){
					// If some ID is required or provided, make sure it's for an actual document in the collection that this key needs.

					if (isArray(keyRule.type)){

						//@ts-ignore
						let foundDocArray = await Promise.all(this.#data[key].map(async (entry: string) => {

							let referencedDoc = await targetCollection.datastore.findOneAsync({_id: entry});
							if (referencedDoc == null){
								let forgotToCallGetData = null;
								//@ts-ignore
								if (JSON.stringify(this.#data[key]).includes("required")){
									forgotToCallGetData = true;
								}

								//@ts-ignore
								let errorToThrow = new ValidationFailureMissingValueForReferencedDoc(key, this.#data[key], this[key], forgotToCallGetData);

								throw errorToThrow;
							} 

							return referencedDoc;
						}));
					} else {

						//@ts-ignore
						let referencedDoc = await targetCollection.datastore.findOneAsync({_id: this.#data[key]});
						if (referencedDoc == null){
							let forgotToCallGetData = null;
							//@ts-ignore
							if (JSON.stringify(this.#data[key]).includes("required")){
								forgotToCallGetData = true;
							}
							//@ts-ignore
							let errorToThrow = new ValidationFailureMissingValueForReferencedDoc(key, this.#data[key], this[key], forgotToCallGetData);

							throw errorToThrow;
						} 
					}

					
				}
			} else if (keyClassList.includes("NedbEmbeddedDocument")) { 
				// Make new instance of this.#data[key] and let it validate
				SuperCamoLogger("~~~~~~~~~~~~~", "BaseDocument");
				//@ts-ignore
				SuperCamoLogger(this.#data[key], "BaseDocument");
				SuperCamoLogger(keyRule.type, "BaseDocument");
				
				if (isArray(keyRule.type)){
					const { NedbEmbeddedDocument } = require("./NedbEmbeddedDocument");

					//@ts-ignore
					let embedDocInstanceArray = await Promise.all(this.#data[key].map((entry: typeof NedbEmbeddedDocument) => {
						// Trigger validation on any embedded/subdocument data by creating them temporarily:
						return keyRule.type[0].create(entry)
					}));
				} else {
					// Create instance of the embedded doc and validate it
					//@ts-ignore
					let embedDocInstance = await keyRule.type.create(this.#data[key]);
				}
				
				SuperCamoLogger("~~~~~~~~~~~~~", "BaseDocument");

			} else {
				//@ts-ignore
				let modelInstanceDataMatchesExpectedType = isType(keyRule.type, this.#data[key]);
				if (modelPropertyIsRequired && !modelInstanceDataMatchesExpectedType) {
					throw new ValidationFailureMissingValueForProperty(key);
				}
			}
			

			
			

			let modelHasChoices = isArray(keyRule.choices);
			let modelInstanceDataIsInChoices = undefined; 
			if (modelPropertyIsRequired && modelHasChoices && keyRule.choices){
				//@ts-ignore
				modelInstanceDataIsInChoices = isInChoices(keyRule.choices, this.#data[key]);

				if (!modelInstanceDataIsInChoices){
					//@ts-ignore
					throw new ValidationFailureValueNotInChoices(key, keyRule.choices, this.#data[key]);
				}
			} 

			let modelExpectsUniqueValue = keyRule.unique == true;
			if (modelExpectsUniqueValue && this.#parentDatabaseName && this.#collectionName){
				const {SuperCamo} = require("../../index");

				await SuperCamo.clients[this.#parentDatabaseName].getCollectionAccessor(this.#collectionName).datastore.ensureIndexAsync({fieldName: key, unique: true});
				// Using NeDB indexes will not actively do a unique validation here, 
				// but it sets up any unique-failing documents to fail when they are about to get written into the datastore.
			}



			// #endregion

			// #region Sanitise any properties that are invalid but without triggering a validation failure.
			if (
				(keyRule.min !== null || keyRule.min !== undefined)
				&&
				//@ts-ignore
				(keyRule.min && this.#data[key] < keyRule.min)
			) {
				//@ts-ignore
				this.#data[key] = keyRule.min;
			}

			if (
				(keyRule.max !== null || keyRule.max !== undefined)
				&&
				//@ts-ignore
				(keyRule.max && this.#data[key] > keyRule.max)
			) {
				//@ts-ignore
				this.#data[key] = keyRule.max;
			}

			// #endregion
			
			
		}

		

		await this.postValidate().catch(error => {
			throw new PostValidationFailure(this.data);
		});
		if (isValid != true){
			throw new ValidationFailure(this.data);
		}
		return isValid;
	}

	async save(){
		await this.preSave().catch(error => {
			throw new PreSaveFailure(this.data);
		});

		// TODO: Actual saving logic
		// If calling save, assume that this document is part of a DB and collection
		// Upsert into collection within DB

		await this.postSave().catch(error => {
			throw new PostSaveFailure(this.data);
		});
	}

	async delete(){
		await this.preDelete().catch(error => {
			throw new PreDeleteFailure(this.data);
		});

		// TODO: Actual delete logic
		// If calling delete, assume that this document is part of a DB and collection
		// Delete from DB
		// If the "delete from DB" function returns a 1 (number of docs deleted from datastore),
		// we know it worked

		await this.postDelete().catch(error => {
			throw new PostDeleteFailure(this.data);
		});
	}

	
	/**
	 * This document instance's data, and only the data, organized onto an object.
	 * @author BigfootDS
	 *
	 * @returns Object containing data from the document instance.
	 */
	toObject(): object {
		let result = {};

		/*
		This loops through all declared properties on the instance of the document.
		So, this will see things like `this.user` and `this.data`.
		If the key (eg. "user") is inside `this.#data`, then the value of this.#data.user gets assigned to the result.
		*/
		for (const [key, value] of Object.entries(this)){
			// TypeScript doesn't like NOT knowing if a property exists or not.
			// But, this is essentially an ORM or ODM.
			// This code just cannot know what the end-users of SuperCamo (eg. other devs) are gonna be declaring.
			// So... ignore...
			// @ts-ignore
			result[key] = this.#data[key];
		}

		return result;
	}

	/**
	 * This document instance's data, and only the data, organized onto an object.
	 * @author BigfootDS
	 *
	 * @returns Object containing data from the document instance.
	 */
	async toPopulatedObject(){
		let result: object = {};

		for (const [key, value] of Object.entries(this)){
			//@ts-ignore
			if (isObject(this[key]) && !(this.#data[key] == null)){
				// Only add property to output if it
				// was defined in the model AND
				// has a value to export

				//@ts-ignore
				let keyClassList = getClassInheritanceList(this[key].type);
				if (keyClassList.includes("NedbDocument")) {
					// Convert referenced doc into object data to bundle into this object data
					const SuperCamo = require("../../index.js");
					if (this.#parentDatabaseName){
						//@ts-ignore
						let foundDocument = await SuperCamo.activeClients[this.#parentDatabaseName].findOneDocument(this[key].collection, {_id: this.#data[key]});
						//@ts-ignore
						result[key] = await foundDocument.getData();
					}
					
				} else if (keyClassList.includes("NedbEmbeddedDocument")){
					// Convert doc into JS obj
					// Assume all embedded docs are instances, would simplify things greatly.

					//@ts-ignore
					if (this.#data[key]['getData']){
						//@ts-ignore
						result[key] = await this.#data[key].toPopulatedObject();
					} else {
						//@ts-ignore
						result[key] = this.#data[key];
					}
					
				
				} else {
					//@ts-ignore
					result[key] = this.#data[key];
				}
			}
		}


		return result;
	}

	/**
	 * Returns a JSON string of this document instance's data.
	 * @author BigfootDS
	 *
	 * @returns A JSON string of this document instance's data.
	 */
	toJSON(){
		return JSON.stringify(this.toObject());
	}

	
	/**
	 * Returns a JSON string of this document instance's data.
	 * @author BigfootDS
	 *
	 * @returns A JSON string of this document instance's data.
	 */
	toString(){
		return this.toJSON();
	}

}
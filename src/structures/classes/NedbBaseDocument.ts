import { SuperCamoLogger } from "../../utils/logging";
import { getClassInheritanceList } from "../../validators/functions/ancestors";
import { isArray, isAsyncFunction, isFunction, isInChoices, isObject, isPromise, isType } from "../../validators/functions/typeValidators";
import { DeleteFailure, PostDeleteFailure, PostSaveFailure, PostValidationFailure, PreDeleteFailure, PreSaveFailure, PreValidationFailure, SaveFailure, ValidationFailure, ValidationFailureMinMaxError, ValidationFailureMissingValueForProperty, ValidationFailureMissingValueForReferencedDoc, ValidationFailureReferenceWithoutDatabase, ValidationFailureUnexpectedProperty, ValidationFailureValueNotInChoices } from "../errors/NedbBaseDocumentErrors";
import { BaseDocument } from "../interfaces/BaseDocumentInterface";
import { DocumentConstructorData, DocumentObjectData } from "../interfaces/DocumentBaseDataInterface";
import { DocumentKeyRule } from "../interfaces/DocumentKeyRuleInterface";
import { SuperCamo } from "./SuperCamo";


export abstract class NedbBaseDocument implements BaseDocument {

	
	/**
	 * Internal property to store the actual data of a document instance. 
	 * Properties in here depend on the `rules` defined in the inheriting classes.
	 * @author BigfootDS
	 */
	#data: DocumentObjectData;

	/**
	 * Internal property to store a document instance's database name. Should not be set ever after instantiation.
	 * If null, assume that the document instance does not represent data stored in a database.
	 * @author BigfootDS
	 */
	#parentDatabaseName: string | null;

	
	/**
	 * Internal property to store a document instance's collection name. Should not be set ever after instantiation.
	 * If null, assume that the document instance does not represent data stored in a database.
	 * @author BigfootDS
	 */
	#collectionName: string | null;

	
	/**
	 * Define your document's properties in here!
	 * 
	 * @type {Object.<{string, DocumentKeyRule}>}
	 * @author BigfootDS
	 */
	rules: {
		[key: string]: DocumentKeyRule;	
	}

	
	/**
	 * Creates an instance of a SuperCamo document compatible with a NeDB system.
	 * @author BigfootDS
	 *
	 * @constructor
	 * @param {DocumentConstructorData} newData
	 * @param {string} [newParentDatabaseName]
	 * @param {string} [newCollectionName]
	 * 
	 */
	constructor(newData: DocumentConstructorData, newParentDatabaseName: string|null, newCollectionName:string|null){
		if (newData._id == null || newData._id == "") newData._id = crypto.randomUUID();
		
		this.#data = newData as DocumentObjectData;
		this.#parentDatabaseName = newParentDatabaseName;
		this.#collectionName = newCollectionName;
		
		this.rules = {};
	}

	
	/**
	 * A key-value pair dictionary of any data that this document instance contains.
	 * 
	 * It's an object, and should have an `_id` property if this document instance represents data stored in a database.
	 * @author BigfootDS
	 *
	 * @public
	 * @readonly
	 * @returns {DocumentObjectData}
	 */
	public get data(): DocumentObjectData{
		return this.#data;
	}

	/**
	 * Read-only string containing the name of the database that this document instance comes from. 
	 * 
	 * If this is null, assume that this document instance does not represent any data stored in a database.
	 * @author BigfootDS
	 *
	 * @public
	 * @readonly
	 */
	public get parentDatabaseName(): string|null{
		return this.#parentDatabaseName;
	}

	
	/**
	 * Read-only string containing the name of the database collection that this document instance comes from. 
	 * 
	 * If this is null, assume that this document instance does not represent any data stored in a database.
	 * @author BigfootDS
	 *
	 * @public
	 * @readonly
	 */
	public get collectionName(): string|null{
		return this.#collectionName;
	}

	//#region PRE hooks
	/**
	 * An asynchronous function or promise that runs whenever `validate()` is executed. Override this and customise it if you'd like!
	 * @author BigfootDS
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async preValidate(): Promise<void>{

	}
	/**
	 * An asynchronous function or promise that runs whenever `save()` is executed. Override this and customise it if you'd like!
	 * @author BigfootDS
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async preSave(): Promise<void>{

	}
	/**
	 * An asynchronous function or promise that runs whenever `delete()` is executed. Override this and customise it if you'd like!
	 * @author BigfootDS
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async preDelete(): Promise<void>{

	}
	//#endregion

	//#region POST hooks
	
	/**
	 * An asynchronous function or promise that runs whenever `validate()` is executed. Override this and customise it if you'd like!
	 * @author BigfootDS
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async postValidate(): Promise<void>{

	}
	/**
	 * An asynchronous function or promise that runs whenever `save()` is executed. Override this and customise it if you'd like!
	 * @author BigfootDS
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async postSave(): Promise<void>{

	}
	/**
	 * An asynchronous function or promise that runs whenever `delete()` is executed. Override this and customise it if you'd like!
	 * @author BigfootDS
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async postDelete(): Promise<void>{

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
	 * @returns {Promise<Type extends NedbBaseDocument>}
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

	
	/**
	 * Run validation logic against the rules defined in the document's `rules` property.
	 * 
	 * This function also runs any `preValidate` and `postValidate` methods defined on the document.
	 * @author BigfootDS
	 *
	 * @async
	 * @returns {Promise<boolean>}
	 */
	async validate(): Promise<boolean>{
		let isValid: boolean = true;

		await this.preValidate().catch(error => {
			throw new PreValidationFailure(this.data);
		});
		
		for await (const [key, value] of Object.entries(this.rules)){
			// #region Compile the data that could potentially trigger a validation failure.

			//@ts-ignore
			let keyRule: DocumentKeyRule = this.rules[key];

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



			// If a custom validate function is provided, run that.
			if (keyRule.validate){
				let validationResult: Boolean = false;
				if (isAsyncFunction(keyRule.validate)) {
					SuperCamoLogger(`${key} is an async function`, "BaseDocument");
					validationResult = await keyRule.validate(this.#data[key]);
				} else if (isPromise(keyRule.validate)) {
					SuperCamoLogger(`${key} is a promise`, "BaseDocument");
					let validatorAsPromise = keyRule.validate(this.#data[key]);
					validationResult = await Promise.race([validatorAsPromise]);
				} else if (isFunction(keyRule.validate)){
					SuperCamoLogger(`${key} is a synchronous function`, "BaseDocument");
					//@ts-ignore
					validationResult = keyRule.validate(this.#data[key]);
				} else {
					SuperCamoLogger(`${key} is a variable`, "BaseDocument");
					validationResult = keyRule.validate == this.#data[key];
				}

				if (validationResult == false){
					throw new ValidationFailure(this.#data)
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
				if (this.#parentDatabaseName == null && keyRule.required != false){
					throw new ValidationFailureReferenceWithoutDatabase(key);
				} else if (this.#parentDatabaseName == null) {
					continue;
				} 
				let targetCollection = SuperCamo.clients[this.#parentDatabaseName].getCollectionAccessor(targetCollectionName);

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
								let errorToThrow = new ValidationFailureMissingValueForReferencedDoc(key, this.#data[key], this.rules[key], forgotToCallGetData);

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
							let errorToThrow = new ValidationFailureMissingValueForReferencedDoc(key, this.#data[key], this.rules[key], forgotToCallGetData);

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
				// console.log(`Checking is value matches type for property of ${key}: {type: ${keyRule.type}, value: ${this.#data[key]}}`);
				//@ts-ignore
				let modelInstanceDataMatchesExpectedType = isType(keyRule.type, this.#data[key]);
				if (modelPropertyIsRequired && !modelInstanceDataMatchesExpectedType) {
					throw new ValidationFailureMissingValueForProperty(key);
				}
			}
			

			
			

			let modelHasChoices = isArray(keyRule.choices);
			let modelInstanceDataIsInChoices = undefined; 
			if (modelHasChoices && keyRule.choices){
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

			// #region Min/Max/MinLength/MaxLength. These can be sanitisation rules OR validation rules.

			//#region Min/Max for Numbers
			if (
				(keyRule.min !== null || keyRule.min !== undefined)
				&&
				//@ts-ignore
				(keyRule.min && (this.#data[key] < keyRule.min))
			) {
				if (keyRule.invalidateOnMinMaxError){
					throw new ValidationFailureMinMaxError(key);
				} else {
					//@ts-ignore
					this.#data[key] = keyRule.min;
				}
			}

			if (
				(keyRule.max !== null || keyRule.max !== undefined)
				&&
				//@ts-ignore
				(keyRule.max && this.#data[key] > keyRule.max)
			) {
				if (keyRule.invalidateOnMinMaxError){
					throw new ValidationFailureMinMaxError(key);
				} else {
					//@ts-ignore
					this.#data[key] = keyRule.max;
				}
			}
			//#endregion

			//#region Min/Max for Strings
			if (
				(keyRule.minLength !== null || keyRule.minLength !== undefined)
				&&
				//@ts-ignore
				(keyRule.type == String && keyRule.minLength && ((this.#data[key] == null || this.#data[key] == undefined) || this.#data[key].length < keyRule.minLength))
			) {
				if (keyRule.invalidateOnMinMaxError){
					throw new ValidationFailureMinMaxError(key);
				} else {
					if ((this.#data[key] == null || this.#data[key] == undefined)){
						// Ensure that it's a string so padEnd works!
						this.#data[key] = "";
					}
					// console.log("Padding value now...\n" + this.#data[key]);
					// console.log(`this.#data[key].padEnd(${(keyRule.minLength - this.#data[key].length)}, ${(keyRule.padStringValue ? keyRule.padStringValue : " ")});`)
					//@ts-ignore
					this.#data[key] = this.#data[key].padEnd((keyRule.minLength - this.#data[key].length) + 1, (keyRule.padStringValue ? keyRule.padStringValue : " "));

					// console.log("After padding, value is...\n" + this.#data[key]);

				}
			} 
			if (
				(keyRule.maxLength !== null || keyRule.maxLength !== undefined)
				&&
				//@ts-ignore
				(keyRule.type == String && keyRule.maxLength && this.#data[key]?.length > keyRule.maxLength)
			) {
				if (keyRule.invalidateOnMinMaxError){
					throw new ValidationFailureMinMaxError(key);
				} else {
					//@ts-ignore
					this.#data[key] = this.#data[key].substring(0, keyRule.maxLength);
				}
			}
			//#endregion

			//#region Min/Max for Arrays
			if (
				(keyRule.minLength !== null || keyRule.minLength !== undefined)
				&&
				//@ts-ignore
				(Array.isArray(keyRule.type) && keyRule.minLength && this.#data[key].length < keyRule.minLength)
			) {
				if (keyRule.invalidateOnMinMaxError){
					throw new ValidationFailureMinMaxError(key);
				} else {
					let tempArray: Array<any> = Object.assign(new Array(keyRule.minLength), this.#data[key]);
					tempArray = tempArray.fill(this.rules[key].padArrayValue, this.#data[key].length || 0);
					//@ts-ignore
					this.#data[key] = tempArray;
				}
			}
			if (
				(keyRule.maxLength !== null || keyRule.maxLength !== undefined)
				&&
				//@ts-ignore
				(Array.isArray(keyRule.type) && keyRule.maxLength && this.#data[key].length > keyRule.maxLength)
			) {
				if (keyRule.invalidateOnMinMaxError){
					throw new ValidationFailureMinMaxError(key);
				} else {
					//@ts-ignore
					this.#data[key].length = keyRule.maxLength;
				}
			}
			//#endregion

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

	
	/**
	 * Save the document to the database. If the document doesn't already exist in the database, it will be added to the database automatically.
	 * 
	 * This function also runs any `preSave` and `postSave` methods defined on the document.
	 * @author BigfootDS
	 *
	 * @async
	 * @returns {Promise<boolean>}
	 */
	async save(): Promise<boolean>{
		await this.preSave().catch(error => {
			throw new PreSaveFailure(this.data);
		});

		// If calling save, assume that this document is part of a DB and collection
		// Upsert into collection within DB
		if (!this.#parentDatabaseName || !this.#collectionName){
			throw new SaveFailure({parentDatabaseName: this.#parentDatabaseName, collectionName: this.#collectionName, data: this.data});
		}

	
		let collectionAccessor = SuperCamo.clientGet(this.#parentDatabaseName)?.getCollectionAccessor(this.#collectionName);
		if (collectionAccessor == null){
			throw new SaveFailure({parentDatabaseName: this.#parentDatabaseName, collectionName: this.#collectionName, data: this.data});
		}

		await this.validate();
		// Do we need anything from the upsertResult when we're just saving?
		// Pretty sure we don't. Still need this line as a "wait while this thing happens" step though.
		let upsertResult = await collectionAccessor.datastore.updateAsync({_id: this.data._id}, this.data, {upsert: true});


		await this.postSave().catch(error => {
			throw new PostSaveFailure(this.data);
		});

		return true;
	}

	
	/**
	 * Delete this document from the database client that it lives in.
	 * 
	 * If you're using a databaseless-document instance, this method will throw an error!
	 * @author BigfootDS
	 *
	 * @async
	 * @param {boolean} [deleteReferences] Similar to `deepDeleteReferences`, but you can pick one or the other. If true, all referenced documents will also delete themselves. If those referenced documents also reference additional documents, those documents are unaffected and may become orphaned.
	 * @param {boolean} [deepDeleteReferences] Similar to `deleteReferences`, but you can pick one or the other. If true, all referenced documents will also delete themselves and recursively delete any documents that they also reference.
	 * @returns {number} Number of documents deleted. You'd want this to be just 1. Other functions may use this number to create a greater tally (eg. a database client's `findAndDeleteMany` method).
	 */
	async delete(deleteReferences?: boolean, deepDeleteReferences?: boolean): Promise<number>{
		await this.preDelete().catch(error => {
			throw new PreDeleteFailure(this.data);
		});

		// If calling delete, assume that this document is part of a DB and collection
		// Delete from DB
		// If the "delete from DB" function returns a 1 (number of docs deleted from datastore),
		// we know it worked
		if (!this.#parentDatabaseName || !this.#collectionName){
			throw new DeleteFailure({parentDatabaseName: this.#parentDatabaseName, collectionName: this.#collectionName, data: this.data});
		}

		let collectionAccessor = SuperCamo.clientGet(this.#parentDatabaseName)?.getCollectionAccessor(this.#collectionName);
		if (collectionAccessor == null){
			throw new DeleteFailure({parentDatabaseName: this.#parentDatabaseName, collectionName: this.#collectionName, data: this.data});
		}

		if (deleteReferences || deepDeleteReferences){

			let refsToDelete: Array<{_id: string, collectionName: string}> = new Array();
			const docsToDelete = async (kvp: Array<{_id: string, collectionName: string}>) => {
				if (this.#parentDatabaseName == null){
					throw new DeleteFailure({parentDatabaseName: this.#parentDatabaseName, collectionName: this.#collectionName, data: this.data});
				}
				for (const kvItem of kvp) {
					let foundDoc = await SuperCamo.clients[this.#parentDatabaseName].findOneDocument(kvItem.collectionName, {_id: kvItem._id});
					if (foundDoc == null){
						throw new DeleteFailure({parentDatabaseName: this.#parentDatabaseName, collectionName: this.#collectionName, data: this.data});
					}
					if (deepDeleteReferences == true){
						await foundDoc.delete(true, true);
					} else {
						await foundDoc.delete();
					}
				}
			}

			if (deleteReferences == true) {
				Object.entries(this.rules).forEach(ruleObj => {
					if (ruleObj[1].collection){
						refsToDelete.push({_id: this.#data[ruleObj[0]], collectionName: ruleObj[1].collection});
					}
				});
				if (refsToDelete.length != 0){
					await docsToDelete(refsToDelete);
				}
			} else {
				throw new DeleteFailure({
					parentDatabaseName: this.#parentDatabaseName, 
					collectionName: this.#collectionName, 
					data: this.data, 
					deleteReferences: deleteReferences
				});
			}
		}

		let deleteResult = await collectionAccessor.datastore.removeAsync({_id: this.data._id}, {multi: false});

		await this.postDelete().catch(error => {
			throw new PostDeleteFailure(this.data);
		});

		return deleteResult;
	}

	
	/**
	 * This document instance's data, and only the data, organized onto an object.
	 * 
	 * This does not retrieve any referenced document's data, it's just a shallow object representation of this own document!
	 * @author BigfootDS
	 *
	 * @returns {object} Object containing data from the document instance.
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
	 * This document instance's data, and only the data, organized onto an object. This also retrieves data from referenced documents and stores their data as a nested object within this document, too.
	 * @author BigfootDS
	 *
	 * @returns {DocumentObjectData} Object containing data from the document instance.
	 */
	async toPopulatedObject(): Promise<DocumentObjectData>{
		let result: DocumentObjectData = {
			_id: this.data._id
		};

		for (const [key, value] of Object.entries(this.rules)){
			//@ts-ignore
			if (isObject(this.rules[key]) && !(this.#data[key] == null)){
				// Only add property to output if it
				// was defined in the model AND
				// has a value to export

				//@ts-ignore
				let keyClassList = getClassInheritanceList(this.rules[key].type);
				if (keyClassList.includes("NedbDocument")) {
					// Convert referenced doc into object data to bundle into this object data
					const {SuperCamo} = require("../../index.js");
					// console.log(SuperCamo);
					if (this.#parentDatabaseName){
						//@ts-ignore
						let foundDocument = await SuperCamo.clients[this.#parentDatabaseName].findOneDocument(this.rules[key].collection, {_id: this.#data[key]});
						//@ts-ignore
						result[key] = await foundDocument.toPopulatedObject();
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
import { SuperCamoLogger } from "../../utils/logging";
import { getClassInheritanceList } from "../../validators/functions/ancestors";
import { isObject } from "../../validators/functions/typeValidators";
import { BaseDocument } from "../interfaces/BaseDocumentInterface";


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

	async validate(){

	}

	async save(){

	}

	async delete(){

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
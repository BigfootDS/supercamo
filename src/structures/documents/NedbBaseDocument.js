import { isArray, isInChoices, isObject, isType } from "../../validators/index.js";


export default class NedbBaseDocument {
	#data = {};
	constructor(incomingData){
		// This _id value comes from NeDB datastores, the dev or user should never be editing this.
		this._id = {
			type: String,
			required: false // If a document is created but not saved, it won't have an _id value.
		}

		this.#data = {...incomingData};
	}

	static create = async (dataObj) => {
		
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
			let modelExpectsProperty = isObject(this[key])
			let modelInstanceHasData = this.#data[key];
			let modelInstanceDataMatchesExpectedType = isType(this[key].type, this.#data[key]);
			let modelHasChoices = isArray(this[key].choices);
			let modelInstanceDataIsInChoices = isInChoices(this[key].choices, [this.#data[key]]);
			let modelExpectsUniqueValue = this[key].unique === true;
			
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

	async convertInstanceToObject(){
		let result = {};

		await this.#validate();

		for await (const [key, value] of Object.entries(this)){
			if (isObject(this[key]) && this.#data[key]) {
				// Only add property to output if it
				// was defined in the model AND
				// has a value to export
				result[key] = this.#data[key];
			}
		}

		return result;
	}
}
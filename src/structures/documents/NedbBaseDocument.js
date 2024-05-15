

export default class NedbBaseDocument {
	constructor(data){
		// This _id value comes from NeDB datastores, the dev or user should never be editing this.
		this._id = {
			type: String,
			required: false // If a document is created but not saved, it won't have an _id value.
		}

	}

	async preValidate(clientInstance) {

	}
	
	async postValidate(clientInstance){

	}

	async preSave(clientInstance){

	}

	async postSave(clientInstance){

	}

	async preDelete(clientInstance){

	}

	async postDelete(clientInstance){

	}

	convertSchemaToObject(){
		let result = {};

		for (const [key, value] of Object.entries(this.schema)){

		}

		return result;
	}
}
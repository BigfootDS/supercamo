

export default class BaseDocument {
	constructor(){
		this._schema = {
			_id: {type: String}
		};

		this._id = null;
	}

	static findOne = (collectionPath, query) => {
		console.log("Gonna find one document inside:\n" + collectionPath);
	}
}
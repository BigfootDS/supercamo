

export default class NedbBaseDocument {
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
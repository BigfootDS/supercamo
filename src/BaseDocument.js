

export default class BaseDocument {
	constructor(){
		this._schema = {
			_id: {type: String}
		};

		this._id = null;
	}
}
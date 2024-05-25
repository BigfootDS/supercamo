const BaseDocument = require("./NedbBaseDocument.js");


module.exports = class NedbDocument extends BaseDocument {
	constructor(incomingData, incomingParentDatabaseName, incomingCollectionName){
		super(incomingData, incomingParentDatabaseName, incomingCollectionName);
		
	}
}


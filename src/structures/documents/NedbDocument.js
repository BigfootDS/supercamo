const BaseDocument = require("./NedbBaseDocument.js");

class NedbDocument extends BaseDocument {
	constructor(incomingData, incomingParentDatabaseName, incomingCollectionName){
		super(incomingData, incomingParentDatabaseName, incomingCollectionName);
		
	}
}


module.exports = NedbDocument;
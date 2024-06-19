const NedbBaseDocument = require("./NedbBaseDocument.js");


class NedbEmbeddedDocument extends NedbBaseDocument {
	constructor(incomingData, incomingParentDatabaseName, incomingCollectionName){
		super(incomingData, incomingParentDatabaseName, incomingCollectionName);
		
	}


}

module.exports = NedbEmbeddedDocument;
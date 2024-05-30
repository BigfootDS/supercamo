const NedbBaseDocument = require("./NedbBaseDocument.js");


module.exports = class NedbEmbeddedDocument extends NedbBaseDocument {
	constructor(incomingData, incomingParentDatabaseName, incomingCollectionName){
		super(incomingData, incomingParentDatabaseName, incomingCollectionName);
		
	}


}
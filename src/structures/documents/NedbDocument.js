const NedbBaseDocument = require("./NedbBaseDocument.js");


/**
 * This is the class that you should use when making schemas or models for your own database documents.
 * 
 * Inherit (extend) this class and add your properties to it, and that becomes your document.
 * 
 * Please note that due to bugs in JSDoc, the static methods that this class has available to it will not show up on this class's page - but instead, on the NedbBaseDocument page. Please see the "Extends" section for that URL, and dig into the parent class for the static method documentation.
 * @author BigfootDS
 *
 * @class
 * @extends {NedbBaseDocument}
 */
class NedbDocument extends NedbBaseDocument {
	constructor(incomingData, incomingParentDatabaseName, incomingCollectionName){
		super(incomingData, incomingParentDatabaseName, incomingCollectionName);
		
	}
}


module.exports = NedbDocument;
/** @module Internal */


const NedbBaseDocument = require("../../structures/documents/NedbBaseDocument.js");
const NedbDocument = require("../../structures/documents/NedbDocument.js");
const NedbEmbeddedDocument = require("../../structures/documents/NedbEmbeddedDocument.js");
const SuperCamoLogger = require("../../utils/logging.js");


const doesExtendBaseDocument = (childClass) => {
	return NedbBaseDocument.prototype.isPrototypeOf(childClass);
}

const doesExtendDocument = (childClass) => {
	SuperCamoLogger("Checking NedbDocument require...", "Validators")
	SuperCamoLogger(NedbDocument, "Validators");
	return NedbDocument.prototype.isPrototypeOf(childClass);
}

const doesExtendEmbeddedDocument = (childClass) => {
	return NedbEmbeddedDocument.prototype.isPrototypeOf(childClass);
}




module.exports = {
	doesExtendBaseDocument, doesExtendDocument, doesExtendEmbeddedDocument,
	
}
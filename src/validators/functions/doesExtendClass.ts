/** @module Internal */


const NedbBaseDocument = require("../../structures/documents/NedbBaseDocument.js");
const NedbDocument = require("../../structures/documents/NedbDocument.js");
const NedbEmbeddedDocument = require("../../structures/documents/NedbEmbeddedDocument.js");
import { SuperCamoLogger } from "../../utils/logging";


const doesExtendBaseDocument = (childClass: any) => {
	return NedbBaseDocument.prototype.isPrototypeOf(childClass);
}

const doesExtendDocument = (childClass: any) => {
	SuperCamoLogger("Checking NedbDocument require...", "Validators")
	SuperCamoLogger(NedbDocument, "Validators");
	return NedbDocument.prototype.isPrototypeOf(childClass);
}

const doesExtendEmbeddedDocument = (childClass: any) => {
	return NedbEmbeddedDocument.prototype.isPrototypeOf(childClass);
}




module.exports = {
	doesExtendBaseDocument, doesExtendDocument, doesExtendEmbeddedDocument,
	
}
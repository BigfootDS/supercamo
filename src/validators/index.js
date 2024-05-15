import { doesExtendBaseDocument, doesExtendNedbClient, doesExtendDocument, doesExtendEmbeddedDocument } from "./functions/doesExtendClass.js";
import { isDatabaseConnected } from "./functions/isDatabaseConnected.js";
import { isString, isNumber, isBoolean, isDate, isBuffer, isObject, isArray, isDocument, isEmbeddedDocument, isSupportedType, isSupportedTypeOrInheritsFromADocument, isInChoices } from "./functions/typeValidators.js";


export {
	isString, isNumber, isBoolean, isDate, isBuffer, isObject, isArray, isDocument, isEmbeddedDocument, isSupportedType, isSupportedTypeOrInheritsFromADocument, isInChoices,
	doesExtendBaseDocument, doesExtendNedbClient, doesExtendDocument, doesExtendEmbeddedDocument,
	isDatabaseConnected
};




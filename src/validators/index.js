/** @module Internal */
// const { doesExtendBaseDocument, doesExtendNedbClient, doesExtendDocument, doesExtendEmbeddedDocument } = require("./functions/doesExtendClass.js");
const { isDatabaseConnected, isDatabaseConnected_RootHelper } = require("./functions/isDatabaseConnected.js");
const { isString, isNumber, isBoolean, isDate, isBuffer, isObject, isArray, isSupportedType, isSupportedTypeOrInheritsFromADocument, isInChoices, isType, isFunction, isAsyncFunction, isPromise } = require("./functions/typeValidators.js");


module.exports = {
	isString, isNumber, isBoolean, isDate, isBuffer, isObject, isArray, isSupportedType, isSupportedTypeOrInheritsFromADocument, isInChoices, isType, isFunction, isAsyncFunction, isPromise, 
	// doesExtendBaseDocument, doesExtendNedbClient, doesExtendDocument, doesExtendEmbeddedDocument,
	isDatabaseConnected, isDatabaseConnected_RootHelper
};




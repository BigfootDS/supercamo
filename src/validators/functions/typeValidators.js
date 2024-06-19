/** @module Internal */
const SuperCamoLogger = require("../../utils/logging");
const util = require("node:util");
// const { doesExtendDocument, doesExtendEmbeddedDocument } = require("./doesExtendClass.js");

const isString = (data) => {
	return typeof data === "string" || data instanceof String;
}

const isNumber = (data) => {
	// Checks the type of data, and then checks 
	// that the value is a number (and not NaN, Infinity, or -Infinity).
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite
	return Number.isFinite(data);
}

const isBoolean = (data) => {
	return typeof data === 'boolean' || data instanceof Boolean;
}

const isDate = (data) => {
	// Various different solutions, all seem equally wrecked in specific edge cases:
	// https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
	// ...so... let's just slap a bunch of them in here? IDK.
	return util.types.isDate(data) || !isNaN(data) || data instanceof Date;
}

const isBuffer = (data) => {
	return Buffer.isBuffer(data);
}

const isObject = (data) => {
	return data !== null && typeof data === 'object'
}

const isArray = (data) => {
	return Array.isArray(data);
}

// const isDocument = (data) => {
// 	return doesExtendDocument(data);
// }

// const isEmbeddedDocument = (data) => {
// 	return doesExtendEmbeddedDocument(data);
// }

const isSupportedType = (data) => {
	return isString(data) || isNumber(data) || isBoolean(data) || isBuffer(data) || isDate(data) || isArray(data) || isObject(data);
}

const isSupportedTypeOrInheritsFromADocument = (data) => {
	return isSupportedType(data) || doesExtendDocument(data) || doesExtendEmbeddedDocument(data);
}

const isInChoices = (choices, item) => {
	if (!isArray(choices)) throw new TypeError(JSON.stringify({message:`Choices must be an array of values, even if they only have one value.`, value: choices}));

	// I'm aware that the original Camo uses `.indexOf`, however in modern NodeJS versions
	// `.includes` is either equal to or better than `.indexOf` in performance.
	// And is almost-objectively better for code readability.
	// https://github.com/nodejs/node/issues/26568
	return choices.includes(item);
}


/**
 * Check if a value is an ES6 class. This fails if the codebase is transpiled to ES5 or earlier.
 * 
 * Code from this StackOverflow answer licensed with CC BY-SA 4.0:
 * https://stackoverflow.com/a/75567955
 * No changes were made to this particular code.
 * @author Andrea Giammarchi
 *
 * @param fn
 * @returns {boolean}
 */
const isESClass = fn => (
	typeof fn === 'function' &&
	Object.getOwnPropertyDescriptor(
	  fn,
	  'prototype'
	)?.writable === false
);

// Used in document data validation
const isType = (typeWanted, valueToCheck) => {
	SuperCamoLogger("Checking type of this data now:", "Validators");
	SuperCamoLogger(valueToCheck, "Validators");
	SuperCamoLogger("Wanted type should be of this data:", "Validators");
	SuperCamoLogger(typeWanted, "Validators");
	SuperCamoLogger(typeWanted.name, "Validators");
	SuperCamoLogger(typeof(typeWanted), "Validators");
	SuperCamoLogger(isArray(typeWanted), "Validators");

	if (isArray(typeWanted) && isArray(valueToCheck)){
		// If all keys found on valueToCheck each exist on typeWanted[0],
		// then we can assume that valueToCheck is the data obj of typeWanted's "array of XYZ" class
		let valueToCheckKeys = Object.keys(valueToCheck);
		let typeWantedCoreKeys = Object.keys(typeWanted[0]);

		return valueToCheckKeys.every(key => typeWantedCoreKeys.includes(key));
	}

	if (isObject(valueToCheck)){
		// If all keys found on valueToCheck each exist on typeWanted,
		// then we can assume that valueToCheck is the data obj of typeWanted's class
		let valueToCheckKeys = Object.keys(valueToCheck);
		let typeWantedCoreKeys = Object.keys(typeWanted);

		return valueToCheckKeys.every(key => typeWantedCoreKeys.includes(key));
	}

	switch (new String(typeWanted.name).toLowerCase()) {
		case "string":
			return isString(valueToCheck);
		case "number":
			return isNumber(valueToCheck);
		case "boolean":
			return isBoolean(valueToCheck);
		case "buffer":
			return isBuffer(valueToCheck);
		case "date":
			return isDate(valueToCheck);
		case "array":
		case isArray(typeWanted):
			return isArray(valueToCheck);
		case "object":
			return isObject(valueToCheck);
		// case isDocument(typeWanted):
		// 	// this feels incorrect, will fix later
		// 	return isDocument(valueToCheck);
		// case isEmbeddedDocument(typeWanted):
		// 	// this feels incorrect, will fix later
		// 	return isEmbeddedDocument(valueToCheck);
		default:
			throw new TypeError("Unsupported type set in document:" + JSON.stringify({wanted: typeWanted, received: valueToCheck}));
	}
}

const isFunction = (valueToCheck) => {
	return typeof valueToCheck === 'function';
}

const isAsyncFunction = (valueToCheck) => {
	return util.types.isAsyncFunction(valueToCheck);
}

const isPromise = (valueToCheck) => {
	return util.types.isPromise(valueToCheck);
}


module.exports = {
	isString, isNumber, isBoolean, isDate, isBuffer, isObject, isArray,
	// isDocument, isEmbeddedDocument, 
	isSupportedType, isSupportedTypeOrInheritsFromADocument,
	isInChoices,
	isType,
	isFunction, isAsyncFunction, isPromise,
	isESClass
}
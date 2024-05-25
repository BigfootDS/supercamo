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


// Used in document data validation
const isType = (typeWanted, valueToCheck) => {
	switch (typeWanted.name) {
		case "String":
			return isString(valueToCheck);
		case "Number":
			return isNumber(valueToCheck);
		case "Boolean":
			return isBoolean(valueToCheck);
		case "Buffer":
			return isBuffer(valueToCheck);
		case "Date":
			return isDate(valueToCheck);
		case "Array":
		case isArray(typeWanted):
			return isArray(valueToCheck);
		case "Object":
			return isObject(valueToCheck);
		// case isDocument(typeWanted):
		// 	// this feels incorrect, will fix later
		// 	return isDocument(valueToCheck);
		// case isEmbeddedDocument(typeWanted):
		// 	// this feels incorrect, will fix later
		// 	return isEmbeddedDocument(valueToCheck);
		default:
			throw new TypeError("Unsupported type set in document:" + typeWanted);
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
	isFunction, isAsyncFunction, isPromise
}
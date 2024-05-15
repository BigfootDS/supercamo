import * as util from "node:util";
import { doesExtendDocument, doesExtendEmbeddedDocument } from "./doesExtendClass.js";

export const isString = (data) => {
	return typeof data === "string" || data instanceof String;
}

export const isNumber = (data) => {
	// Checks the type of data, and then checks 
	// that the value is a number (and not NaN, Infinity, or -Infinity).
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite
	return Number.isFinite(data);
}

export const isBoolean = (data) => {
	return typeof data === 'boolean' || data instanceof Boolean;
}

export const isDate = (data) => {
	// Various different solutions, all seem equally wrecked in specific edge cases:
	// https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
	// ...so... let's just slap a bunch of them in here? IDK.
	return util.types.isDate(data) || !isNaN(data) || data instanceof Date;
}

export const isBuffer = (data) => {
	return Buffer.isBuffer(data);
}

export const isObject = (data) => {
	return data !== null && typeof data === 'object'
}

export const isArray = (data) => {
	return Array.isArray(data);
}

export const isDocument = (data) => {
	return doesExtendDocument(data);
}

export const isEmbeddedDocument = (data) => {
	return doesExtendEmbeddedDocument(data);
}

export const isSupportedType = (data) => {
	return isString(data) || isNumber(data) || isBoolean(data) || isBuffer(data) || isDate(data) || isArray(data) || isObject(data);
}

export const isSupportedTypeOrInheritsFromADocument = (data) => {
	return isSupportedType(data) || doesExtendDocument(data) || doesExtendEmbeddedDocument(data);
}

export const isInChoices = (choices, item) => {
	if (!isArray(choices)) throw new TypeError(JSON.stringify({message:`Choices must be an array of values, even if they only have one value.`, value: choices}));

	// I'm aware that the original Camo uses `.indexOf`, however in modern NodeJS versions
	// `.includes` is either equal to or better than `.indexOf` in performance.
	// And is almost-objectively better for code readability.
	// https://github.com/nodejs/node/issues/26568
	return choices.includes(item);
}
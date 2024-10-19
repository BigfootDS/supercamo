/**
 * This is the content that you can import in your own code.
 * 
 * @example
 * NodeJS CommonJS import:
 * ```js
 * const {NedbClient, SuperCamo} = require("@bigfootds/supercamo");
 * ```
 * ```js
 * const SuperCoolPackage = require("@bigfootds/supercamo");
 * ```
 * 
 * ES6 Import:
 * ```js
 * import {SuperCamo} from "@bigfootds/supercamo";
 * ```
 * 
 * 
 * @module Package Exports
 * @category Guides
 * @packageDocumentation
 */

export { CollectionAccessor } from "./structures/classes/CollectionAccessor";
export { CollectionListEntry } from "./structures/classes/CollectionListEntry";

export { NedbDocument } from "./structures/classes/NedbDocument";
export { NedbEmbeddedDocument } from "./structures/classes/NedbEmbeddedDocument";
export { NedbClient } from "./structures/classes/NedbClient";

export { SuperCamo } from "./structures/classes/SuperCamo";

import * as NedbClientErrors from "./structures/errors/NedbClientErrors";
export { NedbClientErrors }

import * as NedbBaseDocumentErrors from "./structures/errors/NedbBaseDocumentErrors";
export { NedbBaseDocumentErrors }

import { DocumentBaseData, DocumentConstructorData, DocumentObjectData } from "./structures/interfaces/DocumentBaseDataInterface";
import { BaseDocument } from "./structures/interfaces/BaseDocumentInterface";
import { CollectionAccessor as CollectionAccessorData } from "./structures/interfaces/CollectionAccessorInterface";
import { CollectionsListEntry } from "./structures/interfaces/CollectionsListEntryInterface";
import { DocumentKeyRule } from "./structures/interfaces/DocumentKeyRuleInterface";
import { NedbClientEntry } from "./structures/interfaces/NedbClientEntryInterface";
import { findManyDocumentsOptions, findManyObjectsOptions, findOneObjectOptions, updateManyOptions, updateOptions } from "./structures/interfaces/QueryOptions";


export {
	DocumentConstructorData,
	DocumentObjectData,
	DocumentBaseData,
	BaseDocument,
	CollectionAccessorData,
	CollectionsListEntry,
	DocumentKeyRule,
	NedbClientEntry,
	findOneObjectOptions,
	findManyObjectsOptions,
	findManyDocumentsOptions,
	updateOptions,
	updateManyOptions
}
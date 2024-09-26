/**
 * @module Classes
 * @category Reference
 * @categoryDescription Reference
 * 
 * @remarks
 * 
 * These classes will be the most-common thing you'll interact with when using this package.
 * 
 * Typically, you'd be using the SuperCamo singleton class for its static methods and defining your own document models by inheriting from NedbDocument and NedbEmbeddedDocument classes.
 * 
 * @example
 * NodeJS CommonJS import:
 * ```js
 * const {SuperCamo} = require("@bigfootds/supercamo");
 * SuperCamo.clientConnect(/* params go here *\/);
 * ```
 * ```js
 * const SuperCoolPackage = require("@bigfootds/supercamo");
 * SuperCoolPackage.SuperCamo.clientConnect(/* params go here *\/);
 * ```
 * 
 * ES6 Import:
 * ```js
 * import {SuperCamo} from "@bigfootds/supercamo";
 * SuperCamo.clientConnect(/* params go here *\/);
 * ```
 * 
 * 
 */

import { DocumentConstructorData } from "../interfaces/DocumentBaseDataInterface";
import { NedbBaseDocument } from "./NedbBaseDocument";

/**
 * This is the class that you should use when making schemas or models for your own database subdocuments or embedded documents.
 *
 * Inherit (extend) this class and add your properties to it, and that becomes your embedded document.
 *
 * @author BigfootDS
 *
 * @class
 * @module Classes
 * @category Reference
 * @extends {NedbBaseDocument}
 */
export class NedbEmbeddedDocument extends NedbBaseDocument {
	constructor(
		newData: DocumentConstructorData,
		newParentDatabaseName: string | null,
		newCollectionName: string | null
	) {
		super(newData, newParentDatabaseName, newCollectionName);
	}
}

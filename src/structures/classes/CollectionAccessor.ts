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

import Nedb from "@seald-io/nedb";
import { CollectionAccessor as ICollectionAccessor } from "../interfaces/CollectionAccessorInterface";
import { NedbDocument } from "./NedbDocument";

export class CollectionAccessor implements ICollectionAccessor {
	name: string;
	model: typeof NedbDocument;
	path: string;
	datastore: Nedb;
	
	constructor(name: string, model: typeof NedbDocument, path: string, datastore: Nedb){
		this.name = name;
		this.model = model;
		this.path = path;
		this.datastore = datastore;
	}
}
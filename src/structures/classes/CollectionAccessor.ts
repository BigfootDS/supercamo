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


/**
 * The data structure used by NedbClients to manage their collections of documents.
 * 
 * The path and datastore are used in the actual persisting of the data by NeDB.
 * 
 * The name and model are used by SuperCamo to determine what document rules to apply to the collection's data.
 * 
 * This is not a class that you, as a user of the SuperCamo package, will typically interact with or use directly at all.
 * @author BigfootDS
 *
 * @class
 */
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
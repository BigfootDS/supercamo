/**
 * The core properties of any type of document used in SuperCamo.
 * @author BigfootDS
 * @module Interfaces
 * @category Reference 
 * @interface
 */

import { DocumentConstructorData } from "./DocumentBaseDataInterface";
import { DocumentKeyRule } from "./DocumentKeyRuleInterface";



/**
 * The core properties of any type of document used in SuperCamo.
 * @author BigfootDS
 * @module Interfaces
 * @category Reference 
 * @interface
 */
export interface BaseDocument {
	/**
	 * Storage of the document data, used when making instances of document-based classes to create documents.
	 * 
	 * eg. `this.username` would define the rules that the data must obey for the `username` property of a document, while the actual data for `username` should live in `this.data.username`.
	 * @author BigfootDS
	 */
	data: DocumentConstructorData,


		
	/**
	 * The name of the database that the data for this document instance has come from. Useful for checking if a database already has this document, from the document or generic functions.
	 * 
	 * However, this will be null if the document instance was created without the involvement of a database query. 
	 * 
	 * ## Examples:
	 * No value:
	 * ```js
	 * let newUser = await User.create({username:"alex"});
	 * console.log(newUser.parentDatabaseName); // null/undefined expected
	 * ```
	 * 
	 * Some value:
	 * ```js
	 * let newUser = await someDbClient.create({username:"alex"}, "Users");
	 * console.log(newUser.parentDatabaseName); // someDbClient's `name` value appears here, because someDbClient passed that into the document that it created
	 * ```
	 * @author BigfootDS
	 */
	parentDatabaseName: string|null,


	/**
	 * The name of the collection that the data for this document instance has come from. Useful for checking if a database already has this document when a database client *is using the same model in multiple collections*, from the document or generic functions.
	 * 
	 * However, this will be null if the document instance was created without the involvement of a database query. 
	 * 
	 * ## Examples:
	 * No value:
	 * ```js
	 * let newUser = await User.create({username:"alex"});
	 * console.log(newUser.collectionName); // null/undefined expected
	 * ```
	 * 
	 * Some value:
	 * ```js
	 * let newUser = await someDbClient.create({username:"alex"}, "Users");
	 * console.log(newUser.collectionName); // Value of "Users" appears here, because someDbClient passed that into the document that it created
	 * ```
	 * @author BigfootDS
	 */
	collectionName: string|null
}
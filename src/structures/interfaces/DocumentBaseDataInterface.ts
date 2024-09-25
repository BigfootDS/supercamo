

/**
 * Declaration that data within a document should be a key-value pair - an object!
 * @author BigfootDS
 *
 * @export
 * @interface
 */
export interface DocumentBaseData{
	[key: string]: any;
}


/**
 * When documents are created or instantiated, they may or may not have an `_id` in their data. If they do, great! If not, no big deal.
 * @author BigfootDS
 *
 * @export
 * @interface
 * @extends {DocumentBaseData}
 */
export interface DocumentConstructorData extends DocumentBaseData {
	_id?: string;
}


/**
 * When documents are actively in use, they should have an `_id` property with a value.
 * @author BigfootDS
 *
 * @export
 * @interface
 * @extends {DocumentBaseData}
 */
export interface DocumentObjectData extends DocumentBaseData {
	_id: string;

}


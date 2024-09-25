
/**
 * Configuration object for methods that find one document and returns it as an object.
 * @author BigfootDS
 *
 * @export
 * @interface
 */
export interface findOneObjectOptions {

	/**
	 * A NeDB projection object. This is passed along as-is to NeDB, so please refer to their documentation about projections.
	 * 
	 * {@link https://github.com/louischatriot/nedb?tab=readme-ov-file#projections}
	 * @author BigfootDS
	 */
	projection: object;

}

/**
 * Configuration object for methods that find many documents as objects at once.
 * @author BigfootDS
 *
 * @export
 * @interface
 */
export interface findManyObjectsOptions {
	/**
	 * A number to limit how many documents should be returned during a findMany operation.
	 * @author BigfootDS
	 */
	limit: number;

	
	/**
	 * A NeDB projection object. This is passed along as-is to NeDB, so please refer to their documentation about projections.
	 * 
	 * {@link https://github.com/louischatriot/nedb?tab=readme-ov-file#projections}
	 * @author BigfootDS
	 */
	projection: object;

}

/**
 * Configuration object for methods that find many documents at once.
 * @author BigfootDS
 *
 * @export
 * @interface
 */
export interface findManyDocumentsOptions {
	/**
	 * A number to limit how many documents should be returned during a findMany operation.
	 * @author BigfootDS
	 */
	limit: number;

}

/**
 * Configuration object for methods that update a singular document at a time.
 * @author BigfootDS
 *
 * @export
 * @interface
 */
export interface updateOptions {
	/**
	 * During the requested update operation, if no document already exists that matches the query, this controls whether or not a new document should be created.
	 * If true: a new document is created.
	 * If false: no new document is created.
	 * @author BigfootDS
	 */
	upsert: boolean;
	
}


/**
 * Configuration object for methods that update many documents at once.
 * @author BigfootDS
 *
 * @export
 * @interface
 */
export interface updateManyOptions {
	
	/**
	 * During the requested update operation, if no document already exists that matches the query, this controls whether or not a new document should be created.
	 * If true: a new document is created.
	 * If false: no new document is created.
	 * @author BigfootDS
	 */
	upsert: boolean;

	
	/**
	 * A number to limit how many documents should be updated during an updateMany operation.
	 * @author BigfootDS
	 */
	limit: number;
}
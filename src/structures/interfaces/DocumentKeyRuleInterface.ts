

/**
 * The constraints that SuperCamo can use on its document data properties. Try not to use them all on a single property - be sensible!
 * @author BigfootDS
 *
 * @export
 * @interface
 */
export interface DocumentKeyRule {
	
	/**
	 * A JavaScript class or type.
	 * This should be on every document key rule object, it is required.
	 * Various other constraints depend on the type!
	 * @author BigfootDS
	 */
	type:  any,
	
	/**
	 * Whether or not a property defined in the document's `rules` object _must_ have a value in its data.
	 * @author BigfootDS
	 */
	required?: boolean,
	
	/**
	 * Used for properties that are references to other documents. The value of this should be the name of the collection that the referenced document lives in.
	 * eg. `collection: "Users",` would be useful for refering to documents that live in a "Users" collection of a database.
	 * No, you cannot refer to collections that exist in separate database clients.
	 * @author BigfootDS
	 */
	collection?: string,

	/**
	 * Whether or not the data value for this property should be unique within the database. This sets up a NeDB index, so it's not immediately checked at a SuperCamo level - but NeDB immediately enforces it.
	 * @author BigfootDS
	 */
	unique?: boolean,

	/**
	 * The default data of this property, to be used if no data is provided or if a soft-invalidation occurs.
	 * @author BigfootDS
	 */
	default?: any,

	/**
	 * The lowest value that this property can have for its data value.
	 * For properties that are numbers. 
	 * @author BigfootDS
	 */
	min?: number,

	/**
	 * The highest value that this property can have for its data value.
	 * For properties that are numbers. 
	 * @author BigfootDS
	 */
	max?: number,

	/**
	 * The shortest length that this property can have for its data value.
	 * For properties that are strings or arrays. 
	 * @author BigfootDS
	 */
	minLength?: number,

	/**
	 * The highest length that this property can have for its data value.
	 * For properties that are strings or arrays. 
	 * @author BigfootDS
	 */
	maxLength?: number,

	/**
	 * Determines whether not an invalid value for min, max, minLength, and maxLength properties will throw an error or just roll-over and allow the value to exist.
	 * Depending on the property, it may get replaced with a default or min or max value if this is set to false.
	 * @author BigfootDS
	 */
	invalidateOnMinMaxError?: boolean,

	/**
	 * If a string data value is too short, this is the value that will be used to pad the data until it meets the `minLength` property.
	 * @author BigfootDS
	 */
	padStringValue?: string,

	/**
	 * If an array data value's length is too short, this is the value that will be used to pad the array until it meets the `minLength` property.
	 * @author BigfootDS
	 */
	padArrayValue?: any,

	/**
	 * An array of data that should match the specified type, to restrict the possible values of this property.
	 * @author BigfootDS
	 */
	choices?: Array<any>

	/**
	 * The regex expression that will be run against this property's data value. If the regex doesn't match, validation fails.
	 * @author BigfootDS
	 */
	match?: RegExp|string, 

	
	/**
	 * A custom validate function that runs alongside any other constraints. The function must receive one parameter, which the document will pass in automatically - the parameter is the document's data for this property.
	 * 
	 * @author BigfootDS
	 */
	validate?: Function, 
}
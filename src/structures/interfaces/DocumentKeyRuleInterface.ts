

export interface DocumentKeyRule {
	type:  any,
	required?: boolean,
	collection?: string,
	unique?: boolean,
	default?: any,
	min?: number,
	max?: number,
	minLength?: number,
	maxLength?: number,
	invalidateOnMinMaxError?: boolean,
	padStringValue?: string,
	padArrayValue?: any,
	choices?: Array<any>
	match?: RegExp|string, // Not yet implemented
	validate?: Function, // Not yet implemented
}
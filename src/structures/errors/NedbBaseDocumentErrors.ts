export class PreValidationFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed pre-validation with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}

export class ValidationFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed validation with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}

export class ValidationFailureUnexpectedProperty extends Error {
	constructor(propertyName: string){
		super(`Document failed validation due to this unexpected property on the instance:\n${propertyName}`);
	}
}

export class ValidationFailureMissingValueForProperty extends Error {
	constructor(propertyName: string){
		super(`Document failed validation due to a lack of value assigned to this property on the instance:\n${propertyName}`);
	}
}

export class ValidationFailureValueNotInChoices extends Error {
	constructor(propertyName: string, choices: Array<any>, value: any){
		super(`Document failed validation due to a value being provided that wasn't in the document's specified allowed choices:\n${propertyName}\n${JSON.stringify(choices)}\n${value}`);
	}
}

export class ValidationFailureReferenceWithoutDatabase extends Error {
	constructor(propertyName: string){
		super(`Document failed validation since this document instance was made external to any database client, and thus the document cannot reference other documents properly. This impacts this document instance property:\n${propertyName}`);
	}
}

export class ValidationFailureMissingValueForReferencedDoc extends Error {
	constructor(key: string, value: any, rule: any, forgotToGetData: boolean){
		let failureInfo = {
			key, value, rule, forgotToGetData
		}
		super(`Document failed validation due to a lack of value assigned to this property on the instance, which should have a value of a referenced document's data:\n${JSON.stringify(failureInfo)}`);
	}
}

export class ValidationFailureMinMaxError extends Error {
	constructor(propertyName: string){
		super(`Document failed validation since the key rule for ${propertyName} uses invalidateOnMinMaxError, and the document instance's value for ${propertyName} did not respect the property's rule for min, max, minLength, or maxLength.`);
	}
}

export class PostValidationFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed post-validation with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}

export class PreSaveFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed pre-save with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}

export class SaveFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed saving with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}

export class PostSaveFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed post-save with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}

export class PreDeleteFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed pre-delete with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}

export class DeleteFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed deletion with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}

export class PostDeleteFailure extends Error {
	constructor(documentDataObject: object){
		super(`Document failed post-delete with this data in itself:\n${JSON.stringify(documentDataObject, null, 4)}`);
	}
}
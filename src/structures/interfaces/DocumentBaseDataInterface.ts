
export interface DocumentBaseData{
	[key: string]: any;
}


export interface DocumentConstructorData extends DocumentBaseData {
	_id?: string;
}

export interface DocumentObjectData extends DocumentBaseData {
	_id: string;

}


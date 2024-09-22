

export interface findOneObjectOptions {

	projection: object;

}

export interface findManyObjectsOptions {

	limit: number;

	projection: object;

}

export interface findManyDocumentsOptions {

	limit: number;

}

export interface updateOptions {

	upsert: boolean;
	
}

export interface updateManyOptions {
	
	upsert: boolean;

	limit: number;
}
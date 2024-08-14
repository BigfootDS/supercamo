const { NedbClient } = require("../../../dist");


class KickassClient extends NedbClient {
	constructor(dbName, dbDirectoryPath, collectionsList, coolFactor){
		super(dbName, dbDirectoryPath, collectionsList);

		this.coolFactor = coolFactor || 10;
	}
}

module.exports = {
	KickassClient
}
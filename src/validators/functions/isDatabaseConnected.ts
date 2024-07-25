/** @module Internal */

const SuperCamo = require("../../SuperCamo.js");


const isDatabaseConnected = (databaseName: string) => {
	return Object.keys(SuperCamo.activeClients).includes(databaseName);
}

const isDatabaseConnected_RootHelper = (databaseName: string, activeClientList: Array<string>) => {
	return Object.keys(activeClientList).includes(databaseName);
}

module.exports = {
	isDatabaseConnected,
	isDatabaseConnected_RootHelper
}
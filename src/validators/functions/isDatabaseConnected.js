/** @module Internal */

const SuperCamo = require("../../SuperCamo.js");


const isDatabaseConnected = (databaseName) => {
	return Object.keys(SuperCamo.activeClients).includes(databaseName);
}

const isDatabaseConnected_RootHelper = (databaseName, activeClientList) => {
	return Object.keys(activeClientList).includes(databaseName);
}

module.exports = {
	isDatabaseConnected,
	isDatabaseConnected_RootHelper
}
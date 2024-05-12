import SuperCamo from "../index.js"


export const isDatabaseConnected = (databaseName) => {
	return Object.keys(SuperCamo.activeClients).includes(databaseName);
}
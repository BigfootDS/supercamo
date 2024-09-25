/** @module Internal
  * @ignore 
 */


import { SuperCamo } from "../../structures/classes/SuperCamo";




export const isDatabaseConnected = (databaseName: string) => {
	return Object.keys(SuperCamo.clients).includes(databaseName);
}

export const isDatabaseConnected_RootHelper = (databaseName: string, activeClientList: Array<string>) => {
	return Object.keys(activeClientList).includes(databaseName);
}

module.exports = {
	isDatabaseConnected,
	isDatabaseConnected_RootHelper
}
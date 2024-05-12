import NedbClient from "../NedbClient.js";

export const doesExtendNedbClient = (childClass) => {
	return NedbClient.isPrototypeOf(childClass);
}
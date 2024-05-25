const SuperCamo = require("./SuperCamo.js");
const { NedbDocument, NedbClient, NedbEmbeddedDocument } = require("./structures/index.js");
const validators = require("./validators/index.js");

module.exports = SuperCamo;
module.exports.NedbClient = NedbClient;
module.exports.NedbDocument = NedbDocument;
module.exports.NedbEmbeddedDocument = NedbEmbeddedDocument;
module.exports.validators = validators;
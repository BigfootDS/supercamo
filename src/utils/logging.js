const util = require("node:util");

/**
 * The verbose logging manager for SuperCamo.
 * This supports both "verbose" and "supercamo" being included within the NODE_DEBUG environment variable. It's recommended to use one or the other, but not both.
 * 
 * For example, if you want logging from multiple packages, including SuperCamo, you may want to set NODE_DEBUG to be or include "verbose". This would enable multiple packages to log.
 * But if you only want SuperCamo to log, and not any other packages, you may want to set NODE_DEBUG to be or include "supercamo".
 * 
 * Running your app with this command would enable logging for anything that uses "verbose" in its util logger:
 * NODE_DEBUG=verbose node ./index.js	
 * 
 * Running your app with this command would enable logging for just SuperCamo, NodeJS "fs", and NodeJS "network" libraries:
 * NODE_DEBUG=supercamo,fs,network node ./index.js
 * 
 * @property {util.DebugLogger} verbose The logger that will create outputs when the NODE_DEBUG environment variable includes the comma-separated word "verbose" in it.
 * @property {util.DebugLogger} supercamo The logger that will create outputs when the NODE_DEBUG environment variable includes the comma-separated word "supercamo" in it.
 * @author BigfootDS
 */
const log = {
	verbose: util.debuglog("verbose"),
	superCamo: util.debuglog("supercamo"),
	superCamoDocument: util.debuglog("supercamo:document"),
	superCamoEmbeddedDocument: util.debuglog("supercamo:embeddeddocument"),
	superCamoBaseDocument: util.debuglog("supercamo:basedocument"),
	superCamoClient: util.debuglog("supercamo:client"),
	superCamoValidators: util.debuglog("supercamo:validators"),

}

log.verbose("Starting SuperCamo with verbose logging enabled.");
log.superCamo("Starting SuperCamo with SuperCamo-specific verbose logging enabled.");
log.superCamoDocument("Starting SuperCamo with SuperCamo 'Document-specific verbose logging enabled.");
log.superCamoEmbeddedDocument("Starting SuperCamo with SuperCamo 'Embedded Document'-specific verbose logging enabled.");
log.superCamoBaseDocument("Starting SuperCamo with SuperCamo 'Base Document'-specific verbose logging enabled.");
log.superCamoClient("Starting SuperCamo with SuperCamo client-specific verbose logging enabled.");
log.superCamoValidators("Starting SuperCamo with SuperCamo validator-specific verbose logging enabled.");


/**
 * Configured logging system for the SuperCamo package.
 * 
 * Pass a string to this, and it'll automatically figure out which NodeJS util.DebugLogger to use.
 * @author BigfootDS
 *
 * @param {String} message The string to log.
 * @param {("Client"|"BaseDocument"|"Document"|"EmbeddedDocument"|"Validators"|"")} caller Specific string to help with conditional logging, eg. "Client" to allow the SuperCamoClient logger to log. Defaults to "", which will allow the SuperCamo catch-all logger and Verbose generic logger to log.
 */
function SuperCamoLogger(message, caller = "") {
	
	if (log.superCamo.enabled){
		log.superCamo(message);
	} else if (log.verbose.enabled){
		log.verbose(message);
	} else {
		switch (caller) {
			case "Client":
				log.superCamoClient(message);
				break;
			case "BaseDocument":
				log.superCamoBaseDocument(message);
				break;
			case "Document":
				log.superCamoDocument(message);
				break;
			case "EmbeddedDocument":
				log.superCamoEmbeddedDocument(message);
				break;
			case "Validators":
				log.superCamoValidators(message);
				break;
			default:
				break;
		}
	}
}

module.exports = SuperCamoLogger;
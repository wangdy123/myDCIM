var log4js = require('log4js');
log4js.configure("conf/log4js.json");

global.logger = {
	info : function(msg) {
		log4js.getLogger('normal').info(msg);
	},
	debug : function(msg) {
		log4js.getLogger('normal').debug(msg);
	},
	warn : function(msg) {
		log4js.getLogger('normal').warn(msg);
	},
	error : function(msg) {
		log4js.getLogger('logErr').error(msg);
	},
	accessLog : function(msg) {
		log4js.getLogger('access').debug(msg);
	}
};
module.exports = log4js;
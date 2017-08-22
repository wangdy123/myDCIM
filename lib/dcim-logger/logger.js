var log4js = require('log4js');
log4js.configure("conf/log4js.json");

function addStack(msg) {
	if (msg && !msg.stack) {
		if (typeof (msg) == typeof ({})) {
			Error.captureStackTrace(msg);
		} else {
			var obj = {};
			Error.captureStackTrace(obj);
			msg = msg + "\n" + obj.stack;
		}
	}
	return msg;
}
global.logger = {
	authLog : function(msg) {
		log4js.getLogger('authLog').info(addStack(msg));
	},
	log : function(msg) {
		log4js.getLogger('normal').info(addStack(msg));
	},
	info : function(msg) {
		log4js.getLogger('normal').info(addStack(msg));
	},
	debug : function(msg) {
		log4js.getLogger('normal').debug(addStack(msg));
	},
	warn : function(msg) {
		log4js.getLogger('normal').warn(addStack(msg));
	},
	error : function(msg) {
		log4js.getLogger('logErr').error(addStack(msg));
	},
	accessLog : function(msg) {
		log4js.getLogger('access').debug(msg);
	}
};
module.exports = log4js;
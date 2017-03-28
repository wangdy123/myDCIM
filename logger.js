var log4js = require('log4js');  
var logconfig= require('./log4js.json');  
    // 注：配置里的日志目录要先创建，才能加载配置，不然会出异常  
log4js.configure("./log4js.json");

module.exports.info=function(msg){
	log4js.getLogger('normal').info(msg);
}

module.exports.debug=function(msg){
	log4js.getLogger('normal').debug(msg);
}

module.exports.warn=function(msg){
	log4js.getLogger('normal').warn(msg);
}

module.exports.error=function(msg){
	log4js.getLogger('logErr').error(msg);
}

module.exports.accessLog=function(msg){
	log4js.getLogger('access').debug(msg);
}
module.exports.info("info data");
module.exports.debug("debug data");
module.exports.warn("warn data");
module.exports.error("error data");

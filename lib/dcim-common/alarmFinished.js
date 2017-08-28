var redis = require("dcim-redis");
function alarmFinished(alarm){
	redis.publish("alarm-finished",alarm);
}
module.exports = alarmFinished;
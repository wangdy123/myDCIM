var redis = require("dcim-redis");

function alarmAck(userName,alarm){
	redis.publish("alarm-ack",alarm);
}
module.exports = alarmAck;
var async = require("async");
var redis = require("dcim-redis");

function getRealtimeValue(nodeSignalIds, callback, waitSecond) {
	redis.mqRpc("realtimeValue", nodeSignalIds, function(err, responceBodys) {
		if (err) {
			callback(err);
		} else {
			var signalValues=[];
			responceBodys.forEach(function(item){
				signalValues=signalValues.concat(item);
			});
			callback(null,signalValues);
		}
	}, waitSecond);
}

module.exports = getRealtimeValue;
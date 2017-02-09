var redis = require("../db").redis;

module.exports.set = function(ssid, user, callback) {
	redis.hmset('ssId', ssid, JSON.stringify(user), function(err, result) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};

module.exports.get = function(ssid, callback) {
	redis.hmget('ssId', ssid, function(err, result) {
		if (err) {
			callback(err);
		} else {
			if (result && result.length > 0 && result[0]) {
				callback(null, JSON.parse(result[0]));
			} else {
				console.log(result);
				callback("not login");
			}
		}
	});
};

module.exports.remove = function(ssid, callback) {
	redis.hdel('ssId', ssid, function(err, result) {
		if (err) {
			callback(err);
		} else {
			callback();
		}
	});
};
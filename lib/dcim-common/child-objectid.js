var redis = require("dcim-redis").redis;
var dao = require('dcim-object-dao');
var db = require('dcim-db');

module.exports = function(pool, objectId, callback) {
	var key = 'object-childIds:' + objectId;
	redis.get(key, function(err, result) {
		if (err) {
			requestFromDb(pool, objectId, callback);
		} else {
			var childs = JSON.parse(result);
			if (childs) {
				callback(null, childs);
			} else {
				requestFromDb(pool, objectId, callback);
			}
		}
	});
};

function requestFromDb(pool, objectId, callback) {
	dao.getChildObjectId(pool, objectId, function(err, childIds) {
		if (err) {
			callback(err);
		} else {
			set(objectId, childIds);
			callback(null, childIds);
		}
	});
}
function set(objectId, childIds) {
	var key = 'object-childIds:' + objectId;
	redis.set(key, JSON.stringify(childIds), function(err, result) {
		if (!err) {
			redis.expire(key, 60 * 60);
		}
	});
}
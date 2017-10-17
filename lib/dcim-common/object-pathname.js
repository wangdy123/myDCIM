var redis = require("dcim-redis").redis;
var db = require('dcim-db');
var config = require("dcim-config");
module.exports = function(rootId, objectId, callback) {
	var key = 'object-pathname:' + objectId + (rootId ? ('-' + rootId) : "");
	redis.get(key, function(err, result) {
		 if (!err) {
			var pathname = result;
			if (pathname) {
				callback(null, pathname);
				return;
			}
		}
		requestFromDb(rootId, objectId, "", function(err, pathname) {
			if (!err) {
				set(key, pathname);
			}
			callback(null, pathname);
		});

	});
};

function requestFromDb(rootId, objectId, pathname, callback) {
	var sql = 'select PARENT_ID,NAME from config.OBJECT o left join config.POSITION_RELATION p on o.ID=p.ID where o.ID=?';
	db.pool.query(sql, [ objectId ], function(error, objects) {
		if (error) {
			callback(error, pathname);
			return;
		} else {
			if (objects.length <= 0) {
				callback(null, pathname);
			} else {
				if (!objects[0].PARENT_ID) {
					pathname = objects[0].NAME + pathname;
					callback(null, pathname);
					return;
				}
				pathname = "." + objects[0].NAME + pathname;
				if (!rootId || objectId !== rootId) {
					requestFromDb(rootId, objects[0].PARENT_ID, pathname, callback);
				}
			}
		}
	});
}
function set(key, pathname) {
	redis.set(key, pathname, function(err, result) {
		if (!err) {
			redis.expire(key, 60 * 60);
		}
	});
}
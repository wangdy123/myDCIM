var async = require("async");
var config = require("dcim-config");
var getChildObjectId = require("./child-objectid");

function getRoomCount(pool, id, callback) {
	getChildObjectId(pool, id, function(err, childIds) {
		if (err) {
			callback(err);
		} else {
			childIds.push(id);
			var sql = 'select count(o.ID) as roomCount from config.OBJECT o '
					+ ' join config.ROOM r ON o.ID=r.ID where r.ROOM_TYPE=2 and o.ID in(' + childIds.join(',') + ')';
			pool.query(sql, function(error, objects, fields) {
				if (error) {
					callback(error);
				} else {
					callback(null, objects[0].roomCount);
				}
			});
		}
	});
}
module.exports = getRoomCount;

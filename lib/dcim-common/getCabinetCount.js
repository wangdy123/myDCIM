var async = require("async");
var config = require("dcim-config");
var getChildObjectId = require("./child-objectid");

function getCabinetCount(pool, id, callback) {
	getChildObjectId(pool, id, function(err, childIds) {
		if (err) {
			callback(err);
		} else {
			childIds.push(id);
			var sql = 'select sum(r.CABINET_COUNT) as cabinetCount from config.OBJECT o '
					+ ' join config.ROOM r ON o.ID=r.ID where o.ID in(' + childIds.join(',') + ')';
			pool.query(sql, function(error, objects, fields) {
				if (error) {
					callback(error);
				} else {
					callback(null, objects[0].cabinetCount);
				}
			});
		}
	});
}

module.exports = getCabinetCount;
var async = require("async");
var config = require("dcim-config");
var getChildObjectId = require("./child-objectid");

function getBuildingCount(pool, id, callback) {
	getChildObjectId(pool, id, function(err, childIds) {
		if (err) {
			callback(err);
		} else {
			childIds.push(id);
			var sql = 'select count(ID) as buildingCount from config.OBJECT where OBJECT_TYPE=? and ID in('
					+ childIds.join(',') + ')';
			pool.query(sql, [ config.objectTypeDef.BUILDDING ], function(error, objects, fields) {
				if (error) {
					callback(error);
				} else {
					callback(null, objects[0].buildingCount);
				}
			});
		}
	});
}

module.exports = getBuildingCount;

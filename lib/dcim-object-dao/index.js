module.exports.region = require('./region');
module.exports.station = require('./station');
module.exports.building = require('./building');
module.exports.floor = require('./floor');
module.exports.room = require('./room');
module.exports.cabinetGroup = require('./cabinet-group');
module.exports.cabinet = require('./cabinet');
module.exports.device = require('./device');

module.exports.objectExt = require('./object-ext');
var async = require("async");

function getChildObjectId(pool, parentId, callback) {
	var sql = 'select ID from config.POSITION_RELATION where PARENT_ID=?';
	pool.query(sql, [ parentId ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		var tasks = [];
		function addTask(id) {
			tasks.push(function(cb) {
				getChildObjectId(pool, id, cb);
			});
		}
		for (var i = 0; i < objects.length; i++) {
			addTask(objects[i].ID);
		}
		async.parallel(tasks, function(err, results) {
			if (err) {
				callback(err);
			} else {
				childIds = [];
				objects.forEach(function(item) {
					childIds.push(item.ID);
				});
				results.forEach(function(ids) {
					childIds = childIds.concat(ids);
				});
				callback(null, childIds);
			}
		});
	});
}

module.exports.getChildObjectId = getChildObjectId;

module.exports.region = require('./region');
module.exports.station = require('./station');
module.exports.building = require('./building');
module.exports.floor = require('./floor');
module.exports.room = require('./room');
module.exports.rackGroup = require('./rack-group');
module.exports.device = require('./device');
module.exports.signal = require('./signal');

module.exports.objectExt = require('./object-ext');
var async = require("async");
var config = require('dcim-config');

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

module.exports.node={};
module.exports.node.createInsertTask = function(connection, tasks, obj) {
	tasks.push(function(callback) {
		var sql = 'INSERT INTO config.OBJECT(NAME,CODE,OBJECT_TYPE)values(?,?,?)';
		connection.query(sql, [ obj.NAME, obj.CODE, obj.OBJECT_TYPE ], function(err, result) {
			if (err) {
				callback(err);
			} else {
				callback(null, result.insertId);
			}
		});
	});
	tasks.push(function(nodeId, callback) {
		var sql = 'INSERT INTO config.POSITION_RELATION(ID,PARENT_ID)values(?,?)';
		connection.query(sql, [ nodeId, obj.PARENT_ID ], function(err, result) {
			if (err) {
				callback(err);
			} else {
				callback(null, nodeId);
			}
		});
	});
	var namespace = config.objectTypes[obj.OBJECT_TYPE].namespace;
	module.exports[namespace].createInsertTasks(connection, tasks, obj);
	module.exports.objectExt.createInsertTasks(connection, tasks, obj.params);
};

module.exports.node.createUpdateTask = function(connection, tasks, obj) {
	tasks.push(function(callback) {
		var sql = 'update config.OBJECT set NAME=?,CODE=? where ID=?';
		connection.query(sql, [ obj.NAME, obj.CODE, obj.ID ], function(err, result) {
			if (err) {
				callback(err);
			} else {
				callback(null, obj.ID);
			}
		});
	});
	var namespace = config.objectTypes[obj.OBJECT_TYPE].namespace;
	module.exports[namespace].createUpdateTasks(connection, tasks, obj);
	module.exports.objectExt.createDeleteTasks(connection, tasks, obj.ID);
	module.exports.objectExt.createInsertTasks(connection, tasks, obj.params);
};

module.exports.node.createDeleteTask = function(connection, tasks, obj) {
	var namespace = config.objectTypes[obj.OBJECT_TYPE].namespace;
	module.exports[namespace].createDeleteTasks(connection, tasks, obj.ID);

	tasks.push(function(cb) {
		var sql = 'delete from config.OBJECT_EXT where ID=?';
		connection.query(sql, [ obj.ID ], function(err, result) {
			cb(err);
		});
	});
	tasks.push(function(cb) {

		var sql = 'delete from config.POSITION_RELATION where ID=?';
		connection.query(sql, [ obj.ID ], function(err, result) {
			cb(err);
		});
	});
	tasks.push(function(cb) {
		var sql = 'delete from config.OBJECT where ID=?';
		connection.query(sql, [ obj.ID ], function(err, result) {
			cb(err);
		});
	});
};

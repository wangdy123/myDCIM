var config = require('dcim-config');

module.exports.setObjectExtsToObjects = function(objectExts, objects) {
	objectExts.forEach(function(ext) {
		for (var i = 0; i < objects.length; i++) {
			if (objects[i].ID == ext.ID) {
				if (!objects[i].params) {
					objects[i].params = {};
				}
				objects[i].params[ext.PROP_NAME] = ext.PROP_VALUE;
			}
		}
	});
};

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.PROP_NAME,o.PROP_VALUE from config.OBJECT_EXT o '
			+ 'join config.POSITION_RELATION p on o.ID=p.ID where p.PARENT_ID=?';
	pool.query(sql, [ parentId ], function(error, objectExts) {
		if (error) {
			callback(error);
		} else {
			callback(error, objectExts);
		}
	});
};

module.exports.getByObjectId = function(pool, id, callback) {
	var sql = 'select PROP_NAME,PROP_VALUE from config.OBJECT_EXT where ID=?';
	pool.query(sql, [ id ], function(error, objectExts, fields) {
		if (error) {
			callback(error);
		} else {
			var params = {};
			objectExts.forEach(function(ext) {
				params[ext.PROP_NAME] = ext.PROP_VALUE;
			});
			callback(error, params);
		}
	});
};

function createObjectExtTask(connection, key, value) {
	return function(objectId, callback) {
		var sql = 'INSERT INTO config.OBJECT_EXT(ID,PROP_NAME,PROP_VALUE)values(?,?,?)';
		connection.query(sql, [ objectId, key, value], function(err, result) {
			callback(err, objectId);
		});
	};
}

module.exports.createInsertTasks = function(connection, tasks, params) {
	for (key in params) {
		tasks.push(createObjectExtTask(connection, key, params[key]));
	}
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(objectId, callback) {
		var sql = 'delete from config.OBJECT_EXT where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err, objectId);
		});
	});
};

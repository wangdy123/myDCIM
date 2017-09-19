var objectExt = require('./object-ext');
var objectTypeDef = require('dcim-config').objectTypeDef;

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,g.RACK_COUNT,'
			+ 'g.RACK_DEPTH from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.RACK_GROUP g on o.ID=g.ID where p.PARENT_ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ parentId,objectTypeDef.RACK_GROUP ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		objectExt.getByPositionParent(pool, parentId, function(error, objectExts) {
			if (error) {
				callback(error);
				return;
			}
			objectExt.setObjectExtsToObjects(objectExts, objects);
			callback(error, objects);
		});
	});
};

module.exports.getById = function(pool, id, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,g.RACK_COUNT,'
			+ 'g.RACK_DEPTH from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.RACK_GROUP g on o.ID=g.ID where o.ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ id,objectTypeDef.RACK_GROUP  ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found RACKGroup:" + id);
			return;
		}
		objectExt.getByObjectId(pool, id, function(error, params) {
			if (error) {
				callback(error);
				return;
			}
			objects[0].params = params;
			callback(error, objects[0]);
		});
	});
};

module.exports.createInsertTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'INSERT INTO config.RACK_GROUP(ID,RACK_COUNT,RACK_DEPTH)values(?,?,?)';
		connection.query(sql, [ objectId, obj.RACK_COUNT, obj.RACK_DEPTH ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'REPLACE INTO config.RACK_GROUP(ID,RACK_COUNT,RACK_DEPTH)values(?,?,?)';
		connection.query(sql, [ objectId, obj.RACK_COUNT, obj.RACK_DEPTH ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.RACK_GROUP where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err);
		});
	});
};

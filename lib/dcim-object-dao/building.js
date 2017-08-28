var objectExt = require('./object-ext');
var objectTypeDef = require('dcim-config').objectTypeDef;

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,b.FLOOR_UNDERGROUND,b.FLOOR_GROUND,'
			+ 'b.DESCRIPTION from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.BUILDING b on o.ID=b.ID where p.PARENT_ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ parentId, objectTypeDef.BUILDDING ], function(error, objects, fields) {
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
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,b.FLOOR_UNDERGROUND,b.FLOOR_GROUND,'
			+ 'b.DESCRIPTION from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.BUILDING b on o.ID=b.ID where o.ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ id, objectTypeDef.BUILDDING ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found building:" + id);
			return;
		}
		objectExt.getByObjectId(pool, id, function(error, objectExts) {
			if (error) {
				callback(error);
				return;
			}
			objects[0].properties = objectExts;
			callback(error, objects[0]);
		});
	});
};

module.exports.createInsertTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'INSERT INTO config.BUILDING(ID,FLOOR_UNDERGROUND,FLOOR_GROUND,DESCRIPTION)' + 'values(?,?,?,?)';
		connection.query(sql, [ objectId, obj.FLOOR_UNDERGROUND, obj.FLOOR_GROUND, obj.DESCRIPTION ], function(err,
				result) {
			callback(err, objectId);
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'REPLACE INTO config.BUILDING(ID,FLOOR_UNDERGROUND,FLOOR_GROUND,DESCRIPTION)' + 'values(?,?,?,?)';
		connection.query(sql, [ objectId, obj.FLOOR_UNDERGROUND, obj.FLOOR_GROUND, obj.DESCRIPTION ], function(err,
				result) {
			callback(err, objectId);
		});
	});
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.BUILDING where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err);
		});
	});
};

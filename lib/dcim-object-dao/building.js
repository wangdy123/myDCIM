var objectExt = require('./object-ext');

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.OBJECT_TYPE,p.PARENT_ID,b.CODE,b.FLOOR_UNDERGROUND,b.FLOOR_GROUND,'
			+ 'b.DESCRIPTION from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'join config.BUILDING b on o.ID=b.ID where p.PARENT_ID=?';
	pool.query(sql, [ parentId ], function(error, objects, fields) {
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
	var sql = 'select o.ID,o.NAME,o.OBJECT_TYPE,p.PARENT_ID,b.CODE,b.FLOOR_UNDERGROUND,b.FLOOR_GROUND,'
			+ 'b.DESCRIPTION from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'join config.BUILDING b on o.ID=b.ID where o.ID=?';
	pool.query(sql, [ id ], function(error, objects, fields) {
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
		var sql = 'INSERT INTO config.BUILDING(ID,CODE,FLOOR_UNDERGROUND,FLOOR_GROUND,DESCRIPTION)'
				+ 'values(?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.CODE, obj.FLOOR_UNDERGROUND, obj.FLOOR_GROUND, obj.DESCRIPTION ],
				function(err, result) {
					callback(err, objectId);
				});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'update config.BUILDING set CODE=?,FLOOR_UNDERGROUND=?,FLOOR_GROUND=?,DESCRIPTION=? where ID=?';
		connection.query(sql, [ obj.CODE, obj.FLOOR_UNDERGROUND, obj.FLOOR_GROUND, obj.DESCRIPTION, objectId ],
				function(err, result) {
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

var objectExt = require('./object-ext');

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,g.CABINET_COUNT,'
			+ 'g.CABINET_DEPTH from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'join config.CABINET_GROUP g on o.ID=g.ID where p.PARENT_ID=?';
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
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,g.CABINET_COUNT,'
			+ 'g.CABINET_DEPTH from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'join config.CABINET_GROUP g on o.ID=g.ID where o.ID=?';
	pool.query(sql, [ id ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found cabinetGroup:" + id);
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
		var sql = 'INSERT INTO config.CABINET_GROUP(ID,CABINET_COUNT,CABINET_DEPTH)values(?,?,?)';
		connection.query(sql, [ objectId, obj.CABINET_COUNT, obj.CABINET_DEPTH ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'update config.CABINET_GROUP set CABINET_COUNT=?,CABINET_DEPTH=? where ID=?';
		connection.query(sql, [ obj.CABINET_COUNT, obj.CABINET_DEPTH, objectId ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.CABINET_GROUP where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err);
		});
	});
};

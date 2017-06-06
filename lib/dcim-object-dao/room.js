var objectExt = require('./object-ext');

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.OBJECT_TYPE,p.PARENT_ID,r.CODE,r.ROOM_TYPE,'
			+ 'r.DESCRIPTION from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'join config.ROOM r on o.ID=r.ID where p.PARENT_ID=?';
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
	var sql = 'select o.ID,o.NAME,o.OBJECT_TYPE,p.PARENT_ID,r.CODE,r.ROOM_TYPE,'
			+ 'r.DESCRIPTION from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'join config.ROOM r on o.ID=r.ID where o.ID=?';
	pool.query(sql, [ id ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found room:" + id);
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
		var sql = 'INSERT INTO config.ROOM(ID,CODE,ROOM_TYPE,DESCRIPTION)values(?,?,?,?)';
		connection.query(sql, [ objectId, obj.CODE, obj.ROOM_TYPE, obj.DESCRIPTION ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'update config.ROOM set CODE=?,ROOM_TYPE=?,DESCRIPTION=? where ID=?';
		connection.query(sql, [ obj.CODE, obj.ROOM_TYPE, obj.DESCRIPTION, objectId ],
				function(err, result) {
					callback(err, objectId);
				});
	});
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.ROOM where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err);
		});
	});
};

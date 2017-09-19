var objectExt = require('./object-ext');
var objectTypeDef = require('dcim-config').objectTypeDef;

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,r.ROOM_TYPE,r.CABINET_COUNT,r.SAFETY_PERSON,r.DEPARTMENT,'
			+ 'r.DESCRIPTION from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.ROOM r on o.ID=r.ID where p.PARENT_ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ parentId, objectTypeDef.ROOM ], function(error, objects, fields) {
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
	var sql = 'select o.ID,o.NAME,o.OBJECT_TYPE,o.CODE,p.PARENT_ID,r.ROOM_TYPE,r.CABINET_COUNT,r.SAFETY_PERSON,r.DEPARTMENT,'
			+ 'r.DESCRIPTION from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.ROOM r on o.ID=r.ID where o.ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ id, objectTypeDef.ROOM ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found room:" + id);
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
		var sql = 'INSERT INTO config.ROOM(ID,ROOM_TYPE,DESCRIPTION,CABINET_COUNT,SAFETY_PERSON,DEPARTMENT)'
				+ 'values(?,?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.ROOM_TYPE, obj.DESCRIPTION, obj.CABINET_COUNT, obj.SAFETY_PERSON,
				obj.DEPARTMENT ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'REPLACE INTO config.ROOM(ID,ROOM_TYPE,DESCRIPTION,CABINET_COUNT,SAFETY_PERSON,DEPARTMENT)'
				+ 'values(?,?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.ROOM_TYPE, obj.DESCRIPTION, obj.CABINET_COUNT, obj.SAFETY_PERSON,
				obj.DEPARTMENT ], function(err, result) {
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

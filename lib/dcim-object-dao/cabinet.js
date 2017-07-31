var objectExt = require('./object-ext');
var objectTypeDef = require('dcim-config').objectTypeDef;

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,c.CABINET_MODEL,c.SEQUENCE,c.CABINET_DEPTH,'
			+ 'c.START_USE_DATE,c.EXPECT_END_DATE from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.CABINET c on o.ID=c.ID where p.PARENT_ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ parentId,objectTypeDef.CABINNET  ], function(error, objects, fields) {
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
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,c.CABINET_MODEL,c.SEQUENCE,'
			+ 'c.CABINET_DEPTH,c.START_USE_DATE,c.EXPECT_END_DATE from config.OBJECT o '
			+ 'left join config.POSITION_RELATION p on o.ID=p.ID join config.CABINET c on o.ID=c.ID '
			+'where o.ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ id ,objectTypeDef.CABINNET], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found cabinet:" + id);
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
		var sql = 'INSERT INTO config.CABINET(ID,CABINET_MODEL,SEQUENCE,CABINET_DEPTH,'
				+ 'START_USE_DATE,EXPECT_END_DATE) values(?,?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.CABINET_MODEL, obj.SEQUENCE, obj.CABINET_DEPTH, obj.START_USE_DATE,
				obj.EXPECT_END_DATE ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'update config.CABINET set CABINET_MODEL=?,SEQUENCE=?,CABINET_DEPTH=?,'
				+ 'START_USE_DATE=?,EXPECT_END_DATE=? where ID=?';
		connection.query(sql, [ obj.CABINET_MODEL, obj.SEQUENCE, obj.CABINET_DEPTH, obj.START_USE_DATE,
				obj.EXPECT_END_DATE, objectId ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.CABINET where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err);
		});
	});
};

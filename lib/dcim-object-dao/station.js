var objectExt = require('./object-ext');
var objectTypeDef = require('dcim-config').objectTypeDef;

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,s.STATION_TYPE,s.ADDRESS,s.DESCRIPTION,'
			+ 's.LONGITUDE,s.LATITUDE,s.AREA from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.STATION_BASE s on o.ID=s.ID where p.PARENT_ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ parentId, objectTypeDef.STATION_BASE ], function(error, objects, fields) {
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
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,s.STATION_TYPE,s.ADDRESS,s.DESCRIPTION,'
			+ 's.LONGITUDE,s.LATITUDE,s.AREA from config.OBJECT o left join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.STATION_BASE s on o.ID=s.ID where o.ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ id, objectTypeDef.STATION_BASE ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found station:" + id);
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
		var sql = 'INSERT INTO config.STATION_BASE(ID,STATION_TYPE,ADDRESS,DESCRIPTION,'
				+ 'LONGITUDE,LATITUDE,AREA)values(?,?,?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.STATION_TYPE, obj.ADDRESS, obj.DESCRIPTION, obj.LONGITUDE, obj.LATITUDE,
				obj.AREA ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'REPLACE INTO config.STATION_BASE(ID,STATION_TYPE,ADDRESS,DESCRIPTION,'
				+ 'LONGITUDE,LATITUDE,AREA)values(?,?,?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.STATION_TYPE, obj.ADDRESS, obj.DESCRIPTION, obj.LONGITUDE, obj.LATITUDE,
				obj.AREA ], function(err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.STATION_BASE where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err);
		});
	});
};

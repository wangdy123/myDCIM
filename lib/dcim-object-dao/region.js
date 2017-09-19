var objectExt = require('./object-ext');
var objectTypeDef = require('dcim-config').objectTypeDef;

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,a.REGION_TYPE,a.ABBREVIATION,'
			+ 'a.LONGITUDE,a.LATITUDE from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.ADMINISTRATIVE_REGION a on o.ID=a.ID where p.PARENT_ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ parentId,objectTypeDef.REGION ], function(error, objects, fields) {
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
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,a.REGION_TYPE,a.ABBREVIATION,'
			+ 'a.LONGITUDE,a.LATITUDE from config.OBJECT o left join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.ADMINISTRATIVE_REGION a on o.ID=a.ID where o.ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ id,objectTypeDef.REGION ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found region:" + id);
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

module.exports.createInsertTasks = function(connection, tasks, region) {
	tasks.push(function(regionId, callback) {
		var sql = 'INSERT INTO config.ADMINISTRATIVE_REGION(ID,REGION_TYPE,ABBREVIATION,'
				+ 'LONGITUDE,LATITUDE)values(?,?,?,?,?)';
		connection.query(sql, [ regionId, region.REGION_TYPE, region.ABBREVIATION, region.LONGITUDE, region.LATITUDE ],
				function(err, result) {
					callback(err, regionId);
				});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, region) {
	tasks.push(function(regionId, callback) {
		var sql = 'REPLACE INTO config.ADMINISTRATIVE_REGION(ID,REGION_TYPE,ABBREVIATION,'
				+ 'LONGITUDE,LATITUDE)values(?,?,?,?,?)';
		connection.query(sql, [ regionId, region.REGION_TYPE, region.ABBREVIATION, region.LONGITUDE, region.LATITUDE ],
				function(err, result) {
					callback(err, regionId);
				});
	});
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.ADMINISTRATIVE_REGION where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err);
		});
	});
};

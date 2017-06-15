var objectExt = require('./object-ext');
var util = require('dcim-util');

module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,d.VENDER,d.MODEL,d.BUSINESS_TYPE,d.DEVICE_TYPE,d.DESCRIPTION,'
			+ 'd.START_USE_DATE,d.EXPECT_END_DATE from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'join config.DEVICE d on o.ID=d.ID where p.PARENT_ID=?';
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
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,d.VENDER,d.MODEL,d.BUSINESS_TYPE,d.DEVICE_TYPE,d.DESCRIPTION,'
			+ 'd.START_USE_DATE,d.EXPECT_END_DATE from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'join config.DEVICE d on o.ID=d.ID  where o.ID=?';
	pool.query(sql, [ id ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found device:" + id);
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
		var sql = 'INSERT INTO config.DEVICE(ID,VENDER,MODEL,BUSINESS_TYPE,DEVICE_TYPE,DESCRIPTION,'
				+ 'START_USE_DATE,EXPECT_END_DATE) values(?,?,?,?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.VENDER, obj.MODEL, obj.BUSINESS_TYPE, obj.DEVICE_TYPE,
				obj.DESCRIPTION, util.date_parse(obj.START_USE_DATE), util.date_parse(obj.EXPECT_END_DATE) ], function(
				err, result) {
			callback(err, objectId);
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'update config.DEVICE set VENDER=?,MODEL=?,BUSINESS_TYPE=?,DEVICE_TYPE=?,DESCRIPTION=?,'
				+ 'START_USE_DATE=?,EXPECT_END_DATE=? where ID=?';
		connection.query(sql, [ obj.VENDER, obj.MODEL, obj.BUSINESS_TYPE, obj.DEVICE_TYPE, obj.DESCRIPTION,
				util.date_parse(obj.START_USE_DATE), util.date_parse(obj.EXPECT_END_DATE), objectId ], function(err,
				result) {
			callback(err, objectId);
		});
	});
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(callback) {
		var sql = 'delete from config.DEVICE where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err);
		});
	});
};

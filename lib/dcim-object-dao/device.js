var objectExt = require('./object-ext');
var util = require('dcim-util');
var objectTypeDef = require('dcim-config').objectTypeDef;
var async = require("async");
var signalDao = require('./signal');

function transform(objects) {
	objects.forEach(function(item) {
		item.START_USE_DATE = util.timeformat_t(item.START_USE_DATE);
		item.EXPECT_END_DATE = util.timeformat_t(item.EXPECT_END_DATE);
	});
}
module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,d.VENDER,d.MODEL,d.BUSINESS_TYPE,d.DEVICE_TYPE,d.DESCRIPTION,'
			+ 'd.START_USE_DATE,d.EXPECT_END_DATE from config.OBJECT o join config.POSITION_RELATION p on o.ID=p.ID '
			+ 'left join config.DEVICE d on o.ID=d.ID where p.PARENT_ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ parentId, objectTypeDef.DEVICE ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		transform(objects);
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
			+ 'left join config.DEVICE d on o.ID=d.ID  where o.ID=? and o.OBJECT_TYPE=?';
	pool.query(sql, [ id, objectTypeDef.DEVICE ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found device:" + id);
			return;
		}
		transform(objects);
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

function createSignal(defaultSignal, deviceId, seq) {
	seq = seq ? seq : 0;
	signal = util.deepClone(defaultSignal);
	signal.OBJECT_ID = deviceId;
	signal.SIGNAL_NAME=signal.SIGNAL_NAME.replace('XX', (seq+1));
	signal.SIGNAL_ID = signal.SIGNAL_ID + seq;
	return signal;
}

function getPropertyValue(properties, name) {
	var item = util.findFromArray(properties, "PRO_NAME", name);
	if (item) {
		return item.PRO_VALUE;
	}
};

var path = require('path');
var fs = require('fs');

module.exports.createInsertTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'INSERT INTO config.DEVICE(ID,VENDER,MODEL,BUSINESS_TYPE,DEVICE_TYPE,DESCRIPTION,'
				+ 'START_USE_DATE,EXPECT_END_DATE) values(?,?,?,?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.VENDER, obj.MODEL, obj.BUSINESS_TYPE, obj.DEVICE_TYPE, obj.DESCRIPTION,
				util.date_parse(obj.START_USE_DATE), util.date_parse(obj.EXPECT_END_DATE) ], function(err, result) {
			callback(err, objectId);
		});
	});
	tasks.push(function(objectId, callback) {
		var fileName = path.join(process.cwd(), 'conf', 'signal', obj.DEVICE_TYPE + '.json');
		fs.readFile(fileName, function(err, data) {
			if (err) {
				callback(err);
				return;
			}
			try {
				var defaultSignals = JSON.parse(data);
				var signalTasks = [];
				for (group in defaultSignals) {
					if (group == "defaults") {
						defaultSignals["defaults"].forEach(function(item) {
							signalDao.createInsertTasks(connection, signalTasks, createSignal(item, objectId));
						});
					} else {
						var count = parseInt(getPropertyValue(obj.properties, group), 10);
						if (!isNaN(count)) {
							for (var i = 0; i < count; i++) {
								defaultSignals[group].forEach(function(item) {
									signalDao.createInsertTasks(connection, signalTasks,
											createSignal(item, objectId, i));
								});
							}
						}
					}
				}
				async.parallel(signalTasks, function(err, result) {
					callback(err, objectId);
				});
			} catch (err) {
				callback(err);
			}
		});
	});
};

module.exports.createUpdateTasks = function(connection, tasks, obj) {
	tasks.push(function(objectId, callback) {
		var sql = 'REPLACE INTO config.DEVICE(ID,VENDER,MODEL,BUSINESS_TYPE,DEVICE_TYPE,DESCRIPTION,'
				+ 'START_USE_DATE,EXPECT_END_DATE) values(?,?,?,?,?,?,?,?)';
		connection.query(sql, [ objectId, obj.VENDER, obj.MODEL, obj.BUSINESS_TYPE, obj.DEVICE_TYPE, obj.DESCRIPTION,
				util.date_parse(obj.START_USE_DATE), util.date_parse(obj.EXPECT_END_DATE) ], function(err, result) {
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

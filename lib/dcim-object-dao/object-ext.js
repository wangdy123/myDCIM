var config = require('dcim-config');

function canvertValue(prop) {
	try {
		switch (prop.VALUE_TYPE) {
		case config.object_ex.typeDef.int:
		case config.object_ex.typeDef.bool:
		case config.object_ex.typeDef.option:
			prop.PRO_VALUE = parseInt(prop.PRO_VALUE, 10);
			break;
		case config.object_ex.typeDef.float:
			prop.PRO_VALUE = parseFloat(prop.PRO_VALUE);
			break;
		}
	} catch (e) {
		logger.error(e);
	}
	return prop;
}
module.exports.getByPositionParent = function(pool, parentId, callback) {
	var sql = 'select o.ID,o.PRO_NAME,o.PRO_VALUE,o.VALUE_TYPE from config.OBJECT_EXT o '
			+ 'join config.POSITION_RELATION p on o.ID=p.ID where p.PARENT_ID=?';
	pool.query(sql, [ parentId ], function(error, objectExts, fields) {
		if (error) {
			callback(error);
		} else {
			for (var i = 0; i < objectExts.length; i++) {
				objectExts[i] = canvertValue(objectExts[i]);
			}
			callback(error, objectExts);
		}
	});
};

module.exports.getByObjectId = function(pool, id, callback) {
	var sql = 'select PRO_NAME,PRO_VALUE,VALUE_TYPE from config.OBJECT_EXT where ID=?';
	pool.query(sql, [ id ], function(error, objectExts, fields) {
		if (error) {
			callback(error);
		} else {
			for (var i = 0; i < objectExts.length; i++) {
				objectExts[i] = canvertValue(objectExts[i]);
			}
			callback(error, objectExts);
		}
	});
};

function createObjectExtTask(connection, property) {
	return function(roleId, callback) {
		var sql = 'INSERT INTO config.OBJECT_EXT(ID,PRO_NAME,PRO_VALUE,VALUE_TYPE)values(?,?,?,?)';
		connection.query(sql, [ regionId, property.PRO_NAME, property.PRO_VALUE, property.VALUE_TYPE ], function(err,
				result) {
			callback(err, roleId);
		});
	};
}

module.exports.createInsertTasks = function(connection, tasks, properties) {
	for (var i = 0; i < properties.length; i++) {
		tasks.push(createObjectExtTask(connection, properties[i]));
	}
};

module.exports.createDeleteTasks = function(connection, tasks, objectId) {
	tasks.push(function(regionId, callback) {
		var sql = 'delete from config.OBJECT_EXT where ID=?';
		connection.query(sql, [ objectId ], function(err, result) {
			callback(err, objectId);
		});
	});
};

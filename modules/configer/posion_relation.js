module.exports.createObject = function(chain, object, cbk) {
	chain.query('INSERT INTO config.OBJECT(NAME)values(?)', [ object.NAME ]).on('result', function(result) {
		var ID = result.insertId;
		cbk(ID);
	});
}

module.exports.updateObject = function(chain, object, cbk) {
	chain.query('update config.OBJECT set NAME=? where ID=?', [ object.NAME, object.ID ]).on('result',
			function(result) {
				cbk();
			});
}
module.exports.deleteObject = function(chain, OBJECT_ID, cbk) {
	chain.query('DELETE FROM config.OBJECT WHERE ID=?', [ OBJECT_ID ]).on('result', function(result) {
		cbk();
	});
}
module.exports.updatePosionRelation = function(chain, object, cbk) {
	var sql = 'update config.POSITION_RELATION set PARENT_ID=? WHERE ID=?';
	chain.query(sql, [ object.PARENT_ID, object.ID ]).on('result', function(result) {
		cbk();
	});
}

module.exports.insertPosionRelation = function(chain, object, cbk) {
	var sql = 'INSERT INTO config.POSITION_RELATION(ID,OBJECT_TYPE,PARENT_ID)values(?,?,?)';
	chain.query(sql, [ object.ID, object.OBJECT_TYPE, object.PARENT_ID ]).on('result', function(result) {
		cbk();
	});
}

module.exports.deletePosionRelation = function(chain, OBJECT_ID, cbk) {
	var sql = 'DELETE FROM config.POSITION_RELATION WHERE ID=?';
	chain.query(sql, [ OBJECT_ID ]).on('result', function(result) {
		cbk();
	});
}

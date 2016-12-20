var app = require('./app');

var db = require('../db');

var baseSql = "select p.ID,a.NAME,p.OBJECT_TYPE,p.PARENT_ID,a.LONGITUDE,a.LATITUDE from "
		+ "(select ID,NAME,LONGITUDE,LATITUDE FROM ADMINISTRATIVE_REGION UNION "
		+ "select ID,NAME,LONGITUDE,LATITUDE FROM STATION_BASE) a left join config.POSITION_RELATION p on a.ID=p.ID ";
function getChildLocations(pool, id, cbk) {
	var sql = baseSql + ' where p.PARENT_ID=?';
	pool.query(sql, [ id ], function(error, objects, fields) {
		if (error) {
			cbk(error);
		} else {
			cbk(null, objects);
		}
	});
}
app.get('/objectLocations', function(req, res) {

	var pool = db.pool;
	var sql = baseSql + ' where p.PARENT_ID=0 or p.PARENT_ID is NULL';
	pool.query(sql,  function(error, objects, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			if (objects.length <= 0) {
				console.log("not found");
				res.status(404).send("not found");
			} else {
				object = objects[0];
				getChildLocations(pool, object.ID, function(error, childLocations) {
					if (error) {
						console.log(error);
						res.status(501).send(error);
					} else {
						object.childLocations = childLocations;
						res.send(object);
					}
				});
			}
		}
	});
});

app.get('/objectLocations/:id', function(req, res) {
	var pool = db.pool;
	var sql = baseSql + ' where p.ID=?';
	pool.query(sql, [ req.params.id ], function(error, objects, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			if (objects.length <= 0) {
				console.log("not found");
				res.status(404).send("not found");
			} else {
				object = objects[0];
				getChildLocations(pool, object.ID, function(error, childLocations) {
					if (error) {
						console.log(error);
						res.status(501).send(error);
					} else {
						object.childLocations = childLocations;
						res.send(object);
					}
				});
			}
		}
	});
});
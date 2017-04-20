var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var config = require('dcim-config');

var baseSql = "select o.ID,o.NAME,o.OBJECT_TYPE,p.PARENT_ID,a.REGION_TYPE,a.LONGITUDE,a.LATITUDE from "
		+ "(select ID,REGION_TYPE,LONGITUDE,LATITUDE FROM config.ADMINISTRATIVE_REGION UNION "
		+ "select ID,null as REGION_TYPE,LONGITUDE,LATITUDE FROM STATION_BASE) a join config.OBJECT o on a.ID=o.ID "
		+ "left join config.POSITION_RELATION p on a.ID=p.ID ";
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
	var sql = baseSql + ' where a.ID=?';
	pool.query(sql, [ config.config.root_object_id ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			if (objects.length <= 0) {
				logger.error("not found");
				res.status(404).send("not found");
			} else {
				object = objects[0];
				getChildLocations(pool, object.ID, function(error, childLocations) {
					if (error) {
						logger.error(error);
						res.status(500).send(error);
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
	var sql = baseSql + ' where a.ID=?';
	pool.query(sql, [ req.params.id ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			if (objects.length <= 0) {
				logger.error("not found");
				res.status(404).send("not found");
			} else {
				object = objects[0];
				getChildLocations(pool, object.ID, function(error, childLocations) {
					if (error) {
						logger.error(error);
						res.status(500).send(error);
					} else {
						object.childLocations = childLocations;
						res.send(object);
					}
				});
			}
		}
	});
});

app.put('/objectLocations/:id', function(req, res) {
	var location = req.body;
	db.doTransaction(function(connection) {
		var tasks = [];
		if (location.OBJECT_TYPE === config.objectTypeDef.REGION) {
			tasks.push(function(callback) {
				var sql = 'update config.ADMINISTRATIVE_REGION set LONGITUDE=?,LATITUDE=? where ID=?';
				connection.query(sql, [ location.LONGITUDE, location.LATITUDE, req.params.id ], function(err, result) {
					if (err) {
						callback(err);
					} else {
						callback();
					}
				});
			});
		} else if (location.OBJECT_TYPE === config.objectTypeDef.STATION_BASE) {
			tasks.push(function(callback) {
				var sql = 'update config.STATION_BASE set LONGITUDE=?,LATITUDE=? where ID=?';
				connection.query(sql, [ location.LONGITUDE, location.LATITUDE, req.params.id ], function(err, result) {
					if (err) {
						callback(err);
					} else {
						callback();
					}
				});
			});
		} else {
			tasks.push(function(callback) {
				callback("wrong object type");
			});
		}
		return tasks;
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
		}
	});
});

var mapIcon = {
	font : {
		name : require('path').join(__dirname, "fonts", "simsun.ttc"),
		family : "simsun"
	},
	image : require('path').join(__dirname, "images", "back1.png"),
	fillStyle : "red"
};

app.get('/map-icon/:fileName.png', function(req, res) {
	var Canvas = require('canvas');
	var canvas = new Canvas(80, 25);
	var ctx = canvas.getContext('2d');
	var img = new Canvas.Image();
	img.src = mapIcon.image;
	ctx.drawImage(img, 0, 0);
	ctx.addFont(mapIcon.font);
	ctx.font = 'bold 13px ' + mapIcon.font.family;
	ctx.fillStyle = mapIcon.fillStyle;
	ctx.fillText(req.params.fileName, 25, 15);

	var buf = canvas.toDataURL();
	var base64Data = buf.replace(/^data:image\/\w+;base64,/, "");
	var dataBuffer = new Buffer(base64Data, 'base64');
	res.send(dataBuffer);
});

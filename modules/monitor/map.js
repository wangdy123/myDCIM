var app = require('./app');

var db = require('dcim-db');
var util = require("dcim-util");
var config = require('dcim-config');
var async = require("async");
var common = require('dcim-common');

var baseSql = "select o.ID,o.NAME,o.CODE,o.OBJECT_TYPE,p.PARENT_ID,a.REGION_TYPE,a.LONGITUDE,a.LATITUDE from "
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

function getStatusCount(pool, object, callback) {
	var tasks = [];
	tasks.push(function(cbk) {
		common.getBuildingCount(pool, object.ID, function(err, count) {
			if (!err) {
				object.buildingCount = count ? count : 0;
			}
			cbk(err);
		});
	});
	tasks.push(function(cbk) {
		common.getRoomCount(pool, object.ID, function(err, count) {
			if (!err) {
				object.roomCount = count ? count : 0;
			}
			cbk(err);
		});
	});
	tasks.push(function(cbk) {
		common.getCabinetCount(pool, object.ID, function(err, count) {
			if (!err) {
				object.cabinetCount = count ? count : 0;
			}
			cbk(err);
		});
	});
	tasks.push(function(cbk) {
		common.getAlarmCount(pool, object.ID, function(err, status) {
			if (!err) {
				object.alarmLevel1Count = status.alarmLevel1Count;
				object.alarmLevel2Count = status.alarmLevel2Count;
				object.alarmLevel3Count = status.alarmLevel3Count;
				object.alarmLevel4Count = status.alarmLevel4Count;
			}
			cbk(err);
		});
	});
	async.parallel(tasks, function(err, results) {
		if (err) {
			logger.error(err);
		}
		callback(null, object);
	});
}

function getChildObject(pool, object, callback) {
	getStatusCount(pool, object, function(err, object) {
		if (err) {
			callback(err);
			return;
		}
		getChildLocations(pool, object.ID, function(error, childLocations) {
			if (error) {
				callback(error);
			} else {
				var tasks = [];
				childLocations.forEach(function(item) {
					tasks.push(function(cb) {
						getStatusCount(pool, item, cb);
					});
				});
				async.parallel(tasks, function(err, results) {
					if (err) {
						callback(err);
					} else {
						object.childLocations = results;
						callback(null, object);
					}
				});
			}
		});
	});
}

app.get('/objectLocations', function(req, res) {
	var pool = db.pool;
	var sql = baseSql + ' where a.ID=?';
	pool.query(sql, [ config.root_object_id ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			if (objects.length <= 0) {
				logger.error("not found");
				res.status(404).send("not found");
			} else {
				getChildObject(pool, objects[0], function(error, object) {
					if (error) {
						logger.error(error);
						res.status(500).send(error);
					} else {
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
				getChildObject(pool, objects[0], function(error, object) {
					if (error) {
						logger.error(error);
						res.status(500).send(error);
					} else {
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

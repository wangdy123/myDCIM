var db = require('dcim-db');
var util = require("dcim-util");

var app = require('./app');
var multer = require('multer');
var config = require('dcim-config').config;

var path = require('path');
var fs = require('fs');

function saveFile(name, objectType, deviceType, callback) {
	var fileName = path.join(config.temp_path, name);
	fs.readFile(fileName, function(err, data) {
		if (err) {
			callback(err);
			return;
		}
		db.doTransaction(function(connection) {
			return [ function(cbk) {
				var query = "INSERT INTO detail_page.IMG(NAME, OBJECT_TYPE,DEVICE_TYPE,IMG) VALUES (?,?,?,?)";
				connection.query(query, [ name, objectType, deviceType, data ], function(err, result) {
					if (err) {
						cbk(err);
					} else {
						cbk();
					}
				});
			} ];
		}, function(error, result) {
			callback(error)
		});
	});
}
app.post('/resources', [ multer({
	dest : config.temp_path
}), function(req, res) {
	var deviceType = req.body.deviceType ? parseInt(req.body.deviceType, 10) : 0;
	saveFile(req.files.file.name, req.body.objectType, deviceType, function(err) {
		if (err) {
			logger.error(err);
			res.status(500).send(err);
		} else {
			res.status(200).end();
		}
	});
} ]);

app.get('/resources', function(req, res) {
	var objectType = parseInt(req.query.objectType, 10);
	var deviceType = req.body.deviceType ? parseInt(req.body.deviceType, 10) : 0;
	var sql = 'select NAME, OBJECT_TYPE,DEVICE_TYPE,DEVICE_TYPE from detail_page.IMG '
			+ 'where OBJECT_TYPE=? and DEVICE_TYPE=?';
	db.pool.query(sql, [ objectType, deviceType ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			var imgs = [];
			objects.forEach(function(item) {
				imgs.push(item.NAME);
			});
			res.send(imgs);
		}
	});
});

app.get('/resources/:file', function(req, res) {
	var sql = 'select NAME, OBJECT_TYPE,IMG from detail_page.IMG where NAME=?';
	db.pool.query(sql, [ req.params.file ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			if (objects.length <= 0) {
				res.status(404).send("not found:" + req.params.file);
			} else {
				var buffer = new Buffer(objects[0].IMG, 'binary');
				res.send(buffer);
			}
		}
	});
});

app.delete('/resources/:file', function(req, res) {
	var sql = 'delete from detail_page.IMG where NAME=?';
	db.pool.query(sql, [ req.params.file ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(200).end();
		}
	});
});

module.exports = app;

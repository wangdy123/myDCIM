var app = require('./app');

var db = require('dcim-db');
var objectDao = require('dcim-object-dao');
var util = require("dcim-util");
var config = require('dcim-config');

var path = require('path');
var fs = require('fs');

function getDefaultById(objectId, callback) {
	var sql = 'select o.ID,o.OBJECT_TYPE,d.DEVICE_TYPE from config.OBJECT o '
			+ 'left join config.DEVICE d on o.ID=d.ID where o.ID=?';
	db.pool.query(sql, [ objectId ], function(error, objects, fields) {
		if (error) {
			callback(error);
			return;
		}
		if (objects.length === 0) {
			callback("not found:" + objectId);
			return;
		}
		getDefaultPage(objects[0].OBJECT_TYPE, objects[0].DEVICE_TYPE, callback);
	});
}
function getDefaultPage(objectType, deviceType, callback) {
	var fileName = path.join(__dirname, 'page.json');
	try {
		fs.readFile(fileName, function(err, data) {
			if (err) {
				callback(err);
				return;
			}
			var pages = JSON.parse(data);
			var page = null;
			var objectPage = pages[objectType];
			if (objectPage) {
				if (deviceType && objectPage.devicePages) {
					var devicePage = objectPage.devicePages[deviceType];
					if (devicePage) {
						page = devicePage.defaultPage;
					}
				}
				if (!page) {
					page = objectPage.defaultPage;
				}
			}
			if (!page) {
				page = pages.defaultPage;
			}
			callback(null, page);
		});
	} catch (e) {
		logger.error(e);
		callback(e);
	}
}

app.get('/detailPage/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var sql = 'select PAGE_NAME from detail_page.NODE_PAGE WHERE ID=?';
	db.pool.query(sql, [ objectId ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			if (objects.length === 0) {
				getDefaultById(objectId, function(err, page) {
					if (err) {
						logger.error(err);
						res.status(500).send(err);
						return;
					}
					if (!page) {
						res.status(500).send("not found page:" + objectId);
						return;
					}
					res.send({
						page : page
					});
				});
			} else {
				res.send({
					page : objects[0].PAGE_NAME
				});
			}
		}
	});
});

app.put('/pageTamplate/:pageName', function(req, res) {
	var config = JSON.stringify(req.body);
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'REPLACE INTO detail_page.PAGE_TAMPLATE(PAGE_NAME,CONFIG)values(?,?)';
			connection.query(sql, [ req.params.pageName, config ], function(err, result) {
				callback(err);
			});
		} ];
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
		}
	});
});
app.get('/pageTamplate/:pageName', function(req, res) {
	var sql = 'select CONFIG from detail_page.PAGE_TAMPLATE WHERE PAGE_NAME=?';
	db.pool.query(sql, [ req.params.pageName ], function(error, objects) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			if (objects.length === 0) {
				res.send({});
			} else {
				try {
					if (objects[0].CONFIG) {
						objects[0].CONFIG = JSON.parse(objects[0].CONFIG);
						if ((typeof objects[0].CONFIG) == 'string') {
							objects[0].CONFIG = JSON.parse(objects[0].CONFIG);
						}
					}
				} catch (e) {
					objects[0].CONFIG = {};
				}
				res.send(objects[0].CONFIG);
			}
		}
	});
});

app.get('/pageConfig/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var sql = 'select PAGE_NAME,CONFIG from detail_page.NODE_PAGE WHERE ID=?';
	db.pool.query(sql, [ objectId ], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			if (objects.length === 0) {
				res.status(404).send("not found:" + objectId);
			} else {
				try {
					if (objects[0].CONFIG) {
						objects[0].CONFIG = JSON.parse(objects[0].CONFIG);
						if ((typeof objects[0].CONFIG) == 'string') {
							objects[0].CONFIG = JSON.parse(objects[0].CONFIG);
						}
					}
				} catch (e) {
					objects[0].CONFIG = {};
				}
				res.send(objects[0]);
			}
		}
	});
});

app.put('/pageConfig/:id', function(req, res) {
	var objectId = parseInt(req.params.id, 10);
	var config = req.body;
	db.doTransaction(function(connection) {
		return [ function(callback) {
			var sql = 'REPLACE INTO detail_page.NODE_PAGE(ID,PAGE_NAME,CONFIG)values(?,?,?)';
			connection.query(sql, [ objectId, config.PAGE_NAME, config.CONFIG ], function(err, result) {
				callback(err);
			});
		} ];
	}, function(error, result) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.status(204).end();
		}
	});
});

app.get('/detailPage', function(req, res) {
	var fileName = path.join(__dirname, 'page.json');
	try {
		fs.readFile(fileName, function(err, data) {
			if (err) {
				logger.error(err);
				res.status(500).send(err);
				return;
			}
			var pages = JSON.parse(data);
			var objectPage = pages[req.query.objectType];

			if (!req.query.deviceType) {
				res.send(objectPage.pages);
			} else {

				res.send(objectPage.devicePages[req.query.deviceType].pages);
			}
		});
	} catch (e) {
		logger.error(e);
		res.status(500).send(e);
	}
});

var path = require('path');
var fs = require('fs');
app.get('/defaultSignals/:deviceType', function(req, res) {
	var fileName = path.join(process.cwd(), 'conf', 'signal', req.params.deviceType + '.json');
	res.sendFile(fileName);
});

var db = require('dcim-db');
var config = require('dcim-config');
var station = require('dcim-object-dao').station;

module.exports.initRequest = function(app) {
	app.get('/stations', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.root_object_id;
		station.getByPositionParent(db.pool, parentId, function(error, stations) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(stations);
			}
		});
	});
}

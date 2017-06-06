var db = require('dcim-db');
var config = require('dcim-config');
var building = require('dcim-object-dao').building;

module.exports.initRequest = function(app) {
	app.get('/buildings', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.config.root_object_id;
		building.getByPositionParent(db.pool, parentId, function(error, buildings) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(buildings);
			}
		});
	});
}

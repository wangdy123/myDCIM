var db = require('dcim-db');
var config = require('dcim-config');
var region = require('dcim-object-dao').region;

module.exports.initRequest = function(app) {
	app.get('/regions', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.config.root_object_id;
		region.getByPositionParent(db.pool, parentId, function(error, regions) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(regions);
			}
		});
	});
}

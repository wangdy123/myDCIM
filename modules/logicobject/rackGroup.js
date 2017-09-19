var db = require('dcim-db');
var config = require('dcim-config');
var rackGroup = require('dcim-object-dao').rackGroup;

module.exports.initRequest = function(app) {
	app.get('/rackGroups', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.root_object_id;
		rackGroup.getByPositionParent(db.pool, parentId, function(error, rackGroups) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(rackGroups);
			}
		});
	});
}

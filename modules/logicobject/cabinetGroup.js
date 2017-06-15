var db = require('dcim-db');
var config = require('dcim-config');
var cabinetGroup = require('dcim-object-dao').cabinetGroup;

module.exports.initRequest = function(app) {
	app.get('/cabinetGroups', function(req, res) {
		var parentId = req.query.parentId ? req.query.parentId : config.config.root_object_id;
		cabinetGroup.getByPositionParent(db.pool, parentId, function(error, cabinetGroups) {
			if (error) {
				logger.error(error);
				res.status(500).send(error);
			} else {
				res.send(cabinetGroups);
			}
		});
	});
}

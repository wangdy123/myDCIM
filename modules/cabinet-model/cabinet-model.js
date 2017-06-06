var app = require('./app');

var db =require('../base').db;

app.get('/cabinetModels', function(req, res) {
	var sql = 'select ID,NAME,CODE,ABBREVIATION,U_COUNT,U1_POSITION,DEPTH,MAX_USE_YEAR from config.CABINET_MODEL';
	db.pool.query(sql, function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(objects);
		}
	});
});

app.post('/cabinetModels', function(req, res) {
	var obj = req.body;
	try{
	var chain = db.transaction(function(chain) {
		var sql='INSERT INTO config.CABINET_MODEL(NAME,CODE,ABBREVIATION,U_COUNT,U1_POSITION,DEPTH,MAX_USE_YEAR)values(?,?,?,?,?,?,?)';
		chain.query(sql, [ obj.NAME,obj.CODE,obj.ABBREVIATION,obj.U_COUNT,obj.U1_POSITION,obj.DEPTH,obj.MAX_USE_YEAR]);
	}, function() {
		res.status(201).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
	}
	catch(err){
		logger.error(err);
		res.status(500).send(error);
	}
});

app.put('/cabinetModels/:id', function(req, res) {
	var obj = req.body;
	var chain = db.transaction(
			function(chain) {
				var sql='update config.CABINET_MODEL set NAME=?,CODE=?,ABBREVIATION=?,U_COUNT=?,U1_POSITION=?,DEPTH=?,MAX_USE_YEAR=? where ID=?';
				chain.query(sql, [obj.NAME,obj.CODE,obj.ABBREVIATION,obj.U_COUNT,obj.U1_POSITION,obj.DEPTH,obj.MAX_USE_YEAR,req.params.id]);

			}, function() {
				res.status(204).end();
			}, function(error) {
				logger.error(error);
				res.status(500).send(error);
			});
});

app.delete('/cabinetModels/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.CABINET_MODEL where ID=?', [ req.params.id ]);
	}, function() {
		res.status(200).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
});

module.exports = app;

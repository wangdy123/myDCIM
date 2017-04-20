var app = require('./app');

var db =require('../base').db;
var posionRelation=require('./posion_relation');


app.get('/floors', function(req, res) {
	var parentId = req.query.parentId ? req.query.parentId : 0;
	var sql = 'select p.ID,f.NAME,p.OBJECT_TYPE,p.PARENT_ID,f.CODE,f.IS_ROOFTOP from config.FLOOR f '
		+'left join config.POSITION_RELATION p on f.ID=p.ID where p.PARENT_ID=?';
	db.pool.query(sql,[parentId], function(error, departments, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(departments);
		}
	});
});

app.post('/floors', function(req, res) {
	var floor = req.body;
	try{
	var chain = db.transaction(function(chain) {
		posionRelation.createObject(chain,floor,function(id){
			floor.ID=id;
			posionRelation.insertPosionRelation(chain,floor,function(){
				var sql='INSERT INTO config.FLOOR(ID,NAME,CODE,IS_ROOFTOP)values(?,?,?,?)';
				chain.query(sql, [ floor.ID,floor.NAME,floor.CODE,floor.IS_ROOFTOP]);
			});	
		});
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

app.put('/floors', function(req, res) {
	var floor = req.body;
	var chain = db.transaction(
			function(chain) {
				posionRelation.updateObject(chain,floor,function(){
				posionRelation.updatePosionRelation(chain,floor,function(){
				var sql='update config.FLOOR set NAME=?,CODE=?,IS_ROOFTOP=? where ID=?';
				chain.query(sql, [floor.NAME,floor.CODE,floor.IS_ROOFTOP,floor.ID]);
				});
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				logger.error(error);
				res.status(500).send(error);
			});
});

app.delete('/floors/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.FLOOR where ID=?', [ req.params.id ]).on('result', function(result) {
		posionRelation.deletePosionRelation(chain,req.params.id,function(){
			posionRelation.deleteObject(chain,req.params.id,function(){
		});
		});
		});
	}, function() {
		res.status(200).end();
	}, function(error) {
		logger.error(error);
		res.status(500).send(error);
	});
});

module.exports = app;

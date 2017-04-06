var app = require('./app');

var db =require('../base').db;
var posionRelation=require('./posion_relation');

app.get('/cabinets', function(req, res) {
	var parentId = req.query.parentId ? req.query.parentId : 0;
	var sql = 'select p.ID,b.NAME,p.OBJECT_TYPE,p.PARENT_ID,b.CODE,b.SEQUENCE,b.CABINET_MODEL,b.CABINET_DEPTH,'
		+'b.START_USE_DATE,b.EXPECT_END_DATE from config.CABINET b '
		+'left join config.POSITION_RELATION p on b.ID=p.ID where p.PARENT_ID=?';
	db.pool.query(sql,[parentId], function(error, objects, fields) {
		if (error) {
			logger.error(error);
			res.status(500).send(error);
		} else {
			res.send(objects);
		}
	});
});

app.post('/cabinets', function(req, res) {
	var obj = req.body;
	try{
	var chain = db.transaction(function(chain) {
		posionRelation.createObject(chain,obj,function(id){
			obj.ID=id;
			posionRelation.insertPosionRelation(chain,obj,function(){
				var sql='INSERT INTO config.CABINET(ID,NAME,CODE,SEQUENCE,CABINET_MODEL,CABINET_DEPTH,'
					+'START_USE_DATE,EXPECT_END_DATE)values(?,?,?,?,?,?,?,?)';
				chain.query(sql, [ obj.ID,obj.NAME,obj.CODE,obj.SEQUENCE,obj.CABINET_MODEL,obj.CABINET_DEPTH,obj.START_USE_DATE,obj.EXPECT_END_DATE]);
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

app.put('/cabinets', function(req, res) {
	var obj = req.body;
	var chain = db.transaction(
			function(chain) {
				posionRelation.updateObject(chain,obj,function(){
				posionRelation.updatePosionRelation(chain,obj,function(){
				var sql='update config.CABINET set NAME=?,CODE=?,SEQUENCE=?,CABINET_MODEL=?,CABINET_DEPTH=?,START_USE_DATE=?,EXPECT_END_DATE=? where ID=?';
				chain.query(sql, [obj.NAME,obj.CODE,obj.SEQUENCE,obj.CABINET_MODEL,obj.CABINET_DEPTH,obj.START_USE_DATE,obj.EXPECT_END_DATE,obj.ID]);
				});
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				logger.error(error);
				res.status(500).send(error);
			});
});

app.delete('/cabinets/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.CABINET where ID=?', [ req.params.id ]).on('result', function(result) {
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

var app = require('./app');

var db =require('../db');
var posionRelation=require('./posion_relation');


app.get('/regions', function(req, res) {
	var parentId = req.query.parentId ? req.query.parentId : 0;
	var sql = 'select p.ID,a.NAME,p.OBJECT_TYPE,p.PARENT_ID,a.ABBREVIATION,a.ZIP_CODE,'
		+'a.LONGITUDE,a.LATITUDE from config.ADMINISTRATIVE_REGION a '
		+'left join config.POSITION_RELATION p on a.ID=p.ID where p.PARENT_ID=?';
	db.pool.query(sql,[parentId], function(error, departments, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(departments);
		}
	});
});

app.post('/regions', function(req, res) {
	var region = req.body;
	try{
	var chain = db.transaction(function(chain) {
		posionRelation.createObject(chain,region,function(id){
			region.ID=id;
			posionRelation.insertPosionRelation(chain,region,function(){
				console.log(region);
				var sql='INSERT INTO config.ADMINISTRATIVE_REGION(ID,NAME,ABBREVIATION,ZIP_CODE,LONGITUDE,LATITUDE)values(?,?,?,?,?,?)';
				chain.query(sql, [ region.ID,region.NAME, region.ABBREVIATION,region.ZIP_CODE,region.LONGITUDE,region.LATITUDE ]);
			});	
		});
	}, function() {
		res.status(201).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
	}
	catch(err){
		console.log(err);
		res.status(501).send(error);
	}
});

app.put('/regions', function(req, res) {
	var region = req.body;
	var chain = db.transaction(
			function(chain) {
				posionRelation.updateObject(chain,region,function(){
				posionRelation.updatePosionRelation(chain,region,function(){
				var sql='update config.ADMINISTRATIVE_REGION set NAME=?,ABBREVIATION=?,ZIP_CODE=?,LONGITUDE=?,LATITUDE=? where ID=?';
				chain.query(sql, [region.NAME, region.ABBREVIATION,region.ZIP_CODE,region.LONGITUDE,region.LATITUDE,region.ID]);
				});
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				console.log(error);
				res.status(501).send(error);
			});
});

app.delete('/regions/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.ADMINISTRATIVE_REGION where ID=?', [ req.params.id ]).on('result', function(result) {
		posionRelation.deletePosionRelation(chain,req.params.id,function(){
			posionRelation.deleteObject(chain,region,function(){
		});
		});
		});
	}, function() {
		res.status(200).end();
	}, function(error) {
		console.log(error);
		res.status(501).send(error);
	});
});

module.exports = app;

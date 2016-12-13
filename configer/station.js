var app = require('./app');

var db =require('../db');
var posionRelation=require('./posion_relation');


app.get('/stations', function(req, res) {
	if(!req.query.parentId){
		res.send([]);
		return;
	}
	var parentId = req.query.parentId;
	var sql = 'select p.ID,s.NAME,p.OBJECT_TYPE,p.PARENT_ID,s.STATION_TYPE,s.SEQUENCE,s.CODE,'
		+'s.LONGITUDE,s.LATITUDE from config.STATION_BASE s '
		+'left join config.POSITION_RELATION p on s.ID=p.ID where p.PARENT_ID=?';
	db.pool.query(sql,[parentId], function(error, stations, fields) {
		if (error) {
			console.log(error);
			res.status(501).send(error);
		} else {
			res.send(stations);
		}
	});
});

app.post('/stations', function(req, res) {
	var station = req.body;
	try{
	var chain = db.transaction(function(chain) {
		posionRelation.createObject(chain,station,function(id){
			station.ID=id;
			station.CODE="CREATE BY SEQUENCE";
			posionRelation.insertPosionRelation(chain,station,function(){
				console.log(station);
				var sql='INSERT INTO config.STATION_BASE(ID,NAME,STATION_TYPE,SEQUENCE,CODE,LONGITUDE,LATITUDE)values(?,?,?,?,?,?,?)';
				chain.query(sql, [ station.ID,station.NAME, station.STATION_TYPE,station.SEQUENCE,station.CODE,station.LONGITUDE,station.LATITUDE ]);
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

app.put('/stations', function(req, res) {
	var station = req.body;
	var chain = db.transaction(
			function(chain) {
				posionRelation.updateObject(chain,station,function(){
				posionRelation.updatePosionRelation(chain,station,function(){
				var sql='update config.STATION_BASE set NAME=?,STATION_TYPE=?,SEQUENCE=?,CODE=?,LONGITUDE=?,LATITUDE=? where ID=?';
				chain.query(sql, [station.NAME, station.STATION_TYPE,station.SEQUENCE,station.CODE,station.LONGITUDE,station.LATITUDE,station.ID]);
				});
				});
			}, function() {
				res.status(204).end();
			}, function(error) {
				console.log(error);
				res.status(501).send(error);
			});
});

app.delete('/stations/:id', function(req, res) {
	var chain = db.transaction(function(chain) {
		chain.query('delete from config.STATION_BASE where ID=?', [ req.params.id ]).on('result', function(result) {
		posionRelation.deletePosionRelation(chain,req.params.id,function(){
			posionRelation.deleteObject(chain,req.params.id,function(){
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

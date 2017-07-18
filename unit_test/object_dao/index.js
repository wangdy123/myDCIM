var expect = require('chai').expect;
var supertest = require('supertest');
var db = require('dcim-db');
var util = require("dcim-util");
var objectDao = require('dcim-object-dao');

describe('dcim-object-dao-test', function() {

	it('test-get-child-ids', function(done) {
		objectDao.getChildObjectId(db.pool,1,function(err,ids){
			console.log(err);
			console.log(ids);
			done();
		});
	});

});
var expect = require('chai').expect;
var supertest = require('supertest');
require('dcim-logger');

var api = supertest('http://localhost:8080');
describe('hooks1', function() {

	before(function() {
		// runs before all tests in this block
	});

	after(function() {
		// runs after all tests in this block
	});

	beforeEach(function() {
		// runs before each test in this block
	});

	afterEach(function() {
		// runs after each test in this block
	});

	it('test12', function(done) {
		expect(4 + 5).to.be.equal(9);
		expect(4 + 5).to.be.not.equal(10);
		expect({ bar: 'baz' }).to.be.deep.equal({ bar: 'baz' });
		expect('everthing').to.be.ok;
		expect(false).to.not.be.ok;
		// typeof
		expect('test').to.be.a('string');
		expect({ foo: 'bar' }).to.be.an('object');
		//expect(foo).to.be.an.instanceof(Foo);

		// include
		expect([1,2,3]).to.include(2);
		expect('foobar').to.contain('foo');
		expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');

		// empty
		expect([]).to.be.empty;
		expect('').to.be.empty;
		expect({}).to.be.empty;

		// match
		expect('foobar').to.match(/^foo/);
		api.get('/dashboard/userItems')
		  .set('Accept', 'application/json')
		  .expect(200).end(function(err, res){
			  logger.log(res.body);
			   // expect(res.body).to.have.property('columnCount');
			    //expect(res.body.columnCount).to.equal(3);
			  //  expect(res.body).to.have.property('items');
			   // expect(res.body.items.length).to.not.equal(0);
			    done();
			  });
	});
	it.skip('skip12', function() {
	      // ...
	    });
});
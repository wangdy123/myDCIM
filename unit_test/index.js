describe('hooks', function() {

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

	it('test1', function(done) {
		done();
	});
	it.skip('skip1', function() {
	      // ...
	    });
});
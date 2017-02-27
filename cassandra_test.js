const cassandra = require('cassandra-driver');  
const client = new cassandra.Client({ contactPoints: ['192.168.0.78:9042', '192.168.0.68:9042', '192.168.0.69:9042' ],keyspace: 'monitordb'});  
const id=1;
client.execute('SELECT id, ts, value FROM history_ai WHERE id=?', [ id ], { prepare: true},  function(err, result) {
	if (err)
		console.log(err);
	else
		console.log(result);
});

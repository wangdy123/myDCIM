CREATE KEYSPACE IF NOT EXISTS history_record WITH REPLICATION = {'class': 'SimpleStrategy','replication_factor':2};
use history_record;

CREATE TABLE alarm (
	object_id int,
	signal_id int,
  	alarm_begin  bigint,
   	alarm_level  int,
  	end_time     bigint,
  	object_name text,
  	alarm_name   text,
  	alarm_value  text,
  	alarm_desc   text,
  	alarm_status int,
  	ack_time     bigint,
    ack_desc     text,
    ack_user     text,
	PRIMARY KEY (object_id,signal_id,alarm_begin) )WITH CLUSTERING ORDER BY (alarm_begin DESC);

create index on alarm(alarm_level);
create index on alarm(end_time);
create index on alarm(ack_time);

SELECT * FROM alarm WHERE object_id = 1 AND alarm_level > 2 ALLOW FILTERING; 
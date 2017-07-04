CREATE KEYSPACE IF NOT EXISTS history_record WITH REPLICATION = {'class': 'SimpleStrategy','replication_factor':2};
use history_record;

CREATE TABLE alarm (
	sequence bigint,
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
	PRIMARY KEY (sequence) );

create index on alarm(object_id);
create  CUSTOM index on alarm(object_id,signal_id,alarm_begin);
create index on alarm(object_id,signal_id,end_time);

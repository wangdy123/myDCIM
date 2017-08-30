CREATE KEYSPACE IF NOT EXISTS history_record WITH REPLICATION = {'class': 'SimpleStrategy','replication_factor':2};
use history_record;

CREATE TABLE alarm (
	sequence bigint,
	object_id int,
	signal_id int,
	alarm_type int,
	device_type int,
  	alarm_begin  bigint,
   	alarm_level  int,
  	end_time     bigint,
  	object_name text,
  	alarm_name   text,
  	alarm_value  text,
  	alarm_desc   text,
  	alarm_status int,
  	ack_time     bigint,
    reason     text,
    ack_user     text,
	PRIMARY KEY (sequence) );
	
create index on alarm(object_id);
create index on alarm(alarm_begin);
create index on alarm(alarm_level);

CREATE TABLE login_log (
	sequence bigint,
	account_id int,
	login_time bigint,
	logout_time bigint
	ssid varchar,
	PRIMARY KEY (sequence) );
create index on login_log(account_id);
create index on login_log(login_time);
	
	
SELECT * FROM alarm WHERE object_id = 1 AND alarm_level > 2 ALLOW FILTERING; 
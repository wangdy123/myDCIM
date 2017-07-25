create database record character set utf8 collate utf8_bin;


CREATE TABLE record.alarm (
	sequence INT NOT NULL AUTO_INCREMENT,
	object_id int,
	signal_id int,
	alarm_type int,
  	alarm_begin  datetime,
   	alarm_level  int,
   	device_type int,
  	end_time     datetime,
  	object_name varchar(256),
  	alarm_name   varchar(64),
  	alarm_value  varchar(64),
  	alarm_desc   varchar(64),
  	alarm_status int,
  	ack_time     datetime,
    reason     TEXT,
    ack_user     varchar(64),
    PRIMARY KEY (sequence),
  UNIQUE KEY(object_id,signal_id,alarm_begin));
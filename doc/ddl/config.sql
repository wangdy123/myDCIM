create database config character set utf8 collate utf8_bin;

CREATE TABLE config.SEQUENCES (
  SEQ_NAME varchar(64),
  VALUE BIGINT NOT NULL,
  PRIMARY KEY (SEQ_NAME)
 )ENGINE = InnoDB  DEFAULT CHARSET=utf8;
 
CREATE TABLE config.OBJECT (
  ID BIGINT NOT NULL AUTO_INCREMENT,
  OBJECT_TYPE INT NOT NULL,
  NAME varchar(128) NOT NULL,
  CODE varchar(64),
  PRIMARY KEY (ID)
 )ENGINE = InnoDB  DEFAULT CHARSET=utf8;
 
 
CREATE TABLE config.POSITION_RELATION (
  ID BIGINT NOT NULL,
  PARENT_ID BIGINT,
  PRIMARY KEY (ID),
  FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) on delete CASCADE,
  FOREIGN KEY (PARENT_ID) REFERENCES config.OBJECT (ID)
 )ENGINE = InnoDB  DEFAULT CHARSET=utf8;
 
CREATE TABLE config.OBJECT_EXT (
 ID BIGINT NOT NULL,
 PROP_NAME varchar(64) NOT NULL,
 PROP_VALUE varchar(256) NOT NULL,
  PRIMARY KEY (ID,PRO_NAME),
  FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) on delete CASCADE
 )ENGINE = InnoDB  DEFAULT CHARSET=utf8;
 
CREATE TABLE config.ADMINISTRATIVE_REGION(
	ID BIGINT  NOT NULL,
	REGION_TYPE INT NOT NULL,
  	ABBREVIATION varchar(64),
  	LONGITUDE double,
  	LATITUDE double,
  PRIMARY KEY (ID),
  FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) on delete CASCADE
)ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE config.STATION_BASE (
  ID BIGINT NOT NULL,
  LONGITUDE double DEFAULT NULL,
  LATITUDE double DEFAULT NULL,
  STATION_TYPE INT NOT NULL,
  ADDRESS varchar(255) NOT NULL,
  AREA INT DEFAULT NULL,
  DESCRIPTION TEXT,
  PRIMARY KEY (ID),
  FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.BUILDING(
	ID BIGINT NOT NULL,
  	FLOOR_UNDERGROUND INT NOT NULL DEFAULT 0,
  	FLOOR_GROUND INT NOT NULL DEFAULT 1,
    DESCRIPTION TEXT,
  	PRIMARY KEY (ID),
  	FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) on delete CASCADE
)ENGINE = InnoDB  DEFAULT CHARSET=utf8;


CREATE TABLE config.FLOOR (
  ID BIGINT NOT NULL,
  SEQUENCE INT NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.ROOM(
	ID BIGINT NOT NULL,
  	ROOM_TYPE INT NOT NULL,
  	RACK_COUNT INT,
  	SAFETY_PERSON INT,
  	DEPARTMENT INT,
  	DESCRIPTION TEXT,
  	PRIMARY KEY (ID),
  	FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) on delete CASCADE,
 	FOREIGN KEY (SAFETY_PERSON) REFERENCES portal.PERSONNEL_CFG (ID),
 	FOREIGN KEY (DEPARTMENT) REFERENCES portal.DEPARTMENT (ID)
)ENGINE = InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE config.RACK_GROUP (
  ID BIGINT NOT NULL,
  RACK_COUNT INT,
  RACK_DEPTH double NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.RACK_MODEL (
  ID INT NOT NULL AUTO_INCREMENT,
  NAME varchar(128) NOT NULL,
  ABBREVIATION varchar(64),
  U1_POSITION tinyint(1) DEFAULT 0,
  U_COUNT INT NOT NULL,
  DEPTH double NOT NULL,
  MAX_USE_AGE INT NOT NULL,
  PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.RACK (
  ID BIGINT NOT NULL,
  RACK_MODEL INT NOT NULL,
  SEQUENCE INT NOT NULL,
  RACK_DEPTH double NOT NULL,
  START_USE_DATE date,
  EXPECT_END_DATE date,
  PRIMARY KEY (ID),
  FOREIGN KEY (RACK_MODEL) REFERENCES config.RACK_MODEL (ID),
  FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.DEVICE_VENDER (
  ID INT NOT NULL AUTO_INCREMENT,
  NAME varchar(128) NOT NULL,
  CODE varchar(32),
  ABBREVIATION varchar(64),
  DESCRIPTION TEXT,
  PRIMARY KEY (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.DEVICE_MODEL (
  ID INT NOT NULL AUTO_INCREMENT,
  NAME varchar(128) NOT NULL,
  CODE varchar(32) NOT NULL,
  DEVICE_TYPE int(11) NOT NULL,
  VENDER int(11) NOT NULL,
  MAX_USE_AGE int(11) NOT NULL,
  DESCRIPTION TEXT,
  PRIMARY KEY (ID),
  FOREIGN KEY (VENDER) REFERENCES config.DEVICE_VENDER (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.DEVICE (
  ID BIGINT NOT NULL,
  VENDER INT NOT NULL,
  MODEL INT NOT NULL,
  BUSINESS_TYPE int(11) NOT NULL,
  DEVICE_TYPE INT NOT NULL,
  START_USE_DATE date,
  EXPECT_END_DATE date,
  DESCRIPTION TEXT,
  PRIMARY KEY (ID),
  FOREIGN KEY (MODEL) REFERENCES config.DEVICE_MODEL (ID),
  FOREIGN KEY (VENDER) REFERENCES config.DEVICE_VENDER (ID),
  FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.FSU (
  ID INT NOT NULL AUTO_INCREMENT,
  NAME varchar(128) NOT NULL,
  CODE varchar(64),
  MODEL varchar(64) NOT NULL,
  POSTION BIGINT NOT NULL,
  PRIMARY KEY (ID),
   FOREIGN KEY (POSTION) REFERENCES config.OBJECT (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.FSU_PARAM (
 ID INT NOT NULL,
 PRO_NAME varchar(64) NOT NULL,
 PRO_VALUE varchar(256) NOT NULL,
  PRIMARY KEY (ID,PRO_NAME),
  FOREIGN KEY (ID) REFERENCES config.FSU (ID) on delete CASCADE
 )ENGINE = InnoDB  DEFAULT CHARSET=utf8;
 
 CREATE TABLE config.DRIVER (
  ID INT NOT NULL AUTO_INCREMENT,
  NAME varchar(128) NOT NULL,
  MODEL varchar(64) NOT NULL,
  POSTION BIGINT NOT NULL,
  FSU INT,
  PRIMARY KEY (ID),
  FOREIGN KEY (POSTION) REFERENCES config.OBJECT (ID),
  FOREIGN KEY (FSU) REFERENCES config.FSU (ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.DRIVER_PARAM (
 ID INT NOT NULL,
 PRO_NAME varchar(64) NOT NULL,
 PRO_VALUE varchar(256) NOT NULL,
  PRIMARY KEY (ID,PRO_NAME),
  FOREIGN KEY (ID) REFERENCES config.DRIVER (ID) on delete CASCADE
 )ENGINE = InnoDB  DEFAULT CHARSET=utf8;
 
CREATE TABLE config.SIGNAL (
  OBJECT_ID BIGINT NOT NULL,
  SIGNAL_ID BIGINT NOT NULL,
  SIGNAL_TYPE INT NOT NULL,
  SIGNAL_NAME varchar(64) NOT NULL,
  RECORD_RERIOD INT,
  RECOVER_DELAY INT,
  NORMAL_DESC varchar(64),
  UNIT  varchar(32),
  EXPLANATION varchar(256),
  DESCRIPTION varchar(256),
  DRIVER_ID INT,
  DRIVER_KEY varchar(64),
  SRC_SIGNAL_ID BIGINT,
  PRIMARY KEY (OBJECT_ID,SIGNAL_ID),
  FOREIGN KEY (OBJECT_ID) REFERENCES config.OBJECT (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.SIGNAL_TRANS_FUNC (
  OBJECT_ID BIGINT NOT NULL,
  SIGNAL_ID BIGINT NOT NULL,
  FUNC_NAME varchar(64) NOT NULL,
  PRIMARY KEY (OBJECT_ID,SIGNAL_ID),
  FOREIGN KEY (OBJECT_ID,SIGNAL_ID) REFERENCES config.SIGNAL (OBJECT_ID,SIGNAL_ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.SIGNAL_TRANS_FUNC_PROP (
  OBJECT_ID BIGINT NOT NULL,
  SIGNAL_ID BIGINT NOT NULL,
  PROP varchar(64) NOT NULL,
  VALUE varchar(64) ,
  PRIMARY KEY (OBJECT_ID,SIGNAL_ID,PROP),
  FOREIGN KEY (OBJECT_ID,SIGNAL_ID) REFERENCES config.SIGNAL_TRANS_FUNC (OBJECT_ID,SIGNAL_ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE config.SIGNAL_CONDITION (
  OBJECT_ID BIGINT NOT NULL,
  SIGNAL_ID BIGINT NOT NULL,
  CONDITION_NUM INT NOT NULL,
  CONDITION_TYPE varchar(64) NOT NULL,
  ALARM_DESC varchar(64),
  ALARM_LEVEL INT,
  ALARM_DELAY INT,
  PRIMARY KEY (OBJECT_ID,SIGNAL_ID,CONDITION_NUM),
  FOREIGN KEY (OBJECT_ID,SIGNAL_ID) REFERENCES config.SIGNAL (OBJECT_ID,SIGNAL_ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE config.SIGNAL_CONDITION_PROP (
  OBJECT_ID BIGINT NOT NULL,
  SIGNAL_ID BIGINT NOT NULL,
  CONDITION_NUM INT NOT NULL,
  PROP varchar(64) NOT NULL,
  VALUE varchar(64) ,
  PRIMARY KEY (OBJECT_ID,SIGNAL_ID,CONDITION_NUM,PROP),
  FOREIGN KEY (OBJECT_ID,SIGNAL_ID,CONDITION_NUM) REFERENCES config.SIGNAL_CONDITION (OBJECT_ID,SIGNAL_ID,CONDITION_NUM) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `config`.`OBJECT`(`OBJECT_TYPE`,`NAME`,`CODE`)VALUES(1,'广州市','510000');
INSERT INTO `config`.`ADMINISTRATIVE_REGION`(`ID`,`REGION_TYPE`,`ABBREVIATION`,`LONGITUDE`,`LATITUDE`)
VALUES(LAST_INSERT_ID(),2,'',113,23);

CREATE TABLE config.DOOR(
	ID INT NOT NULL,
  	NAME varchar(128) NOT NULL,
  	CODE varchar(32) NOT NULL,
  	SEQUENCE int(11) DEFAULT NULL,
  	PRIMARY KEY (ID),
  	FOREIGN KEY (ID) REFERENCES config.OBJECT (ID) on delete CASCADE
)ENGINE = InnoDB  DEFAULT CHARSET=utf8;

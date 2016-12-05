create database dcim character set utf8 collate utf8_bin;

CREATE TABLE dcim.LOGIC_OBJECT (
  ID INT NOT NULL AUTO_INCREMENT,
  NAME varchar(128) NOT NULL,
  ABBREVIATION varchar(64) NOT NULL,
  
  PRIMARY KEY (ID)
 )ENGINE = InnoDB  DEFAULT CHARSET=utf8;
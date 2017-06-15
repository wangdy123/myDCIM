var crypto = require("crypto");

var key = 'REzySUKRCPfyfV/jfgwTA==';  
module.exports.transToSha1=function(str){
	var sha1 = crypto.createHmac('sha1',key);
	sha1.update(str);
	return sha1.digest('hex');
};

module.exports.deepClone=function(obj){
	return JSON.parse(JSON.stringify(obj));
};

module.exports.stringTrim = function(str) {
	if(!str){
		return str;
	}
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

module.exports.intFormat = function(value, width, prefix, radio) {
	var str = value.toString(radio);
	if (!prefix) {
		prefix = "0";
	}
	while (str.length < width) {
		str = prefix + str;
	}
	return str;
};


Date.prototype.getZone=function(){
	var zone = -this.getTimezoneOffset()/60;
	var str = zone.toString();
	while (str.length < 2) {
		str = '0' + str;
	}
	return (zone>=0?"+":"-")+str+"00";
}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds(), // 毫秒
        "Z": this.getZone()// 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

module.exports.dateFormat = function(datestr,fmt) {
	if (!datestr) {
		return "";
	}
	if(!fmt){
		fmt="yyyy-MM-dd";
	}
	try {
		var date= new Date(Date.parse(datestr));
		if(date){
			return date.format(fmt);
		}
	} catch (e) {
		return "";
	}
	return "";
};

module.exports.timeformat = function(time,fmt) {
	if (!time) {
		return "";
	}
	if(!fmt){
		fmt="yyyy-MM-dd hh:mm:ss";
	}
	try {
		var date= new Date(Date.parse(time));
		if(date){
			return date.format(fmt);
		}
	} catch (e) {
		return "";
	}
	return "";
};

module.exports.timeformat_t = function(time) {
	if(!fmt){
		fmt="yyyy-MM-ddThh:mm:ssZ";
	}
	return module.exports.timeformat(time,fmt);
};

module.exports.date_parse = function(datestr) {
	if (!datestr) {
		return null;
	}
	try {
		var d= new Date(Date.parse(datestr));
		return d;
	} catch (e) {
		return null;
	}
};

module.exports.timediffFormat = function(timeDiffSecond) {
	var timeDiff = timeDiffSecond;
	var res = {
		D : 0,
		H : 0,
		M : 0,
		S : 0
	};
	var Day_Param = 60 * 60 * 24;// 一天等于秒数
	var Hour_Param = 60 * 60;// 一小时等于秒数
	res.D = Math.floor(timeDiff / (Day_Param));//

	timeDiff = timeDiff - res.D * Day_Param;// 减去天的秒数。再求小时个数
	res.H = Math.floor(timeDiff / (Hour_Param));

	timeDiff = timeDiff - res.H * Hour_Param;// 减去小时的秒数。再求分钟个数
	res.M = Math.floor(timeDiff / 60);

	res.S = (timeDiff - res.M * 60);// 减去分钟的秒数。再求秒的个数

	res.toString = function() {
		if (this.D > 0 || this.H > 0 || this.M > 0) {
			return (this.D > 0 ? (this.D + "天") : "") + (this.H > 0 ? (this.H + "时") : "") + (this.M > 0 ? (this.M + "分") : "");
		} else {
			return this.S > 0 ? (this.S + "秒") : "";
		}
	};
	return res;
};
module.exports.TimeDiff = function(start, end) {
	var endTime = end ? end : new Date();
	return module.exports.timediffFormat(Math.floor((endTime.getTime() - start.getTime()) / 1000));
};

window.WUI = window.WUI || {};

var subscribes = [];
window.WUI.subscribe = function(evt, fn) {
	subscribes.push({
		name : evt,
		fn : fn
	});
};
window.WUI.publishEvent = function(name, event) {
	for ( var evt in subscribes) {
		if (name === subscribes[evt].name) {
			subscribes[evt].fn(event);
		}
	}
};

window.WUI.ajax={};
function doSuccess(success,data,textStatus,jqXHR){
	if(success){
		success(data,textStatus);
	}
}
function doError(fail,xhr,textStatus){
	if(fail){
		fail(xhr.responseText,xhr.status);
	}
}
window.WUI.ajax.post=function(url,body,success,fail,longtime){
	if(longtime){
	$.messager.progress();
	}
	$.ajax({
	    url:url,
	    type:'POST', // GET
	    data:JSON.stringify( body ),
	    contentType: "application/json; charset=utf-8",
	    timeout:30000,    // 超时时间
	    success:function(data,textStatus,jqXHR){
	    	if(longtime){
	    		$.messager.progress('close');
	    	}
	    	doSuccess(success,data,textStatus,jqXHR);
	    },
	    error:function(xhr,textStatus){
	    	if(longtime){
	    		$.messager.progress('close');
	    	}
	    	doError(fail,xhr,textStatus);
	    }
	});
};
window.WUI.ajax.put=function(url,body,success,fail,longtime){
	if(longtime){
		$.messager.progress();
		}
	$.ajax({
	    url:url,
	    type:'PUT', // GET
	    contentType: "application/json; charset=utf-8",
	    data:JSON.stringify( body ),
	    timeout:30000,    // 超时时间
	    success:function(data,textStatus,jqXHR){
	    	if(longtime){
	    		$.messager.progress('close');
	    	}
	    	doSuccess(success,data,textStatus,jqXHR);
	    },
	    error:function(xhr,textStatus){
	    	if(longtime){
	    		$.messager.progress('close');
	    	}
	    	doError(fail,xhr,textStatus);
	    }
	});
};
window.WUI.ajax.get=function(url,args,success,fail,longtime){
	if(longtime){
		$.messager.progress();
		}
	$.ajax({
	    url:url,
	    type:'GET', //
	    data:args,
	    timeout:30000,    // 超时时间
	    success:function(data,textStatus,jqXHR){
	    	if(longtime){
	    		$.messager.progress('close');
	    	}
	    	doSuccess(success,data,textStatus,jqXHR);
	    },
	    error:function(xhr,textStatus){
	    	if(longtime){
	    		$.messager.progress('close');
	    	}
	    	doError(fail,xhr,textStatus);
	    }
	});
};
window.WUI.ajax.remove=function(url,args,success,fail,longtime){
	if(longtime){
		$.messager.progress();
		}
	$.ajax({
	    url:url,
	    type:'DELETE', // GET
	    timeout:30000,    // 超时时间
	    data:args,
	    success:function(data,textStatus,jqXHR){
	    	if(longtime){
	    		$.messager.progress('close');
	    	}
	    	doSuccess(success,data,textStatus,jqXHR);
	    },
	    error:function(xhr,textStatus){
	    	if(longtime){
	    		$.messager.progress('close');
	    	}
	    	doError(fail,xhr,textStatus);
	    }
	});
};


window.WUI.stringTrim = function(str) {
	if(!str){
		return str;
	}
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

window.WUI.intFormat = function(value, width, prefix, radio) {
	var str = value.toString(radio);
	if (!prefix) {
		prefix = "0";
	}
	while (str.length < width) {
		str = prefix + str;
	}
	return str;
};

window.WUI.date_reformat = function(datestr) {
	if (!datestr) {
		return "";
	}

	var date=new Date();
	try {
		date= new Date(Date.parse(datestr));
	} catch (e) {
		return "";
	}
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var min = date.getMinutes();
	var s = date.getSeconds();
	return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) + ' ' + (h < 10 ? ('0' + h) : h)
			+ ':' + (min < 10 ? ('0' + h) : min) + ':' + (s < 10 ? ('0' + s) : s);
};

window.WUI.date_format = function(date) {
	if (!date) {
		return "";
	}
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var min = date.getMinutes();
	var s = date.getSeconds();
	return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) + ' ' + (h < 10 ? ('0' + h) : h)
			+ ':' + (min < 10 ? ('0' + h) : min) + ':' + (s < 10 ? ('0' + s) : s);
};

window.WUI.date_parse = function(datestr) {
	if (!datestr) {
		return Date();
	}
	try {
		return Date(Date.parse(datestr));
	} catch (e) {
		return Date();
	}
};

window.WUI.timediffFormat = function(timeDiffSecond) {
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
window.WUI.timeDiff = function(start, end) {
	var endTime = end ? end : new Date();
	return window.WUI.timediffFormat(Math.floor((endTime.getTime() - start.getTime()) / 1000));
};
$.extend($.fn.validatebox.defaults.rules, {
	equalTo: {
        validator:function(value,param){
            return $(param[0]).val() === value;
        },
        message:'字段不匹配'
    },
    minLength: {
        validator: function (value, param) {
            return value.length >= param[0];
        },
        message: '请输入至少（2）个字符.'
    },
    length: { validator: function (value, param) {
        var len = $.trim(value).length;
        return len >= param[0] && len <= param[1];
    },
        message: "输入内容长度必须介于{0}和{1}之间."
    },
    mobile: {// 验证手机号码
        validator: function (value) {
            return /^(13|15|18|17)\d{9}$/i.test(value);
        },
        message: '手机号码格式不正确'
    },
    intOrFloat: {// 验证整数或小数
        validator: function (value) {
            return /^\d+(\.\d+)?$/i.test(value);
        },
        message: '请输入数字，并确保格式正确'
    },
    currency: {// 验证货币
        validator: function (value) {
            return /^\d+(\.\d+)?$/i.test(value);
        },
        message: '货币格式不正确'
    },
    integer: {// 验证整数 可正负数
        validator: function (value) {
            // return /^[+]?[1-9]+\d*$/i.test(value);

            return /^([+]?[0-9])|([-]?[0-9])+\d*$/i.test(value);
        },
        message: '请输入整数'
    },
    age: {// 验证年龄
        validator: function (value) {
            return /^(?:[1-9][0-9]?|1[01][0-9]|120)$/i.test(value);
        },
        message: '年龄必须是0到120之间的整数'
    },

    chinese: {// 验证中文
        validator: function (value) {
            return /^[\Α-\￥]+$/i.test(value);
        },
        message: '请输入中文'
    },
    english: {// 验证英语
        validator: function (value) {
            return /^[A-Za-z]+$/i.test(value);
        },
        message: '请输入英文'
    },
    unnormal: {// 验证是否包含空格和非法字符
        validator: function (value) {
            return /.+/i.test(value);
        },
        message: '输入值不能为空和包含其他非法字符'
    },
    username: {// 验证用户名
        validator: function (value) {
            return /^[a-zA-Z][a-zA-Z0-9_]{5,15}$/i.test(value);
        },
        message: '用户名不合法（字母开头，允许6-16字节，允许字母数字下划线）'
    },
    faxno: {// 验证传真
        validator: function (value) {
            return /^((\d2,3)|(\d{3}\-))?(0\d2,3|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/i.test(value);
        },
        message: '传真号码不正确'
    },
    zip: {// 验证邮政编码
        validator: function (value) {
            return /^[1-9]\d{5}$/i.test(value);
        },
        message: '邮政编码格式不正确'
    },
    ip: {// 验证IP地址
        validator: function (value) {
            return /d+.d+.d+.d+/i.test(value);
        },
        message: 'IP地址格式不正确'
    },
    name: {// 验证姓名，可以是中文或英文
        validator: function (value) {
            return /^[\Α-\￥]+$/i.test(value) | /^\w+[\w\s]+\w+$/i.test(value);
        },
        message: '请输入姓名'
    },
    date: {// 验证姓名，可以是中文或英文
        validator: function (value) {
            // 格式yyyy-MM-dd或yyyy-M-d
            return /^(?:(?!0000)[0-9]{4}([-]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-]?)0?2\2(?:29))$/i.test(value);
        },
        message: '清输入合适的日期格式'
    },
    msn: {
        validator: function (value) {
            return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
        },
        message: '请输入有效的msn账号(例：abc@hotnail(msn/live).com)'
    },
    same: {
        validator: function (value, param) {
            if ($("#" + param[0]).val() != "" && value != "") {
                return $("#" + param[0]).val() == value;
            } else {
                return true;
            }
        },
        message: '两次输入的密码不一致！'
    }
}); 
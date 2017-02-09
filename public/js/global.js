
window.WUI = window.WUI || {};
window.WUI.urlPath="/DCIM";

var subscribes = [];
window.WUI.subscribe = function(evt, fn) {
	subscribes.push({
		name : evt,
		fn : fn
	});
};
// evt:open_object(event),reload_object(event),current_object(cbk(object))
window.WUI.publishEvent = function(name, event) {
	for ( var evt in subscribes) {
		if (name === subscribes[evt].name) {
			subscribes[evt].fn(event);
		}
	}
};

window.WUI.onLoadError=function(){
	if(xhr.status===401){
		$.messager.alert('失败', "无操作权限，请联系系统管理员确认用户权限！");
	}
}
window.WUI.ajax={};
function doSuccess(success,data,textStatus,jqXHR){
	if(success){
		success(data,textStatus);
	}
}
function doError(fail,xhr,textStatus){
	if(xhr.status===401){
		$.messager.alert('失败', "无操作权限，请联系系统管理员确认用户权限！");
		return;
	}
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

window.WUI.makeFloorName=function(floorNum, isUnderground) {
	var nummber = [ "零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十" ];
	var floorName = "";
	if (floorNum <= 10) {
		floorName = nummber[floorNum] + "层";
	} else if ((floorNum % 10) === 0) {
		floorName = nummber[floorNum / 10] + "十层";
	} else {
		floorName = nummber[parseInt(floorNum / 10, 10)] + nummber[floorNum % 10] + "层";
	}
	if (isUnderground) {
		floorName = "负" + floorName;
	}
	return floorName;
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
	return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d);
};

window.WUI.date_format = function(date) {
	if (!date) {
		return "";
	}
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	var d = date.getDate();
	return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d);
};

window.WUI.time_reformat = function(timestr) {
	if (!timestr) {
		return "";
	}

	var date=new Date();
	try {
		date= new Date(Date.parse(timestr));
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

window.WUI.time_format = function(time) {
	if (!time) {
		return "";
	}
	var y = time.getFullYear();
	var m = time.getMonth() + 1;
	var d = time.getDate();
	var h = time.getHours();
	var min = time.getMinutes();
	var s = time.getSeconds();
	return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) + ' ' + (h < 10 ? ('0' + h) : h)
			+ ':' + (min < 10 ? ('0' + h) : min) + ':' + (s < 10 ? ('0' + s) : s);
};
window.WUI.date_parse = function(datestr) {
	if (!datestr) {
		return new Date();
	}
	try {
		var d= new Date(Date.parse(datestr));
		return d;
	} catch (e) {
		return new Date();
	}
};

window.WUI.timeAddSecond = function(time,timeDiffSecond) {
	var objTime=new Date();
	try {
		objTime= new Date(Date.parse(time));
	} catch (e) {
	}
	return new Date(objTime.getTime() +timeDiffSecond* 24* 3600 * 1000);
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
        message: '请输入至少{0}个字符.'
    }, maxLength: {
        validator: function (value, param) {
        	if(value.length > param[1]){
        		$(param[0]).val(value.substring(0,param[1]));
        	}
            return value.length <= param[1];
        },
        message: '请输入最多{1}个字符.'
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
    password:{
    	 validator: function (value) {
    		 if(value.length<8){
    			 return false;
    		 }
    		 var isValid=/[a-z]/.test(value);
    		 isValid=isValid&&/[0-9]/.test(value);
    		 isValid=isValid&&/[A-Z]/.test(value);
    		 isValid=isValid&&/[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/.test(value);
    		 
             return isValid;
         },
         message: '密码长度大于8位；密码是大小写字母、数字以及特殊字符的混合使用'
    },
    username: {// 验证用户名
        validator: function (value) {
            return /^[a-zA-Z][a-zA-Z0-9_]{5,15}$/i.test(value);
        },
        message: '用户名不合法（字母开头，允许6-16字节，允许字母数字下划线）'
    },
    zip: {// 验证邮政编码
        validator: function (value) {
            return /^[1-9]\d{5}$/i.test(value);
        },
        message: '邮政编码格式不正确'
    },
    code: {// 验证编码
        validator: function (value,param) {
        	if(value.length > param[1]){
        		$(param[0]).val(value.substring(0,param[1]));
        	}
        	if(!/^\d*$/i.test(value)){
        		return false;
        	}
            return value.length===param[1];
        },
        
        message: '输入长度为{1}的数字'
    },
    ip: {// 验证IP地址
        validator: function (value) {
            return /d+.d+.d+.d+/i.test(value);
        },
        message: 'IP地址格式不正确'
    }
}); 
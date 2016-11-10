$(document).ready(function() {
	$(".theme-item").click(function() {
		$.cookie("theme", $(this).attr("value"));
		$(this).parent().hide();
		location.reload();
	});
});

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
	    // context:body,
	    data:JSON.stringify( body ),
	    contentType: "application/json; charset=utf-8",
	    timeout:30000,    // 超时时间
	    dataType:'json',
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
	    // context:body,
	    timeout:30000,    // 超时时间
	    dataType:'json',
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
	    dataType:'json',
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

window.WUI = window.WUI || {};

window.WUI.getDatagridRowIndex=function(target){
	var tr = $(target).closest('tr.datagrid-row');
	return parseInt(tr.attr('datagrid-row-index'));
}
window.WUI.getDatagridRow=function($datagrid,target){
	return $datagrid.datagrid("getRows")[WUI.getDatagridRowIndex(target)];
}
var subscribes = [];
window.WUI.subscribe = function(evt, fn,subscriber) {
	subscribes.push({
		name : evt,
		fn : fn,
		subscriber:subscriber
	});
};
// evt:open_object(event),reload_object(event),current_object(cbk(object))
window.WUI.publishEvent = function(name, event) {
	for ( var evt in subscribes) {
		try{
		if (name === subscribes[evt].name) {
			subscribes[evt].fn(event);
		}
		}catch(e){
			console.log(subscribes[evt].subscriber);
			console.log(e);
		}
	}
};
window.WUI.findFromArray=function(array,key,value){
	for (var i = 0; i < array.length; i++) {
		var item = array[i];
		if (item[key] === value) {
			return item;
		}
	}
};
WUI.getPropertyValue = function(properties, name) {
	var item = WUI.findFromArray(properties, "PRO_NAME", name);
	if (item) {
		return item.PRO_VALUE;
	}
};
window.WUI.hasRight=function(rightId){
	return WUI.findFromArray(WUI.userRights, "id", rightId);
};

window.WUI.onLoadError=function(xhr){
	if(xhr.status===401){
		$.messager.alert('失败', "登录已超时，请重新登录！");
		location.reload();
	}
	if(xhr.status===405){
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
		$.messager.alert('失败', "登录已超时，请重新登录！");
		location.reload();
		return;
	}
	if(xhr.status===403){
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
	    cache:false,
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
window.WUI.getParameterByName = function(name) {
	var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
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

window.WUI.dateFormat = function(datestr,fmt) {
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

window.WUI.timeformat = function(time,fmt) {
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

window.WUI.timeformat_t = function(time,fmt) {
	if(!fmt){
		fmt="yyyy-MM-ddThh:mm:ssZ";
	}
	return WUI.timeformat(time,fmt);
};


window.WUI.date_parse = function(datestr) {
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
		// return (this.D > 0 ? (this.D + "天") : "") + (this.H > 0 ? (this.H + "时") : "") + (this.M > 0 ? (this.M + "分")
		// : "")+(this.S > 0 ? (this.S + "秒") : "");
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
	return window.WUI.timediffFormat(Math.floor((endTime.getTime() - start.getTime()) / 1000)).toString();
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
    		 var count=0;
    		 if(/[a-z]/.test(value)){
    			 count++;
    		 }
    		 if(/[0-9]/.test(value)){
    			 count++;
    		 }
    		 if(/[A-Z]/.test(value)){
    			 count++;
    		 }
    		 if(/[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/.test(value)){
    			 count++;
    		 }
             return count>=2;
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

window.WUI.fullscreen=function(elem){  
    elem=elem?elem:document.body;  
    if(elem.webkitRequestFullScreen){  
        elem.webkitRequestFullScreen();     
    }else if(elem.mozRequestFullScreen){  
        elem.mozRequestFullScreen();  
    }else if(elem.requestFullScreen){  
        elem.requestFullscreen();  
    }else{  
        // 浏览器不支持全屏API或已被禁用
    }  
};  
window.WUI.exitFullscreen=function(){  
    if(document.webkitCancelFullScreen){  
    	document.webkitCancelFullScreen();      
    }else if(document.mozCancelFullScreen){  
    	document.mozCancelFullScreen();  
    }else if(document.cancelFullScreen){  
    	document.cancelFullScreen();  
    }else if(document.exitFullscreen){  
    	document.exitFullscreen();  
    }else{  
        // 浏览器不支持全屏API或已被禁用
    }  
} ; 

window.WUI.waterfall=function(tasks,callback){
	if(tasks.length<=0){
		callback();
	}
	var i=0;
	var errs=[];
	function finishedCbk(err){
		if(err){
			errs.push(err);
		}
		i++;
		if(i<tasks.length){
			tasks[i](finishedCbk);
		}else{
			callback();
		}
	}
	tasks[i](finishedCbk);
};
window.WUI.parallel=function(tasks,callback){
	var finishedCount=0;
	var errs=[];
	function finishedCbk(err){
		if(err){
			errs.push(err);
		}
		finishedCount++;
		if(finishedCount===tasks.length){
			if(errs.length>0){
				callback(errs);
			}else{
			callback();
			}
		}
	}
	tasks.forEach(function(item){
		item(finishedCbk);
	});
};

window.WUI.createProperty=function($tr, param,labelWidth,valueWidth) {
	var $td = $(document.createElement("td"));
	if(valueWidth){
		$td.css("width",valueWidth+"px");
	}
	var $unitTd=$('<td style="width:40px;"></td>');
	if(param.unit){
		$unitTd=$('<td style="width:40px;">'+param.unit+'</td>');
	}
	$tr.append('<td align="right" '+(labelWidth?'style="width:'+labelWidth+'px;"':'')+'>' + param.displayName + ':</td>', $td,$unitTd);
	var property = {
		key : param.name
	};

	switch (param.paramType) {
	case "BOOL": {
		property.$node = $(document.createElement("input"));
		property.$node.addClass("easyui-switchbutton");
		$td.append(property.$node);
		property.$node.switchbutton({
			width:valueWidth,
			onText : "是",
			offText : "否"
		});
		if(param.defaultValue){
			property.$node.switchbutton('setValue', param.defaultValue);			
		}
		property.setValue = function(value) {
			property.$node.switchbutton('setValue', value);
		};
		property.isValid = function() {
			return true;
		};
		property.getValue = function() {
			return property.$node.switchbutton('getValue');
		};
	}
		break;
	case "FLOAT": {
		property.$node = $(document.createElement("input"));
		property.$node.addClass("easyui-numberbox");
		$td.append(property.$node);
		property.$node.numberbox({
			width:valueWidth,
			precision : 3,
			required : param.required,
			min:(param.range &&param.range.lowerBound)?parseFloat(param.range.lowerBound):null,
			max:(param.range &&param.range.upperBound)?parseFloat(param.range.upperBound):null
		});
		if(param.defaultValue){
			property.$node.numberbox('setValue', param.defaultValue);			
		}
		property.setValue = function(value) {
			property.$node.numberbox('setValue', value);
		};
		property.isValid = function() {
			return property.$node.numberbox('isValid');
		};
		property.getValue = function() {
			return parseFloat(property.$node.numberbox('getValue'));
		};
	}
		break;
	case "INTEGER": {
		property.$node = $(document.createElement("input"));
		property.$node.addClass("easyui-numberbox");
		$td.append(property.$node);
		property.$node.numberbox({
			width:valueWidth,
			precision : 0,
			required : param.required,
			min:(param.range &&param.range.lowerBound)?parseInt(param.range.lowerBound,10):null,
			max:(param.range &&param.range.upperBound)?parseInt(param.range.upperBound,10):null
		});
		if(param.defaultValue){
			property.$node.numberbox('setValue', param.defaultValue);			
		}
		property.setValue = function(value) {
			property.$node.numberbox('setValue', value);
		};
		property.isValid = function() {
			return property.$node.numberbox('isValid');
		};
		property.getValue = function() {
			return parseInt(property.$node.numberbox('getValue'), 10);
		};
	}
		break;
	case "ENUMERATION": {
		property.$node = $(document.createElement("select"));
		property.$node.addClass("easyui-combobox");
		$td.append(property.$node);
		var params=[];
		for(key in param.enumOptions){
			params.push({
				key:key,
				value:param.enumOptions[key]
			});
		}
		
		property.$node.combobox({
			width:valueWidth,
			valueField :"key",
			textField : "value",
			editable : false,
			data : params,
			required : param.required
		});
		if(param.defaultValue){
			property.$node.combobox('setValue', param.defaultValue);			
		}
		property.setValue = function(value) {
			property.$node.combobox('setValue', value);
		};
		property.isValid = function() {
			return property.$node.combobox('isValid');
		};
		property.getValue = function() {
			return property.$node.combobox('getValue');
		};
	}
		break;
	case "DATE": {
		property.$node = $(document.createElement("input"));
		property.$node.addClass("easyui-datebox");
		$td.append(property.$node);
		property.$node.datebox({
			width:valueWidth,
			parser : WUI.date_parse,
			formatter : WUI.dateFormat,
			required : param.required
		});
		if(param.defaultValue){
			property.$node.datebox('setValue', param.defaultValue);			
		}
		property.setValue = function(value) {
			property.$node.datebox('setValue', value);
		};
		property.isValid = function() {
			return property.$node.datebox('isValid');
		};
		property.getValue = function() {
			return property.$node.datebox('getValue');
		};
	}
		break;
	case "DATETIME": {
		property.$node = $(document.createElement("input"));
		property.$node.addClass("easyui-datetimebox");
		$td.append(property.$node);
		property.$node.datetimebox({
			width:valueWidth,
			parser : WUI.date_parse,
			formatter : WUI.timeformat,
			required : param.required
		});
		if(param.defaultValue){
			property.$node.datetimebox('setValue', param.defaultValue);			
		}
		property.setValue = function(value) {
			property.$node.datetimebox('setValue', value);
		};
		property.isValid = function() {
			return property.$node.datetimebox('isValid');
		};
		property.getValue = function() {
			return property.$node.datetimebox('getValue');
		};
	}
		break;
	default: {
		property.$node = $(document.createElement("input"));
		property.$node.addClass("easyui-textbox");
		$td.append(property.$node);
		property.$node.textbox({
			width:valueWidth,
			required : param.required
		});
		if(param.defaultValue){
			property.$node.textbox('setValue', param.defaultValue);			
		}
		property.setValue = function(value) {
			property.$node.textbox('setValue', value);
		};
		property.isValid = function() {
			return property.$node.textbox('isValid');
		};
		property.getValue = function() {
			return property.$node.textbox('getValue');
		};
	}
		break;
	}

	return property;
};

WUI.setPropertiesValue=function(properties,paramValues) {
	properties.forEach(function(property) {
		property.setValue(paramValues[property.key]);
	});
};
WUI.isPropertiesValueValid=function(properties) {
	var isValid = true;
	properties.forEach(function(property) {
		isValid = isValid && property.isValid();
	});
	return isValid;
};
WUI.getPropertiesValue=function(properties) {
	var params = {};
	properties.forEach(function(property) {
		params[property.key] = property.getValue();
	});
	return params;
};

WUI.initBreadCrumbs=function($panel,objectNodeUrl,object) {
	var nodes = [ object ];
	function showBreadCrumbs() {
		$panel.empty();
		function addNode(node) {
			var $node = $(document.createElement("div"));
			$panel.prepend($node);
			$node.text(node.NAME);
			$node.addClass('bread-item');
			$node.click(function() {
				WUI.publishEvent('open_object', {
					publisher : 'bread-crumbs',
					object : node
				});
			});
			if (i !== 0) {
				$panel.prepend('<div class="bread-separator">>></div>');
			}
		}
		for (var i = nodes.length - 1; i >= 0; i--) {
			addNode(nodes[i]);
		}
	}
	function requestNode(id) {
		WUI.ajax.get(objectNodeUrl + id, {}, function(result) {
			nodes.splice(0, 0, result);
			if (result.PARENT_ID) {
				requestNode(result.PARENT_ID);
			} else {
				showBreadCrumbs();
			}
		}, function(s) {
			console.log(s);
			showBreadCrumbs();
		});
	}
	if (object.PARENT_ID) {
		requestNode(object.PARENT_ID);
	} else {
		showBreadCrumbs();
	}
};


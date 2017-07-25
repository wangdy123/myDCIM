$(document).ready(function() {
	if(WUI.navigationTreeInited){
		return;
	}
	WUI.navigationTreeInited=true;
	
	var objectNodeUrl = 'logicobject/objectNodes/';
	
	WUI.createNavTree($('#monitor-object-tree'), {
		eventEnable : true
	});
	WUI.createLogicObjectSeachBox({
		seachBox : $('#object-seach-box'),
		resultPanel : $('#seach-result-panel'),
		selectChange : function(object) {
			WUI.publishEvent('open_object', {
				publisher : "seach-box",
				object : object
			});
		},
		seachActive : function() {
			$('#navigation-tab').tabs('select', 1);
		}
	});
	var objectId = WUI.getParameterByName("objectId") || $.cookie('currentObjectId');
	if (objectId) {
		window.WUI.ajax.get(objectNodeUrl + objectId, {}, function(obj) {
			currentLogicObject = obj;
			WUI.publishEvent('open_object', {
				publisher : "apps",
				object : obj
			});
		});
	}
});

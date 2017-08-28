$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var statusUrl = 'monitor/childStatus';
	var publisherName = "detail";
	WUI.detail = WUI.detail || {};
	var childObjects = [];
	function openObject(object) {
		if(!object){
			return;
		}
		WUI.ajax.get(objectNodeUrl, {
			id : object.ID
		}, function(objects) {
			childObjects = objects;
			$("#child-object-panel").empty();
			for ( var i = 0; i < childObjects.length; i++) {
				WUI.detail.createObjectIcon($("#child-object-panel"), childObjects[i]);
			}
			requestStatus(object);
		}, function() {
			$.messager.alert('失败', "读取配置失败！");
		});
	}

	function findObject(objectId) {
		for ( var i = 0; i < childObjects.length; i++) {
			if (childObjects[i].ID === objectId) {
				return childObjects[i];
			}
		}
	}

	function requestStatus(object) {
		WUI.ajax.get(statusUrl, {
			id : object.ID
		}, function(status) {
			if (status && object && status.ID !== object.ID) {
				return;
			}
			for ( var i = 0; i < status.childObject.length; i++) {
				var object = findObject(status.childObject[i].ID);
				WUI.detail.setObjectStatus(object, status.childObject[i]);
			}
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : openObject
	});

});

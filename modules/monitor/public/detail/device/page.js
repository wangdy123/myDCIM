$(function() {
	var objectNodeUrl = 'logicobject/objectNodes';
	var publisherName = "detail";

	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			WUI.ajax.get(objectNodeUrl + "/" + object.ID, {}, function(deviceObject) {
				for (var i = 0; i < WUI.deviceTypes.length; i++) {
					if (WUI.deviceTypes[i].type === deviceObject.DEVICE_TYPE) {
						var namespace = WUI.objectTypes[WUI.objectTypeDef.DEVICE].namespace;
						var deviceNamespace = WUI.deviceTypes[i].namespace;
						$("#detail-container").panel({
							href : "monitor/detail/" + namespace + "/" + deviceNamespace + "/page.html",
							onLoadError : WUI.onLoadError
						});
						break;
					}
				}

			}, function() {
				var typeName = WUI.objectTypes[WUI.objectTypeDef.DEVICE].name;
				$.messager.alert('失败', "读取" + typeName + "失败！");
			});
		}
	});

});

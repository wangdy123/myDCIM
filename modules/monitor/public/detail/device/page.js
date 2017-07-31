$(function() {
	var publisherName = "detail";

	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(deviceObject) {
			var deviceType = WUI.findFromArray(WUI.deviceTypes, "type", deviceObject.DEVICE_TYPE);
			if (deviceType) {
				var namespace = WUI.objectTypes[WUI.objectTypeDef.DEVICE].namespace;
				var deviceNamespace = WUI.deviceTypes[i].namespace;
				$("#detail-container").panel({
					href : "monitor/detail/" + namespace + "/" + deviceNamespace + "/page.html",
					onLoadError : WUI.onLoadError
				});
			}
		}
	});

});

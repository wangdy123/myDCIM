$(document).ready(function() {
	var objectNodeUrl = 'logicobject/objectNodes/';
	WUI.monitor = WUI.monitor ? WUI.monitor : {};
	WUI.monitor.REALTIME_VALUE_INTEVAL = WUI.requestInteval.realtimeValue;

	if (WUI.monitor.inited) {
		return;
	}
	WUI.monitor.inited = true;

	var currentObject = null;
	function openObject(object) {
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}
		currentObject = object;

		//$("#workspace-title").text(object.NAME);
		if (object.OBJECT_TYPE === WUI.objectTypeDef.REGION) {
			$('#map-panel').panel({
				fit : true,
				closed : false,
				href : "monitor/map/map.html"
			});
			$('#detail-panel').panel("close");
		} else {
			$('#map-panel').panel("close");
			$('#detail-panel').panel({
				fit : true,
				closed : false,
				href : "monitor/detail/detail.html"
			});
		}
	}
	WUI.subscribe('open_object', function(event) {
		if (!event.object) {
			return;
		}
		openObject(event.object);
	}, "monitor");

	window.WUI.publishEvent('request_current_object', {
		publisher : "detail",
		cbk : function(object) {
			if (object) {
				openObject(object);
			}
		}
	});

});

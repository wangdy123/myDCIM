$(function() {
	WUI.detail = WUI.detail || {};
	var publisherName = "detail";

	WUI.detail.createObjectIcon = function($parentNode, object) {
		var $item = $(document.createElement("div"));
		$item.addClass("object-detail-item");
		$parentNode.append($item);
		$item.click(function() {
			WUI.publishEvent('open_object', {
				publisher : publisherName,
				object : object
			});
		});

		var $img = $(document.createElement("div"));
		$img.addClass("type" + object.OBJECT_TYPE);
		$item.append($img);
		$item.append('<div><label>' + object.NAME + '</label></div>');

		var $alarmNode = $(document.createElement("div"));
		$alarmNode.html('<label></label>');
		$item.append($alarmNode);
		object.alarmNode = $alarmNode;
	};

	WUI.detail.setObjectStatus = function(object, status) {
		if (!object) {
			return;
		}
		var html = '<label><div class="alarmLevel1-icon" title="一级告警"></div>' + status.alarmLevel1Count
				+ '<div class="alarmLevel2-icon" title="二级告警"></div>' + status.alarmLevel2Count
				+ '<div class="alarmLevel3-icon" title="三级告警"></div>' + status.alarmLevel3Count
				+ '<div class="alarmLevel4-icon" title="四级告警"></div>' + status.alarmLevel4Count + '</label>';
		object.alarmNode.html(html);
	};

	WUI.detail.createSignal = function($parentNode, signal) {

	};
	WUI.detail.setsignalValue = function(object, value) {

	};
});

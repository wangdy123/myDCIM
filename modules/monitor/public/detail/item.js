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
		$alarmNode.html('<label class="statusInvalid">告警统计:</label>');
		$item.append($alarmNode);
		object.alarmNode = $alarmNode;
	};

	WUI.detail.setObjectStatus = function(object, status) {
		if(!object){
			return;
		}
		object.alarmNode.html('<label class="alarmLevel' + status.maxAlarmLevel + '">告警统计:' + status.alarmCount + '</label>');
	};
	
});

$(function() {
	var currentObject = null;
	var pageUrl = 'detail/detailPage/';
	var publisherName = "detail";
	function openObject(object) {
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}
		currentObject = object;

		function openPage(page) {
			$("#detail-container").panel({
				href : "detail/page/" + page + "/page.html",
				onLoadError : WUI.onLoadError
			});
		}
		WUI.ajax.get(pageUrl + currentObject.ID, {}, function(result) {
			openPage(result.page);
		}, function(s) {
			$.messager.alert('失败', "打开页面失败！");
		});

	}
	WUI.subscribe('open_object', function(event) {
		openObject(event.object);
	}, "detail");

	window.WUI.publishEvent('request_current_object', {
		publisher : "detail",
		cbk : function(object) {
			if (object) {
				openObject(object);
			}
		}
	});

	WUI.detail = WUI.detail || {};

	function replaceAll(str, sptr, sptr1) {
		while (str.indexOf(sptr) >= 0) {
			str = str.replace(sptr, sptr1);
		}
		return str;
	}

	function replaceStr(s) {
		s = replaceAll(s, "\r\n", "<br>")
		s = replaceAll(s, "\n", "<br>")
		s = replaceAll(s, " ", "&nbsp")
		return s;
	}

	WUI.detail.setDescription = function($node, s) {
		if (s) {
			$node.html(replaceStr(s));
		}
	};
	WUI.detail.initImg = function($node, imgPath, object) {
		$node.attr("width", $node.parent().width());
		$node.attr("height", $node.parent().height());
		$node.attr("src", "detail/resources/" + imgPath);
		if (object) {
			$node.attr("alt", "打开3D");
			$node.css("cursor", "pointer");
			$node.click(function() {
				WUI.publishEvent('open_3D', {
					publisher : publisherName,
					object : object
				});
			});
		}
	};

	WUI.detail.createTableHead = function($tr, className, name) {
		$tr.append('<th class="' + className + '">' + name + '</th>');
	};

	WUI.detail.createTableItem = function($tr, signalId, config) {
		config.unit = config.unit || '';
		config.fixedNum = config.fixedNum || 0;
		var $td = $(document.createElement("td"));
		$td.addClass(config.className);
		var item = {
			$node : $td,
			signalId : signalId,
			type : config.type,
			unit : config.unit,
			fixedNum : config.fixedNum
		};
		$tr.append($td);
		if (config.type) {
			$td.text(config.unit);
		} else {
			$td.html('<div class="detail-statusInvalid-icon"></div>');
		}
		return item;
	};
	WUI.detail.setTableItemValue = function(item, value) {
		if (item.type) {
			item.$node.text(value.value.toFixed(item.fixedNum) + unit);
		} else {
			item.$node.html('<div class="' + (value.value ? "detail-on-icon" : "detail-off-icon") + '"></div>');
		}
	};
	WUI.detail.findValue = function(objectId, signalId, values) {
		for (var i = 0; i < values.length; i++) {
			if (values[i].objectId === objectId && values[i].signalId === signalId) {
				return values[i];
			}
		}
	}
});

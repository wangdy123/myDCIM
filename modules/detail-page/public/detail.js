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

	WUI.detail.createSignalItem = function($node, signalId, config, showName) {
		config.unit = config.unit || '';
		config.fixedNum = config.fixedNum || 0;
		var $div = $(document.createElement("div"));
		$div.addClass(config.className);
		var item = {
			signalId : signalId,
			type : config.type,
			unit : config.unit,
			fixedNum : config.fixedNum
		};
		$node.append($div);
		switch (config.type) {
		case WUI.signalTypeDef.AI:
			if (showName) {
				var $span = $(document.createElement("span"));
				$span.text(config.unit);
				$div.append(config.name + "：", $span);
				item.$node = $span;
			} else {
				$td.text(config.unit);
				item.$node = $div;
			}
			break;
		case WUI.signalTypeDef.DI:
		case WUI.signalTypeDef.ALARM:
			if (showName) {
				var $span = $(document.createElement("span"));
				$span.html('<div class="detail-statusInvalid-icon"></div>');
				$div.append(config.name + "：", $span);
				item.$node = $span;
			} else {
				$td.html('<div class="detail-statusInvalid-icon"></div>');
				item.$node = $div;
			}
			break;
		case WUI.signalTypeDef.AO:
		case WUI.signalTypeDef.DO: {
			var $btn = $(document.createElement("a"));
			$btn.addClass("easyui-linkbutton");
			$btn.linkbutton({
				text : config.name
			});
			$btn.linkbutton("onClick", function() {
				// TODO::add remote control operate
			});
			$div.append($btn);
			item.$node = $btn;
		}
		default:
			item.$node = $div;
			break;
		}
		return item;
	};

	WUI.detail.createTableItem = function($tr, signalId, config, showName) {
		config.unit = config.unit || '';
		config.fixedNum = config.fixedNum || 0;
		var $td = $(document.createElement("td"));
		$td.addClass(config.className);
		var item = {
			signalId : signalId,
			type : config.type,
			unit : config.unit,
			fixedNum : config.fixedNum
		};
		$tr.append($td);
		switch (config.type) {
		case WUI.signalTypeDef.AI:
			if (showName) {
				var $span = $(document.createElement("span"));
				$span.text(config.unit);
				$td.append(config.name + "：", $span);
				item.$node = $span;
			} else {
				$td.text(config.unit);
				item.$node = $td;
			}
			break;
		case WUI.signalTypeDef.DI:
		case WUI.signalTypeDef.ALARM:
			if (showName) {
				var $span = $(document.createElement("span"));
				$span.html('<div class="detail-statusInvalid-icon"></div>');
				$td.append(config.name + "：", $span);
				item.$node = $span;
			} else {
				$td.html('<div class="detail-statusInvalid-icon"></div>');
				item.$node = $td;
			}
			break;
		case WUI.signalTypeDef.AO:
		case WUI.signalTypeDef.DO: {
			var $btn = $(document.createElement("a"));
			$btn.addClass("easyui-linkbutton");
			$btn.linkbutton({
				text : config.name
			});
			$btn.linkbutton("onClick", function() {
				// TODO::add remote control operate
			});
		}
		default:
			item.$node = $td;
			break;
		}
		return item;
	};
	WUI.detail.setTableItemValue = function(item, value) {
		switch (config.type) {
		case WUI.signalTypeDef.AI:
			item.$node.text(value.value.toFixed(item.fixedNum) + unit);
			break;
		case WUI.signalTypeDef.DI:
		case WUI.signalTypeDef.ALARM:
			item.$node.html('<div class="' + (value.value ? "detail-on-icon" : "detail-off-icon") + '"></div>');
			break;
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

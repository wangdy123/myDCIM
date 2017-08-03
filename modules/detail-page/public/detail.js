$(function() {
	var currentObject = null;
	var pageUrl = 'detail/detailPage/';

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
	}
});

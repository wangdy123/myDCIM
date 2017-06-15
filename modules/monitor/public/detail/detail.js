$(function() {
	var currentObject = null;

	function openObject(object) {
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}
		currentObject = object;

		var namespace = WUI.objectTypes[currentObject.OBJECT_TYPE].namespace;
		$("#detail-container").panel({
			href : "monitor/detail/" + namespace + "/page.html",
			onLoadError : WUI.onLoadError
		});
	}

	WUI.subscribe('open_object', function(event) {
		openObject(event.object);
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

	WUI.detail.setHtml = function($node, s) {
		if (s) {
			$node.html(replaceStr(s));
		}
	}
});

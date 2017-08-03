$(document).ready(function() {
	var objectNodeUrl = 'logicobject/objectNodes/';

	if (WUI.configer_inited) {
		return;
	}
	WUI.configer_inited = true;
	var currentObject = null;
	WUI.subscribe('open_object', function(event) {
		openObject(event.object);
	}, "configer");

	WUI.getConfigerDialogPath = function(namespace) {
		return "position-configer/" + namespace + "/dialog.html";
	};

	function openObject(object) {
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}
		currentObject = object;
		initBreadCrumbs(object);

		while ($('#configer-tabs').tabs("tabs").length > 0) {
			var onetab = $('#configer-tabs').tabs("tabs")[0];
			var title = onetab.panel('options').tab.text();
			$('#configer-tabs').tabs("close", title);
		}
		var childTypes = WUI.objectTypes[object.OBJECT_TYPE].childTypes;
		for (var i = 0; i < childTypes.length; i++) {
			(function(type) {
				var childTypeCfg = WUI.objectTypes[type];
				$('#configer-tabs').tabs('add', {
					title : childTypeCfg.name,
					index : i,
					iconCls : childTypeCfg.iconCls,
					href : "position-configer/" + childTypeCfg.namespace + "/wokspace.html",
					onLoadError : WUI.onLoadError
				});
			})(childTypes[i]);
		}
		$('#configer-tabs').tabs('select', 0);
	}

	function initBreadCrumbs(object) {
		var nodes = [ object ];
		function showBreadCrumbs() {
			var $panel = $("#bread-crumbs-panel");
			$panel.empty();
			function addNode(node) {
				var $node = $(document.createElement("div"));
				$panel.prepend($node);
				$node.text(node.NAME);
				$node.addClass('bread-item');
				$node.click(function() {
					WUI.publishEvent('open_object', {
						publisher : 'bread-crumbs',
						object : node
					});
				});
				if (i !== 0) {
					$panel.prepend('<div class="bread-separator">>></div>');
				}
			}
			for (var i = nodes.length - 1; i >= 0; i--) {
				addNode(nodes[i]);
			}
		}
		function requestNode(id) {
			WUI.ajax.get(objectNodeUrl + id, {}, function(result) {
				nodes.splice(0, 0, result);
				if (result.PARENT_ID) {
					requestNode(result.PARENT_ID);
				} else {
					showBreadCrumbs();
				}
			}, function(s) {
				console.log(s);
				showBreadCrumbs();
			});
		}
		if (object.PARENT_ID) {
			requestNode(object.PARENT_ID);
		} else {
			showBreadCrumbs();
		}
	}
});

$(document).ready(function() {
	var objectNodeUrl = 'logicobject/objectNodes/';
	WUI.monitor = WUI.monitor ? WUI.monitor : {};
	WUI.monitor.REALTIME_VALUE_INTEVAL = WUI.requestInteval.realtimeValue;

	if (WUI.monitor.inited) {
		return;
	}
	WUI.monitor.inited = true;

	function openObject(object) {
		if (!object) {
			return;
		}
		initBreadCrumbs(object);

		$('#screen-panel').panel('close');
		if (object.OBJECT_TYPE === WUI.objectTypeDef.REGION) {
			$('#map-panel').panel({
				fit : true,
				closed : false
			});
			$('#detail-panel').panel("close");
		} else {
			$('#map-panel').panel("close");
			$('#detail-panel').panel('open');
		}
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

	WUI.subscribe('open_object', function(event) {
		if (!event.object) {
			return;
		}
		openObject(event.object);
	}, "monitor");

	WUI.subscribe('open_3D', function(event) {
		if (!event.object) {
			return;
		}
		$('#map-panel').panel("close");
		$('#detail-panel').panel("close");
		$('#screen-panel').panel('open');
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

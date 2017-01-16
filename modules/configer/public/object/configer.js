$(document).ready(function() {
	if (WUI.configer_inited) {
		return;
	}
	WUI.configer_inited = true;
	var currentObject = null;
	WUI.subscribe('open_object', function(event) {
		openObject(event.object);
	});

	function openObject(object) {
		if (currentObject && currentObject.ID === object.ID) {
			return;
		}
		currentObject = object;
		$("#workspace-title").text(currentObject.NAME);
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
					href : childTypeCfg.configerPage
				});
			})(childTypes[i]);
		}
		$('#configer-tabs').tabs('select',0);
	}
});
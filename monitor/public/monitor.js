$(document).ready(
		function() {
			WUI.subscribe('open_object', function(event) {
				if (!event.object) {
					return;
				}
				$("#workspace-title").text(event.object.NAME);

				var tab = $('#monitor-tabs').tabs('getSelected');
				var index = $('#monitor-tabs').tabs('getTabIndex', tab);

				if (event.publisher === "map" && event.object.OBJECT_TYPE === WUI.objectTypeDef.STATION_BASE
						&& index === 0) {
					$('#monitor-tabs').tabs('select', 1);
				}
				if (event.object.OBJECT_TYPE > WUI.objectTypeDef.STATION_BASE && index === 0) {
					$('#monitor-tabs').tabs('select', 1);
				}
			});
		});
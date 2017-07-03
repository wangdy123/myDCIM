$(document).ready(
		function() {
			var objectNodeUrl = 'logicobject/objectNodes/';
			WUI.monitor = WUI.monitor ? WUI.monitor : {};
			WUI.monitor.REALTIME_VALUE_INTEVAL=5000;
			
			if (!WUI.monitor.inited) {
				WUI.monitor.inited = true;
				if ($.cookie('enableMap')) {
					$('#monitor-tabs').tabs('add', {
						title : '地图导航',
						href : "monitor/map/map.html",
						iconCls : "icon-map",
						index : 0,
						selected : false
					});
				}
				if ($.cookie('enable3D')) {
					$('#monitor-tabs').tabs('add', {
						title : '组态',
						href : "monitor/screen/screen.html",
						iconCls : "icon-screen",
						index : 1,
						selected : false
					});
				}
			}
			WUI.subscribe('open_object', function(event) {
				if (!event.object) {
					return;
				}
				$("#workspace-title").text(event.object.NAME);

				var tab = $('#monitor-tabs').tabs('getSelected');
				var index = $('#monitor-tabs').tabs('getTabIndex', tab);

				if ($.cookie('enable3D')) {
					if (event.publisher === "map" && event.object.OBJECT_TYPE === WUI.objectTypeDef.STATION_BASE
							&& index === 0) {
						$('#monitor-tabs').tabs('select', 1);
					}
					if (event.object.OBJECT_TYPE > WUI.objectTypeDef.STATION_BASE && index === 0) {
						$('#monitor-tabs').tabs('select', 1);
					}
				}
				if(!event.object.PARENT_ID){
					$("#return-btn").hide();
				}else{
					$("#return-btn").show();				
				}
			});

			$("#return-btn").click(function() {
				WUI.publishEvent('request_current_object', {
					publisher : "monitor_panel",
					cbk : function(object) {
						if(!object){
							return;
						}
						window.WUI.ajax.get(objectNodeUrl + object.PARENT_ID, {}, function(parentObject) {
							WUI.publishEvent('open_object', {
								publisher : "monitor_panel",
								object : parentObject
							});
						});
					}
				});
			});
			var isFullScreen=false;
			$("#fullscreem-btn").click(function() {
				var target = $("#main-workspace");
				if (isFullScreen) {
					isFullScreen=false;
					WUI.exitFullscreen();
				} else {
					isFullScreen=true;
					WUI.fullscreen(target[0]);
				}
			});
		});

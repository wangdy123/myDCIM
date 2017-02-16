$(document).ready(function() {
	var publisherName = "map";
	var objectLocationUrl = WUI.urlPath + "/monitor/objectLocations";
	var treeNodeUrl = WUI.urlPath + '/navigation/treeNode';
	var iconUrl = WUI.urlPath + '/monitor/map-icon/';
	var map = new BMap.Map("map-container");
	var currentObject = null;
	var mapMakerPros = {
		1 : {
			name : "省中心",
			zoom : 8
		},
		2 : {
			name : "市区域",
			zoom : 11
		},
		3 : {
			name : "县区域",
			zoom : 13
		},
		4 : {
			name : "园区",
			zoom : 16
		}
	};
	var makers = {};

	map.centerAndZoom(new BMap.Point(113.30735, 23.146984), 14);// 8、11
	map.addControl(new BMap.NavigationControl());
	map.addControl(new BMap.ScaleControl());
	map.enableScrollWheelZoom();
	map.enableKeyboard();
	map.enablePinchToZoom();
	map.setMinZoom(8);

	function markObject(param) {
		function markerObject(objectLocation) {
			objectLocation.LONGITUDE = param.point.lng;
			objectLocation.LATITUDE = param.point.lat;
			WUI.ajax.put(objectLocationUrl + "/" + objectLocation.ID, objectLocation, function() {
				addMarker(objectLocation);
			}, function() {
				$.messager.alert('失败', "标记节点位置失败！");
			});
			console.log(objectLocation);
		}
		$('#map-object-select-dialog').dialog({
			title : "选择要标记的对象",
			left : ($(window).width() - 300) * 0.5,
			top : ($(window).height() - 300) * 0.5,
			width : 350,
			closed : false,
			cache : false,
			href : 'monitor/object-select-dialog.html',
			onLoadError : function() {
				$.messager.alert('失败', "对话框加载失败，请刷新后重试！");
			},
			onLoad : function() {
				$("#object-select-tree").tree({
					url : treeNodeUrl,
					method : 'get',
					lines : true,
					dnd : true,
					animate : true,
					onDblClick : function(node) {
						$('#map-object-select-dialog').dialog("close");
						markerObject(node.attributes.data);
					},
					loadFilter : function(datas, parent) {
						var objects = [];
						for (var i = 0; i < datas.length; i++) {
							objects.push({
								id : datas[i].ID,
								text : datas[i].NAME,
								state : (datas[i].OBJECT_TYPE < WUI.objectTypeDef.STATION_BASE) ? "closed" : "open",
								iconCls : WUI.objectTypes[datas[i].OBJECT_TYPE].iconCls,
								attributes : {
									data : datas[i]
								}
							});
						}
						return objects;
					},
					onLoadSuccess : function(node, data) {
						$("#object-select-tree").tree("expandAll");
					}
				});
			},
			modal : true,
			onClose : function() {
				$("#map-object-select-dialog").empty();
			},
			buttons : [ {
				text : '确定',
				handler : function() {
					var node = $("#object-select-tree").tree("getSelected");
					if (node) {
						$('#map-object-select-dialog').dialog("close");
						markerObject(node.attributes.data);
					}
				}
			}, {
				text : '取消',
				handler : function() {
					$('#map-object-select-dialog').dialog("close");
				}
			} ]
		});
	}
	map.addEventListener('rightclick', markObject);
	// map.addEventListener('longpress', markObject);

	function getObjectContent(objectLocation) {
		var content = "<b>" + objectLocation.NAME + "</b><br>";
		content += "<span><strong>类型：</strong>" + mapMakerPros[objectLocation.OBJECT_TYPE].name + "</span><br>";
		content += "<span><strong>计数：</strong>" + objectLocation.count + "</span><br>";
		return content;
	}
	function addMarker(objectLocation) {
		if(makers[objectLocation.ID]){
			map.removeOverlay(makers[objectLocation.ID]);
		}

		if (!objectLocation.LONGITUDE || !objectLocation.LATITUDE) {
			return;
		}
		var myIcon = new BMap.Icon(iconUrl + objectLocation.NAME + ".png", new BMap.Size(80, 25), {
			anchor : new BMap.Size(15, 25),
			infoWindowAnchor : new BMap.Size(25, 5)
		});
		var marker = new BMap.Marker(new BMap.Point(objectLocation.LONGITUDE, objectLocation.LATITUDE), {
			icon : myIcon
		});

		map.addOverlay(marker);
		objectLocation.count = 0;
		var infoWindow = new BMap.InfoWindow(getObjectContent(objectLocation));
		marker.addEventListener('mouseover', function() {
			objectLocation.count++;
			infoWindow.setContent(getObjectContent(objectLocation));
			marker.openInfoWindow(infoWindow);
		});
		marker.addEventListener('mouseout', function() {
			marker.closeInfoWindow();
		});
		marker.addEventListener('click', function() {
			openObject(objectLocation, true);
		});
		makers[objectLocation.ID] = marker;
	}

	function hightLight(object) {
		map.setCenter(new BMap.Point(object.LONGITUDE, object.LATITUDE));
		map.setZoom(mapMakerPros[object.OBJECT_TYPE].zoom);
		var infoWindow = new BMap.InfoWindow(getObjectContent(object));
		if (makers[object.ID]) {
			makers[object.ID].openInfoWindow(infoWindow);
		} else {
			openObject({
				ID : object.PARENT_ID
			}, false, function() {
				hightLight(object);
			});
		}
	}

	// 获取当前点，如果为区域则显示区域内子区域及站点
	// 如果为站点则高亮显示站点信息（显示大图标及基本信息）
	function openObject(object, needPublish, callback) {
		if (needPublish) {
			window.WUI.publishEvent("open_object", {
				publisher : publisherName,
				object : object
			});
		}
		if (object && object.OBJECT_TYPE && !mapMakerPros[object.OBJECT_TYPE]) {
			return;
		}
		var objectId = object ? ("/" + object.ID) : "";
		window.WUI.ajax.get(objectLocationUrl + objectId, {}, function(objectLocation) {
			if (!objectLocation.LONGITUDE || !objectLocation.LATITUDE) {
				return;
			}
			if (objectLocation && objectLocation.OBJECT_TYPE === 4) {
				hightLight(objectLocation);
			} else {
				makers = {};
				map.clearOverlays();
				map.setCenter(new BMap.Point(objectLocation.LONGITUDE, objectLocation.LATITUDE));
				map.setZoom(mapMakerPros[objectLocation.OBJECT_TYPE].zoom);
				for (var i = 0; i < objectLocation.childLocations.length; i++) {
					addMarker(objectLocation.childLocations[i]);
				}
			}
			if (callback) {
				callback();
			}
		});
	}
	WUI.subscribe('open_object', function(event) {
		openObject(event.object);
	});
	openObject();
});
$(function() {
	var publisherName = "map";
	var objectLocationUrl = "monitor/objectLocations";
	var treeNodeUrl = 'monitor/treeNode';
	var iconUrl = 'monitor/map-icon/';

	var mapPicDir = "roadmap/";
	var currentObject = null;

	function isMapPoint(object) {
		return [ WUI.objectTypeDef.REGION, WUI.objectTypeDef.STATION_BASE ].indexOf(object.OBJECT_TYPE) >= 0;
	}
	function getMakerPro(objectLocation) {
		if (objectLocation.OBJECT_TYPE === WUI.objectTypeDef.STATION_BASE) {
			return {
				name : "园区",
				zoom : 15
			};
		}
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
				zoom : 12
			}
		};
		if (objectLocation.OBJECT_TYPE === WUI.objectTypeDef.REGION) {
			return mapMakerPros[objectLocation.REGION_TYPE];
		}
	}
	var makers = {};
	var map = new google.maps.Map(document.getElementById("map-container"), {
		zoom : WUI.mapCfg.defaultZoom, // 初始化地图缩放级别。
		center : new google.maps.LatLng(WUI.mapCfg.LATITUDE, WUI.mapCfg.LONGITUDE), // 初始化地图中心坐标。
		panControl : true, // 平移控件的初始启用/停用状态
		zoomControl : true, // 缩放控件的初始启用/停用状态。
		mapTypeControl : false, // 地图类型控件的初始启用/停用状态。
		scaleControl : true, // 比例尺控件的初始启用/停用状态。
		streetViewControl : true,
		overviewMapControl : true,
		noClear : true,
		draggable : true
	// 如果为 false，则禁止拖动地图。默认情况下启用拖动。
	});// 创建一个地图
	map.mapTypes.set('localMap', {
		tileSize : new google.maps.Size(256, 256),
		maxZoom : WUI.mapCfg.maxZoom,
		minZoom : WUI.mapCfg.minZoom,
		name : "本地地图",
		alt : "显示本地地图数据",
		getTile : function(coord, zoom, ownerDocument) {
			var img = ownerDocument.createElement("img");
			img.style.width = this.tileSize.width + "px";
			img.style.height = this.tileSize.height + "px";
			var curSize = Math.pow(2, zoom);
			strURL = mapPicDir + zoom + "/" + (coord.x % curSize) + "/" + (coord.y % curSize) + ".png";
			img.src = strURL;
			return img;
		}
	}); // 绑定本地地图类型

	map.setMapTypeId('localMap'); // 指定显示本地地图

	function markObject(param) {
		function markerObject(objectLocation) {
			objectLocation.LONGITUDE = param.latLng.e;
			objectLocation.LATITUDE = param.latLng.d;
			WUI.ajax.put(objectLocationUrl + "/" + objectLocation.ID, objectLocation, function() {
				addMarker(objectLocation);
			}, function() {
				$.messager.alert('失败', "标记节点位置失败！");
			});
		}

		WUI.openNodeSelectDialog($("#map-object-select-dialog"), {
			onSelect : function(data) {
				markerObject(data);
			},
			isLeaf : function(data) {
				return [ WUI.objectTypeDef.REGION ].indexOf(data.OBJECT_TYPE) < 0;
			}
		});
	}
	if (WUI.hasRight(2)) {
		map.addListener('rightclick', markObject);
	}
	function setCenter(objectLocation) {
		map.panTo(new google.maps.LatLng(objectLocation.LATITUDE, objectLocation.LONGITUDE));
		map.setZoom(getMakerPro(objectLocation).zoom);
	}

	function getObjectContent(objectLocation) {
		var content = '<table><tr><td colspan="8"><b style="font-size:18px;lineheight:24px;">' + objectLocation.NAME
				+ '</b></td></tr>' + '<tr><td align="right" colspan="6"><label>节点类型：</label></td><td>'
				+ getMakerPro(objectLocation).name + '</td></tr>'
				+ '<tr><td align="right" colspan="6"><label>编码：</label></td><td>' + objectLocation.CODE + '</td></tr>'
				+ '<tr><td align="right" colspan="6"><label>数据中心机楼：</label></td><td>' + objectLocation.buildingCount
				+ '</td></tr>' + '<tr><td align="right" colspan="6"><label>数据中心机楼：</label></td><td>'
				+ objectLocation.buildingCount + '</td></tr>'
				+ '<tr><td align="right" colspan="6"><label>数据中心机房：</label></td><td>' + objectLocation.roomCount
				+ '</td></tr>' + '<tr><td align="right" colspan="6"><label>总机架数：</label></td><td>'
				+ objectLocation.cabinetCount + '</td></tr>' + '<tr><td colspan="8"><label>该区域告警统计</label></td></tr>'
				+ '<tr><td><div class="alarmLevel1-icon" title="一级告警"></div></td><td>'
				+ objectLocation.alarmLevel1Count + '</td>'
				+ '<td><div class="alarmLevel2-icon" title="二级告警"></div></td><td>' + objectLocation.alarmLevel2Count
				+ '</td>' + '<td><div class="alarmLevel3-icon" title="三级告警"></div></td><td>'
				+ objectLocation.alarmLevel3Count + '</td>'
				+ '<td><div class="alarmLevel4-icon" title="四级告警"></div></td><td>' + objectLocation.alarmLevel4Count
				+ '</td></tr></table>';
		return content;
	}

	function addMarker(objectLocation) {
		if (makers[objectLocation.ID]) {
			makers[objectLocation.ID].marker.setMap(null);
		}
		if (!objectLocation.LONGITUDE || !objectLocation.LATITUDE) {
			return;
		}
		var marker = new google.maps.Marker({
			map : map,
			icon : iconUrl + objectLocation.NAME + ".png",
			position : new google.maps.LatLng(objectLocation.LATITUDE, objectLocation.LONGITUDE),
			title : objectLocation.NAME
		});
		var infowindow = setInfoWindow(marker, objectLocation);
		makers[objectLocation.ID] = {
			marker : marker,
			infowindow : infowindow
		};
	}

	function setInfoWindow(marker, objectLocation) {
		google.maps.event.addListener(marker, 'click', function(p) {
			openObject(objectLocation, true);
		});

		var infowindow = new google.maps.InfoWindow({// 定义一个窗口，当点击时弹出该窗口
			content : getObjectContent(objectLocation)
		});
		google.maps.event.addListener(marker, 'mouseover', function() {
			infowindow.open(map, marker);
		});

		google.maps.event.addListener(marker, 'mouseout', function() {
			infowindow.close();
		});
		return infowindow;
	}
	function hightLight(object) {
		setCenter(object);
		if (makers[object.ID]) {
			makers[object.ID].infowindow.open(map, makers[object.ID].marker);
		} else {
			openObject({
				ID : object.PARENT_ID
			}, false, function() {
				hightLight(object);
			});
		}
	}

	function clearOverlays() {
		for (ID in makers) {
			makers[ID].marker.setMap(null);
			// map.removeOverlay(makers[ID].marker);
		}
		makers = {};
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
		if (object && object.OBJECT_TYPE && !isMapPoint(object)) {
			return;
		}
		var objectId = object ? ("/" + object.ID) : "";
		window.WUI.ajax.get(objectLocationUrl + objectId, {}, function(objectLocation) {
			if (!objectLocation.LONGITUDE || !objectLocation.LATITUDE) {
				return;
			}
			$("#building-count").text(objectLocation.buildingCount);
			$("#room-count").text(objectLocation.roomCount);
			$("#cabinet-count").text(objectLocation.cabinetCount);
			$("#alarmLevel1-count").text(objectLocation.alarmLevel1Count);
			$("#alarmLevel2-count").text(objectLocation.alarmLevel2Count);
			$("#alarmLevel3-count").text(objectLocation.alarmLevel3Count);
			$("#alarmLevel4-count").text(objectLocation.alarmLevel4Count);
			if (objectLocation && objectLocation.OBJECT_TYPE === WUI.objectTypeDef.STATION_BASE) {
				hightLight(objectLocation);
			} else {
				clearOverlays();
				setCenter(objectLocation);
				for (var i = 0; i < objectLocation.childLocations.length; i++) {
					addMarker(objectLocation.childLocations[i]);
				}
			}
			if (callback) {
				callback();
			}
		});
	}
	// WUI.subscribe('open_object', function(event) {
	// if (!event.object) {
	// return;
	// }
	// openObject(event.object);
	// }, "map");
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			openObject(object);
		}
	});
});
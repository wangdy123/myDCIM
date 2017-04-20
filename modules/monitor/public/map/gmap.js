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
			console.log(objectLocation);
		}

		WUI.openNodeSelectDialog($("#map-object-select-dialog"), {
			onSelect : function(data) {
				markerObject(data);
			},
			isLeaf : function(data) {
				return [ WUI.objectTypeDef.REGION, WUI.objectTypeDef.STATION_BASE ].indexOf(data.OBJECT_TYPE) < 0;
			}
		});
	}
	map.addListener('rightclick', markObject);

	function setCenter(objectLocation) {
		map.panTo(new google.maps.LatLng(objectLocation.LATITUDE, objectLocation.LONGITUDE));
		map.setZoom(getMakerPro(objectLocation).zoom);
	}

	function getObjectContent(objectLocation) {
		var content = "<p style='font-size:12px;lineheight:1.8em;'><b>" + objectLocation.NAME + "</b><br>";
		content += "<span><strong>类型：</strong>" + getMakerPro(objectLocation).name + "</span><br>";
		content += "<span><strong>计数：</strong>" + objectLocation.count + "</span><br></p>";
		return content;
	}

	function addMarker(objectLocation) {
		if (makers[objectLocation.ID]) {
			makers[objectLocation.ID].marker.setMap(null);
			// map.removeOverlay(makers[objectLocation.ID].marker);
		}
		if (!objectLocation.LONGITUDE || !objectLocation.LATITUDE) {
			return;
		}
		var marker = new google.maps.Marker({
			map : map,
			// icon : iconUrl + objectLocation.NAME + ".png"
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
	WUI.subscribe('open_object', function(event) {
		openObject(event.object);
	});
	openObject();
});
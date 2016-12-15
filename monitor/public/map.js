$(document).ready(function() {
	var objectLocationUrl = "/monitor/objectLocations";
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
	map.setMinZoom(8);

	function getObjectContent(objectLocation) {
		var content = "<b>" + objectLocation.NAME + "</b><br>";
		content += "<span><strong>类型：</strong>" + mapMakerPros[objectLocation.OBJECT_TYPE].name + "</span><br>";
		content += "<span><strong>计数：</strong>" + objectLocation.count + "</span><br>";
		return content;
	}
	function addMarker(objectLocation) {
		if (!objectLocation.LONGITUDE || !objectLocation.LATITUDE) {
			return;
		}
		var marker = new BMap.Marker(new BMap.Point(objectLocation.LONGITUDE, objectLocation.LATITUDE));
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

	function openObject(object, needPublish, callback) {
		// 获取当前点，如果为区域则显示区域内子区域及站点
		// 如果为站点则高亮显示站点信息（显示大图标及基本信息）

		if (needPublish) {
			window.WUI.publishEvent("open_object", object);
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
	WUI.subscribe('open_object', openObject);
	openObject();
});
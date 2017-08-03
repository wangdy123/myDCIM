$(document).ready(
		function() {
			var stationProfileUrl = 'detail/stationProfile/';
			var statusUrl = 'detail/stationStatus/';
			var stationEnergyTopUrl = 'detail/stationEnergyTop/';
			var stationEnergyUrl = 'detail/stationEnergy/';
			var publisherName = "detail";
			var currentObject = null;

			WUI.detail = WUI.detail || {};
			var puePie = null;
			var powerPie = null;
			function openObject(stationObject) {
				currentObject = stationObject;
				initProfile();
				puePie = new WUI.PuePie('station-pue-pie');
				powerPie = new WUI.PowerPie('station-power-pie');
				WUI.initPowerTopAxis('station-power-top-axis', stationEnergyTopUrl + currentObject.ID);
				WUI.initPowerLine('station-power-line', stationEnergyUrl + currentObject.ID);
				requestStatus();
			}

			function requestStatus() {
				if (WUI.detail.realtimeValueTimer) {
					clearTimeout(WUI.detail.realtimeValueTimer);
					WUI.detail.realtimeValueTimer = null;
				}
				WUI.ajax.get(statusUrl + currentObject.ID, {}, function(status) {
					WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
					$("#station-totol-energy").text(status.totolEnergy.toFixed(2));
					$("#station-it-energy").text(status.itEnergy.toFixed(2));
					$("#station-temperature").text(status.temperature.toFixed(2));
					$("#station-humidity").text(status.humidity.toFixed(2));
					$("#station-maxPower").text(status.maxPower.toFixed(2));
					$("#station-minPower").text(status.minPower.toFixed(2));

					$("#station-alarm-count").text(
							status.alarmLevel1Count + status.alarmLevel2Count + status.alarmLevel3Count
									+ status.alarmLevel4Count);
					$("#station-alarmLevel1-count").text(status.alarmLevel1Count);
					$("#station-alarmLevel2-count").text(status.alarmLevel2Count);
					$("#station-alarmLevel3-count").text(status.alarmLevel3Count);
					$("#station-alarmLevel4-count").text(status.alarmLevel4Count);

					if (puePie) {
						puePie.setValue(status.pue);
					}
					if (powerPie) {
						powerPie.setValue(status.energyStructure);
					}
				}, function() {
					WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
				});
			}

			function initProfile() {
				WUI.ajax.get(stationProfileUrl + currentObject.ID, {}, function(profile) {
					WUI.detail.setDescription($('#id-station-profile'), currentObject.NAME + '占地面积'
							+ currentObject.AREA + '平方米，位于' + currentObject.ADDRESS + '，共有' + profile.BUILDING
							+ '栋数据机楼，其中数据机房共' + profile.IDC_ROOM + '个，配套用电和空调机房共' + profile.SUPPORT_ROOM + '个，总机架数'
							+ profile.CABINET + '个。\n' + currentObject.DESCRIPTION);
					$("#station-img").attr("width", $("#station-img").parent().width());
					$("#station-img").attr("height", $("#station-img").parent().height());
					$("#station-img").attr("src", "detail/images/" + profile.img);

					$("#station-img").attr("alt", "打开3D");
					$("#station-img").css("cursor", "pointer");
					$("#station-img").click(function() {
						WUI.publishEvent('open_3D', {
							publisher : publisherName,
							object : currentObject
						});
					});
				});
			}

			window.WUI.publishEvent('request_current_object', {
				publisher : publisherName,
				cbk : function(object) {
					openObject(object);
				}
			});

		});

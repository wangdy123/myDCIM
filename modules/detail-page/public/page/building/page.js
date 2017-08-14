$(document).ready(
		function() {
			var buildingProfileUrl = 'detail/buildingProfile/';
			var statusUrl = 'detail/buildingStatus/';
			var buildingEnergyTopUrl = 'detail/buildingEnergyTop/';
			var buildingEnergyUrl = 'detail/buildingEnergy/';
			var pageConfigUrl = 'detail/pageConfig/';
			var publisherName = "detail";
			var currentObject = null;

			WUI.detail = WUI.detail || {};
			var puePie = null;
			var powerPie = null;

			var pageConfig = {};
			function openObject(stationObject) {
				currentObject = stationObject;
				WUI.ajax.get(pageConfigUrl + currentObject.ID, {}, createPage, function() {
					createPage({
						img : 'u501.png',
						temperature : {
							objectId : 4,
							signalId : 1
						},
						humidity : {
							objectId : 4,
							signalId : 1
						}
					});
				});

			}
			function createPage(config) {
				pageConfig = config;
				WUI.detail.initImg($("#building-img"), pageConfig.img, currentObject);
				initProfile();
				puePie = new WUI.PuePie('building-pue-pie');
				powerPie = new WUI.PowerPie('building-power-pie');
				WUI.initPowerTopAxis('building-power-top-axis', buildingEnergyTopUrl + currentObject.ID);
				WUI.initPowerLine('building-power-line', buildingEnergyUrl + currentObject.ID);
				requestStatus();
			}
			function requestStatus() {
				if (WUI.detail.realtimeValueTimer) {
					clearTimeout(WUI.detail.realtimeValueTimer);
					WUI.detail.realtimeValueTimer = null;
				}
				WUI.ajax.get(statusUrl + currentObject.ID, {}, function(status) {
					WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
					$("#building-totol-energy").text(status.totolEnergy.toFixed(2));
					$("#building-it-energy").text(status.itEnergy.toFixed(2));
					$("#building-temperature").text(status.temperature.toFixed(2));
					$("#building-humidity").text(status.humidity.toFixed(2));
					$("#building-maxPower").text(status.maxPower.toFixed(2));
					$("#building-minPower").text(status.minPower.toFixed(2));

					$("#building-alarm-count").text(
							status.alarmLevel1Count + status.alarmLevel2Count + status.alarmLevel3Count
									+ status.alarmLevel4Count);
					$("#building-alarmLevel1-count").text(status.alarmLevel1Count);
					$("#building-alarmLevel2-count").text(status.alarmLevel2Count);
					$("#building-alarmLevel3-count").text(status.alarmLevel3Count);
					$("#building-alarmLevel4-count").text(status.alarmLevel4Count);

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
				WUI.ajax.get(buildingProfileUrl + currentObject.ID, {}, function(profile) {
					WUI.detail.setDescription($('#id-building-profile'), currentObject.NAME + '，共有数据机房共'
							+ profile.IDC_ROOM + '个，配套用电和空调机房共' + profile.SUPPORT_ROOM + '个，总机架数' + profile.CABINET
							+ '个。\n' + currentObject.DESCRIPTION);
				});
			}

			window.WUI.publishEvent('request_current_object', {
				publisher : publisherName,
				cbk : function(object) {
					openObject(object);
				}
			});

		});

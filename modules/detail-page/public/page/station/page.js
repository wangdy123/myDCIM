$(document).ready(
		function() {
			var stationProfileUrl = 'detail/stationProfile/';
			var statusUrl = 'detail/stationStatus/';
			var stationEnergyTopUrl = 'detail/stationEnergyTop/';
			var stationEnergyUrl = 'detail/stationEnergy/';
			var pageConfigUrl = 'detail/pageConfig/';
			var publisherName = "detail";
			var currentObject = null;

			WUI.detail = WUI.detail || {};
			var puePie = null;
			var powerPie = null;
			var pageConfig = {};
			function openObject(stationObject) {
				currentObject = stationObject;
				WUI.ajax.get(pageConfigUrl + currentObject.ID, {}, createPage, function(s) {
					$.messager.alert('失败', "未配置页面，请联系业务配置人员！");
				});
			}
			function createPage(config) {
				pageConfig = config.CONFIG;
				initProfile();
				puePie = new WUI.PuePie('station-pue-pie');
				powerPie = new WUI.PowerPie('station-power-pie');
				WUI.initPowerTopAxis('station-power-top-axis', stationEnergyTopUrl + currentObject.ID);
				WUI.initPowerLine('station-power-line', stationEnergyUrl + currentObject.ID);
				WUI.detail.initImg($("#station-img"), pageConfig.img, currentObject);
				requestStatus();
			}
			function requestStatus() {
				if (WUI.detail.realtimeValueTimer) {
					clearTimeout(WUI.detail.realtimeValueTimer);
					WUI.detail.realtimeValueTimer = null;
				}
				WUI.ajax.post(statusUrl + currentObject.ID, {
					temperature : pageConfig.temperature,
					temperature : pageConfig.humidity
				}, function(status) {
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
				});
			}

			window.WUI.publishEvent('request_current_object', {
				publisher : publisherName,
				cbk : function(object) {
					openObject(object);
				}
			});

		});

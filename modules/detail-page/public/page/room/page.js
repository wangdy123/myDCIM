$(document).ready(
		function() {
			var roomProfileUrl = 'detail/roomProfile/';
			var statusUrl = 'detail/roomStatus/';
			var roomEnergyUrl = 'detail/roomEnergy/';
			var pageConfigUrl = 'detail/pageConfig/';
			var publisherName = "detail";
			var currentObject = null;

			WUI.detail = WUI.detail || {};
			var puePie = null;
			var pageConfig = {};
			function openObject(bject) {
				currentObject = bject;
				WUI.ajax.get(pageConfigUrl + currentObject.ID, {}, createPage, function() {
					createPage({
						img : 'u796.jpg'
					});
				});

			}
			function createPage(config) {
				pageConfig = config;
				WUI.detail.initImg($("#room-img"), pageConfig.img, currentObject);
				initProfile();
				puePie = new WUI.PuePie('room-pue-pie');
				WUI.initPowerLine('room-power-line', roomEnergyUrl + currentObject.ID);
				requestStatus();
			}
			function requestStatus() {
				if (WUI.detail.realtimeValueTimer) {
					clearTimeout(WUI.detail.realtimeValueTimer);
					WUI.detail.realtimeValueTimer = null;
				}
				WUI.ajax.post(statusUrl + currentObject.ID, {}, function(status) {
					WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
					$("#room-totol-energy").text(status.totolEnergy.toFixed(2));
					$("#room-it-energy").text(status.itEnergy.toFixed(2));
					$("#room-maxPower").text(status.maxPower.toFixed(2));
					$("#room-minPower").text(status.minPower.toFixed(2));

					$("#room-alarm-count").text(
							status.alarmLevel1Count + status.alarmLevel2Count + status.alarmLevel3Count
									+ status.alarmLevel4Count);
					$("#room-alarmLevel1-count").text(status.alarmLevel1Count);
					$("#room-alarmLevel2-count").text(status.alarmLevel2Count);
					$("#room-alarmLevel3-count").text(status.alarmLevel3Count);
					$("#room-alarmLevel4-count").text(status.alarmLevel4Count);

					if (puePie) {
						puePie.setValue(status.pue);
					}

				}, function() {
					WUI.detail.realtimeValueTimer = setTimeout(requestStatus, WUI.monitor.REALTIME_VALUE_INTEVAL);
				});
			}

			function initProfile() {
				$("#room-name").text(currentObject.NAME);
				$("#room-code").text(currentObject.CODE);
				$("#room-type").text(WUI.roomTypes[currentObject.ROOM_TYPE]);
				$("#room-cabinet-count").text(currentObject.CABINET_COUNT);

				WUI.ajax.get(roomProfileUrl + currentObject.ID, {}, function(profile) {
					$("#room-safety-person").text(profile.safetyPerson);
					$("#room-department").text(profile.department);
				});
			}

			window.WUI.publishEvent('request_current_object', {
				publisher : publisherName,
				cbk : function(object) {
					openObject(object);
				}
			});

		});

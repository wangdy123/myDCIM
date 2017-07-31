$(function() {
	var buildingProfileUrl = 'monitor/buildingProfile/';
	var statusUrl = 'monitor/buildingStatus/';
	var buildingEnergyTopUrl = 'monitor/buildingEnergyTop/';
	var buildingEnergyUrl = 'monitor/buildingEnergy/';
	var publisherName = "detail";
	var currentObject = null;

	WUI.detail = WUI.detail || {};
	var puePie = null;
	var powerPie = null;
	function openObject(buildingObject) {
		currentObject = buildingObject;
		initProfile();
		puePie = new PuePie();
		powerPie = new PowerPie();
		initPowerTopAxis();
		initPowerLine();
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
			WUI.detail.setDescription($('#id-building-profile'), currentObject.NAME + '，共有数据机房共' + profile.IDC_ROOM
					+ '个，配套用电和空调机房共' + profile.SUPPORT_ROOM + '个，总机架数' + profile.CABINET + '个。\n'
					+ currentObject.DESCRIPTION);
			$("#building-img").attr("width", $("#building-img").parent().width());
			$("#building-img").attr("height", $("#building-img").parent().height());
			$("#building-img").attr("src", "monitor/detail/images/" + profile.img);

			$("#building-img").attr("alt", "打开3D");
			$("#building-img").css("cursor", "pointer");
			$("#building-img").click(function() {
				WUI.publishEvent('open_3D', {
					publisher : publisherName,
					object : currentObject
				});
			});
		});
	}

	function PowerPie() {
		var option = {
			title : {
				text : '当前能耗',
				x : 'center'
			},
			series : [ {
				name : '当前能耗',
				type : 'pie',
				radius : '55%',
				stillShowZeroSum : false,
				center : [ '50%', '60%' ],
				label : {
					emphasis : {
						formatter : '{b}:{c}kw({d}%)'
					}
				},
				itemStyle : {
					emphasis : {
						shadowBlur : 10,
						shadowOffsetX : 0,
						shadowColor : 'rgba(0, 0, 0, 0.5)'
					}
				}
			} ]
		};
		this.chart = echarts.init(document.getElementById('building-power-pie'));

		this.setValue = function(values) {
			var itemValues = [];
			values.forEach(function(value) {
				var type = WUI.findFromArray(WUI.energyConsumptionType, "type", value.type);
				if (type) {
					itemValues.push({
						value : value.value,
						name : type.name
					});
				}
			});
			option.series[0].data = itemValues;
			this.chart.setOption(option, true);
		}
	}
	function PuePie() {
		var option = {
			series : [ {
				name : '能耗指标',
				radius : '90%',
				type : 'gauge',
				min : 0,
				max : 3,
				splitNumber : 11,
				axisLine : {
					lineStyle : {
						width : 10
					}
				},
				axisTick : {
					length : 15,
					lineStyle : {
						color : 'auto'
					}
				},
				splitLine : {
					length : 20,
					lineStyle : {
						color : 'auto'
					}
				},
				title : {
					textStyle : {
						fontWeight : 'bolder',
						fontSize : 20,
						fontStyle : 'italic'
					}
				},
				detail : {
					formatter : '{value}',
					textStyle : {
						fontWeight : 'bolder'
					}
				},
				splitNumber : 6,
				data : [ {
					value : 0,
					name : 'PUE'
				} ]
			} ]
		};
		this.chart = echarts.init(document.getElementById('building-pue-pie'));
		this.setValue = function(value) {
			option.series[0].data[0].value = value;
			this.chart.setOption(option, true);
		}
	}
	function initPowerTopAxis() {
		var option = {
			title : {
				text : '当日用能排行榜',
				x : 'center'
			},
			color : [ '#3398DB' ],
			grid : {
				left : '3%',
				right : '4%',
				bottom : '3%',
				containLabel : true
			},
			xAxis : [ {
				type : 'category',
				data : [],
				axisTick : {
					alignWithLabel : true
				}
			} ],
			yAxis : [ {
				type : 'value',
				name : 'kwh'
			} ],
			series : [ {
				name : '当日用能',
				type : 'bar',
				barWidth : '60%',
				label : {
					normal : {
						show : true,
						formatter : '{c}'
					}
				},
				data : []
			} ]
		};
		var chart = echarts.init(document.getElementById('building-power-top-axis'));

		WUI.ajax.get(buildingEnergyTopUrl + currentObject.ID, {}, function(energyTops) {
			option.xAxis[0].data = [];
			option.series[0].data = [];
			energyTops.forEach(function(item) {
				option.xAxis[0].data.push(item.name);
				option.series[0].data.push(item.value);
			});
			chart.setOption(option, true);
		});
	}
	function initPowerLine() {
		var option = {
			title : {
				text : '24小时能耗走势',
				x : 'center'
			},
			legend : {
				top : '30',
				data : []
			},
			xAxis : {
				type : 'category',
				boundaryGap : false,
				data : []
			},
			yAxis : {
				type : 'value',
				axisLabel : {
					formatter : '{value}',
					name : 'kwh'
				}
			},
			series : []
		};
		var chart = echarts.init(document.getElementById('building-power-line'));

		WUI.ajax.get(buildingEnergyUrl + currentObject.ID, {}, function(energys) {
			var legends = [];
			var series = {};

			WUI.energyConsumptionType.forEach(function(item) {
				legends.push(item.name);
				series[item.type] = [];
			});

			energys.sort(function(a, b) {
				return a.time > b.time;
			});
			var xAxis = [];
			var currentTime = null;
			var types = {};
			energys.forEach(function(item) {
				var time = WUI.timeformat(item.time, "dd日hh时");
				if (currentTime == time) {
					if (!types[item.type]) {
						series[item.type].push(item.value);
						types[item.type] = true;
					}
				} else {
					if (currentTime) {
						WUI.energyConsumptionType.forEach(function(item) {
							if (!types[item.type]) {
								series[item.type].push(null);
							}
							types[item.type] = false;
						});
					}
					currentTime = time;
					xAxis.push(time);
					series[item.type].push(item.value);
					types[item.type] = true;
				}
			});
			option.legend.data = legends;
			option.xAxis.data = xAxis;
			option.series = [];
			WUI.energyConsumptionType.forEach(function(item) {
				option.series.push({
					name : item.name,
					type : 'line',
					data : series[item.type],
					markPoint : {
						data : [ {
							type : 'max',
							name : '最大值'
						}, {
							type : 'min',
							name : '最小值'
						} ]
					}
				});
			});
			chart.setOption(option, true);
		});
	}
	window.WUI.publishEvent('request_current_object', {
		publisher : publisherName,
		cbk : function(object) {
			openObject(object);
		}
	});

});

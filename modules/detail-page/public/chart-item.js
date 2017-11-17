window.WUI = window.WUI || {};
WUI.PuePie = function(nodeId) {
    var option = {
        //backgroundColor : '#1b1b1b',
        series : [ {
            name : '能耗指标',
            radius : '90%',
            type : 'gauge',
            min : 0,
            max : 4,
            splitNumber : 8,
            axisLine : {
                lineStyle : {
                    width : 3,
                    color : [ [ 2 / 8, 'gray' ], [ 5 / 8, 'lime' ], [ 1, '#ff4500' ] ],
                    shadowColor : '#fff',
                    shadowBlur : 5
                }
            },
            axisLabel : {
                textStyle : {
                    fontWeight : 'bolder',
                    color : '#fff',
                    shadowColor : '#fff',
                    shadowBlur : 5
                }
            },
            axisTick : {
                length : 10,
                lineStyle : {
                    color : 'auto',
                    shadowColor : '#fff', // 默认透明
                    shadowBlur : 5
                }
            },
            splitLine : {
                length : 15,
                lineStyle : {
                    width : 2,
                    color : 'auto',
                    shadowColor : '#fff', // 默认透明
                    shadowBlur : 5
                }
            },
            title : {
                textStyle : {
                    color : '#fff',
                    shadowColor : '#fff', // 默认透明
                    shadowBlur : 5,
                    fontWeight : 'bolder',
                    fontSize : 18,
                    fontStyle : 'italic'
                }
            },
            detail : {
                shadowColor : '#fff', // 默认透明
                offsetCenter: [0, '50%'],
                shadowBlur : 5,
                textStyle : {
                    color : '#fff',
                    fontSize : 18,
                    fontWeight : 'bolder'
                }
            },
            data : [ {
                value : 0,
                name : 'PUE'
            } ]
        } ]
    };
    this.chart = echarts.init(document.getElementById(nodeId));
    this.setValue = function(value) {
        option.series[0].data[0].value = value;
        this.chart.setOption(option, true);
    }
};

WUI.PowerPie = function(nodeId) {
    var option = {
        title : {
            text : '当前能耗',
            x : 'center'
        },
        series : [ {
            name : '当前能耗',
            type : 'pie',
            radius : '50%',
            stillShowZeroSum : false,
            center : [ '50%', '60%' ],
            label : {
                emphasis : {
                    formatter : '{b}:\n{c}kw\n{d}%'
                }
            },
            itemStyle : {
                emphasis : {
                    shadowBlur : 10,
                    shadowOffsetX : 0,
                    shadowColor : '#fff', // 默认透明
                }
            }
        } ]
    };
    this.chart = echarts.init(document.getElementById(nodeId));

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
};

WUI.initPowerTopAxis = function(nodeId, url) {
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
    var chart = echarts.init(document.getElementById(nodeId));

    WUI.ajax.get(url, {}, function(energyTops) {
        option.xAxis[0].data = [];
        option.series[0].data = [];
        energyTops.forEach(function(item) {
            option.xAxis[0].data.push(item.name);
            option.series[0].data.push(item.value);
        });
        chart.setOption(option, true);
    });
}
WUI.initPowerLine = function(nodeId, url) {
    var option = {
        title : {
            text : '24小时能耗走势',
            x : 'center'
        },
        tooltip : {
            trigger : 'axis',
            axisPointer : {
                type : 'cross'
            }
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
    var chart = echarts.init(document.getElementById(nodeId));

    WUI.ajax.get(url, {}, function(energys) {
        var legends = [];
        var series = {};

        WUI.energyConsumptionType.forEach(function(item) {
            legends.push(item.name);
            series[item.type] = [];
        });

        var valueByTime = [];
        energys.forEach(function(item) {
            var time = WUI.timeformat(item.time, "dd日hh时");
            var value = WUI.findFromArray(valueByTime, "time", time);
            if (value) {
                value[item.type] = item.value;
            } else {
                value = {
                    time : time
                };
                value[item.type] = item.value;
                valueByTime.push(value);
            }
        });
        valueByTime.sort(function(a, b) {
            return a.time > b.time;
        });

        var xAxis = [];
        var types = {};
        valueByTime.forEach(function(value) {
            xAxis.push(value.time);
            WUI.energyConsumptionType.forEach(function(item) {
                if (value[item.type]) {
                    series[item.type].push(value[item.type]);
                } else {
                    series[item.type].push(null);
                }
            });
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
};
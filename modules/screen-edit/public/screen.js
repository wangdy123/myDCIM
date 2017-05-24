$(function() {
	make.Default.path = 'tw/make/';
	var screenEditor = new doodle.SceneEditor($("#screen-container")[0]);

	WUI.subscribe('open_object', function(event) {
		if (!event.object) {
			return;
		}
		$("#main-workspace").panel({title:"页面配置-"+event.object.NAME});
	});
	
	var data = [{
        title: '机柜',
        contents: [
            {
                icon: "make/./model/idc/icons/wall.png",
                id: "twaver.idc.wall.top",
                label: "42U",
            },{
                icon: "make/./model/idc/icons/wall.png",
                id: "twaver.idc.wall.top",
                label: "47U",
            }
        ],
    }, {
        title: '设备',
        contents: [
            {
                icon: "make/./model/idc/icons/wall.png",
                id: "twaver.idc.wall.top",
                label: "1U",
            }
        ],
    }];
    sceneEditor.refreshAccordion(data);

//    //如果存在结果
//    if (data) {
//
//        //将json字符串转成内存对象
//        data = JSON.parse(data);
//
//        //加载数据
//        sceneEditor.setData(data);
//    }

    $('#save-show').on('click', function () {
        //取得编辑结果
        var data = sceneEditor.getData();
        //序列化成json字符串
        data = JSON.stringify(data);
        //保存到localStorage中
        localStorage.setItem(key, data);
    })

    $('#s2d-show').on('click', function(){
        sceneEditor.show2D();
        sceneEditor.hide3D();
    })

    $('#s3d-show').on('click', function(){
        sceneEditor.show3D();
        sceneEditor.hide2D();
    })
});
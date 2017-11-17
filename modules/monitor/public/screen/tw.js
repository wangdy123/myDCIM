$(function() {
    var currentObject = null;
//    WUI.subscribe('open_object', function(event) {
//        openObject(event.object);
//    }, "screen");

    window.WUI.publishEvent('request_current_object', {
        publisher : 'tw3D',
        cbk : function(object) {
            openObject(object);
        }
    });
    function openObject(object) {
        if (!object) {
            return;
        }
        if (currentObject && currentObject.ID === object.ID) {
            return;
        }
        if(!currentObject){
            console.log(document.getElementById('screen-container').window);
        }else{
       
       
        if(object.ID==3){
            document.getElementById('screen-container').src="http://192.168.0.166:8081/?id=1fr05";
        }else{
            document.getElementById('screen-container').src="http://192.168.0.166:8081/?id=S34";           
        }
        }
        currentObject = object;
    }
    window.WUI.open3D=function(object){
        openObject(object); 
    }
});

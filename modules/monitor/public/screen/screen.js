$(function() {
	var box = new mono.DataBox();
    var network= new mono.Network3D(box, null, monoCanvas);
    console.log(mono.Utils.getLicense());
    mono.Utils.autoAdjustNetworkBounds(network,$("#screen-container")[0],'clientWidth','clientHeight');

    var pointLight = new mono.PointLight(0xFFFFFF,1.5);
    pointLight.setPosition(1000,1000,1000);
    box.add(pointLight);
    box.add(new mono.AmbientLight(0x888888));

    var cube = new mono.Cube(200, 200, 200,3,3,3);
    cube.s({
        'm.type': 'phong',
        'm.color': 'green',
        'm.ambient': 'red',
    });
    cube.setRotation(-Math.PI/5, -Math.PI/5, 0);
    box.add(cube);
	
});
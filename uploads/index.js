var express = require('express');
var multer = require('multer');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.post('/upload',[multer({dest: './uploads/'}), function(req, res) {
    try {
        console.log(req.body.myfile);
        console.log(req.files);
        res.json(200);
    } catch (e) {
        console.log(e);
    }
}]);

//app.route('/upload')
//.post(function (req, res, next) {
//
//    var fstream;
//    req.pipe(req.busboy);
//    req.busboy.on('file', function (fieldname, file, filename) {
//        console.log("Uploading: " + filename);
//
//        //Path where image will be uploaded
//        fstream = fs.createWriteStream(__dirname + '/img/' + filename);
//        file.pipe(fstream);
//        fstream.on('close', function () {    
//            console.log("Upload Finished of " + filename);              
//            res.redirect('back');           //where to go next
//        });
//    });
//});
//app.post('/upload', function(req, res){
//	console.log(req.files);
//	});
module.exports = app;
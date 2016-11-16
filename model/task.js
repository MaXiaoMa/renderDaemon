var mongoose = require('mongoose')
var url = require('../config').G.mongoUrl;
var opts = { server: { auto_reconnect: true }};
var db = mongoose.createConnection(url,opts);

var TaskSchema = mongoose.Schema({
    TaskName:String,
    AppVer:String,
    OssOutput:String
})

module.exports = db.model('tasks', TaskSchema);
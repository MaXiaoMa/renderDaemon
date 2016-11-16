var mongoose = require('mongoose');
var url = require('../config').G.processUrl;
var opts = { server: { auto_reconnect: true }};
var db = mongoose.createConnection(url,opts);

var ProcessSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    processInfo:String,
    process:Number,
    img:String,
    done:Number

});

module.exports = db.model('info', ProcessSchema,"info");
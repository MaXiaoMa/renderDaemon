var mongoose = require('mongoose')
var url = require('../config').G.mongoUrl;
var opts = { server: { auto_reconnect: true }};
var db = mongoose.createConnection(url,opts);

var Schema=mongoose.Schema;
var ServerSchema = new Schema({
    Key:String,
    Value:Number
    },{versionKey:false}
)

module.exports = db.model('settings', ServerSchema);
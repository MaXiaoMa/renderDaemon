var mongoose = require('mongoose')
var url = require('../config').G.mongoUrl;
var opts = { server: { auto_reconnect: true }};
var db = mongoose.createConnection(url,opts);

var Schema=mongoose.Schema;
var SlaveSchema = new Schema({
    HostName:String,
    Ip:String,
    Gid:Schema.Types.ObjectId,
    Cores:Number,
    Master:{
        type:Number,
        default:0
    },
    Status:{
        type:Number,
        default:0
    }},{versionKey:false}
)

module.exports = db.model('slaves', SlaveSchema);
var mongoose = require('mongoose')
var url = require('../config').G.mongoUrl;
var opts = { server: { auto_reconnect: true }};
var db = mongoose.createConnection(url,opts);

var GroupSchema = mongoose.Schema({
    GroupName:{
        type:String,
    },
    Num:{
        type:Number,
        min:0,
        default:0,
    },
    SumCores:{
        type:Number,
        min:0,
        default:0,
    },
    Priority:{
        type:Number,
        min:0,
        default:0,
    },
    Speed:{
        type:Number,
        min:0,
        default:0,
    },
    MasterSlave:{
        type:String,
        default:"NoAssign"
    },
    MasterIp:{
        type:String,
    },
    Status:{
        type:Number,
        default:2,
    }},{versionKey:false}
)

module.exports = db.model('groups', GroupSchema);

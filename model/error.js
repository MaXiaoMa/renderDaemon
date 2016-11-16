var mongoose = require('mongoose')
var url = require('../config').G.mongoUrl;
var opts = { server: { auto_reconnect: true }};
var db = mongoose.createConnection(url,opts);

var errorSchema = mongoose.Schema({})

module.exports = db.model('errors', errorSchema);
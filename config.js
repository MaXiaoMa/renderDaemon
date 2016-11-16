var express = require('express');
var app = express();

var Global={}




if('production' == process.argv[2]){
    Global.mongoUrl = "mongodb://123.57.152.158:27017/render";
    Global.processUrl = "mongodb://123.57.152.158:27017/render_vray_process";
    Global.rabbitmq = 'http://123.56.232.37:15672';
    Global.rabbitmqLocal ='http://192.168.10.253:15672';
    Global.port = 3002;
}else if('development' == process.argv[2]){
    Global.mongoUrl = "mongodb://localhost.360xr.cn:27017/render,192.168.10.55:27017/render";
    Global.processUrl = "mongodb://localhost.360xr.cn:27017/render_vray_process,192.168.10.55:27017/render_vray_process";
    Global.rabbitmq = 'http://localhost.360xr.cn:15672';
    Global.port = 3001;
}else if('test' == process.argv[2]){
    Global.mongoUrl = "mongodb://localhost:27017/render";
    Global.processUrl = "mongodb://localhost:27017/render_vray_process";
    Global.rabbitmq = 'http://localhost.360xr.cn:15672';
    Global.port = 3001;
}

exports.G=Global;
var express = require('express')
var errorModel = require('../../model/error');
var router = express.Router();
var mongoose = require('mongoose')



router.get('/', function (req,res) {
    var limit = req.query.limit?parseInt(req.query.limit):10;
    var offset = req.query.offset?parseInt(req.query.offset):0;

    var query=errorModel.find();
    query.limit(limit);
    query.skip(offset);

    query.sort({time:"-1"});

    query.exec(function (err,docs) {
        if (err)return console.log(err);
        errorModel.count(function (err, total) {
            res.jsonp({total: total, rows: docs})
        })
    });
});


router.get('/id', function (req, res) {
    var jobid =new RegExp(req.query.jobid);
    errorModel.find({jobid:jobid}, function (err, doc) {
        if(err) return console.log(err);
        res.jsonp({total: 1, rows: doc});
    })
});


module.exports=router;

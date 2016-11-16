var express = require('express')
var settingModel = require('../../model/setting');
var router = express.Router();
var mongoose = require('mongoose')

router.get('/getqueue', function (req, res) {
    settingModel.find({Key: "GetQueue"}, function (err, doc) {
        if (err) return console.log(err);
        if(doc[0]!=undefined){
            var status = doc[0].Value;
            res.jsonp({status: status});
        }else{
            res.jsonp({status: 10});
        }

    })
})

router.get('/getqueue/change', function (req, res) {
    settingModel.find({Key: "GetQueue"}, function (err, doc) {
        if (err) return console.log(err);
        var status = doc[0].Value;
        if (status == 0) {
            settingModel.update({Key: "GetQueue"}, {Value: 1}, function (err, doc) {
                if (doc.ok != 0) {
                    res.jsonp({status: 1, info: "修改成功"});
                } else {

                    res.jsonp({status: 0, info: "修改失败"});
                }
            })
        } else if (status == 1) {
            settingModel.update({Key: "GetQueue"}, {Value: 0}, function (err, doc) {
                if (doc.ok != 0) {
                    res.jsonp({status: 1, info: "修改成功"});
                } else {

                    res.jsonp({status: 0, info: "修改失败"});
                }
            })
        }
    })

})
module.exports = router;
var express = require('express')
var slaveModel = require('../../model/slave');
var groupModel = require('../../model/group');
var router = express.Router();
var mongoose = require('mongoose')

router.get('/', function (req, res) {
    var offset = req.query.offset ? parseInt(req.query.offset) : 0;
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;

    query = slaveModel.find();
    query.limit(limit);
    query.skip(offset);

    query.sort({HostName: "1"});
    query.exec(function (err, jobs) {
        if (err)return console.log(err);
        slaveModel.count(function (err, total) {
            res.jsonp({total: total, rows: jobs})
        })
    });
});

/*router.get("/:slaveid", function (req, res) {
 var slaveid = req.params.slaveid;
 query = slaveModel.findById(slaveid)
 query.exec(function (err, task) {
 if (err) console.log(err);
 res.jsonp(task);
 })
 });*/

router.get('/create', function (req, res) {
    var hostname = req.query.slavename?req.query.slavename:'default';
    var ip = req.query.ip?req.query.ip:"100.100.100.100";
    var gid = mongoose.Types.ObjectId(req.query.groupid);
    var cores = req.query.cores?req.query.cores:0;
    var data = {HostName: hostname, Ip: ip, Gid: gid,Cores:cores};
    slaveModel.create(data, function (err, doc) {
        if (err) return console.log(err);
        if (doc) {
            //如果机器创建成功，则给相应的组，机器数加1，核数增加相应值
            groupModel.update({_id:gid},{$inc:{Num:1,SumCores:cores}}, function (err,doc) {
                if(err) return console.log(err);
                res.jsonp({status: 1, info: "更新成功！"});
            })
        }
    })

});

router.get("/delete", function (req, res) {
    var slaveid = req.query.id;
    var gid = req.query.gid;
    var cores = req.query.cores;
    var condition = {_id: slaveid};
    slaveModel.remove(condition, function (err) {
        if (err) return console.log(err);
        groupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores}},function(err,doc){
            if(err) return console.log(err);
            res.jsonp({status: 1, info: "删除成功！"});
        })
    })
});

router.get("/update", function (req, res) {
    var slaveid = req.query.id;
    var gid = req.query.gid;
    var newgid = req.query.newgid;
    var cores = req.query.cores;
    var slavename = req.query.slavename;
    var slaveip = req.query.ip;

    if(gid==newgid){//如果没有更换组，则可以设为主机器，如果更换组，则不能设置主机器，只能更换组
        if(slavename!="NoAssign"){
            var master =1;//可以设置为主机器
        }else{
            var master =0;
        }
    }else{
        var master =0;
    }
    var condition = {_id: mongoose.Types.ObjectId(slaveid)};
    var objid = mongoose.Types.ObjectId(newgid);
    var update = {$set: {Gid: objid,Master:master}};

    var gid = mongoose.Types.ObjectId(req.query.gid);


    if(master==1){//可以设置为主机器，且没有移动组，为同组，判断是否已经有主机器
        slaveModel.aggregate(
            [
                {$match:{Gid:gid,Master:1}}
             ],
             function(err,doc){
                 //如果存在主机器，则不能更新,否则可以更新
                 if(doc.length!=0){
                     res.jsonp({status: 0, info: "组内已存在主机器，不能再设置！"})
                 }else{
                     slaveModel.update(condition, update, function (err, doc) {//先将机器信息更新
                         if (err) console.log(err)
                         if (doc.ok != 0) {

                             if(slavename=="NoAssign"){//主机器未指定，因此用NoAssign来代替机器名
                                 groupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores},$set:{MasterSlave:slavename,MasterIp:""}},function(err){
                                     if (err) return console.log(err);
                                     groupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                                         if (err) return console.log(err);
                                         res.jsonp({status:1,info:"更新成功！"});
                                     })
                                 })

                             }else if(slavename=="NoChange"){//机器参数未更改
                                 groupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores}},function(err){
                                     if (err) return console.log(err);
                                     groupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                                         if (err) return console.log(err);
                                         res.jsonp({status:1,info:"更新成功！"});
                                     })
                                 })

                             }else{//将机器名和ip作为主ip
                                 groupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores},$set:{MasterSlave:slavename,MasterIp:slaveip}},function(err){
                                     if (err) return console.log(err);
                                     groupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                                         if (err) return console.log(err);
                                         res.jsonp({status:1,info:"更新成功！"});
                                     })
                                 })
                             }
                         } else {
                             res.jsonp({status: 0, info: "更新失败！"});
                         }
                     })
                 }
             })
    }else{//将机器设置为子节点，非主机器
        slaveModel.update(condition, update, function (err, doc) {
            if (err) console.log(err)
            if (doc.ok != 0) {

                if(slavename=="NoAssign"){//主机器未指定
                    groupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores},$set:{MasterSlave:slavename,MasterIp:""}},function(err){
                        if (err) return console.log(err);
                        groupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                            if (err) return console.log(err);
                            res.jsonp({status:1,info:"更新成功！"});
                        })
                    })

                }else if(slavename=="NoChange"){//非主节点，移动到其他组的时候，组的主节点名字不改变
                    groupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores}},function(err){
                        if (err) return console.log(err);
                        groupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                            if (err) return console.log(err);
                            res.jsonp({status:1,info:"更新成功！"});
                        })
                    })

                }else{
                    groupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores},$set:{MasterSlave:slavename,MasterIp:slaveip}},function(err){
                        if (err) return console.log(err);
                        groupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                            if (err) return console.log(err);
                            res.jsonp({status:1,info:"更新成功！"});
                        })
                    })
                }

            } else {
                res.jsonp({status: 0, info: "更新失败！"});
            }
        })
    }

});

router.get("/groupname", function (req, res)
{
    if (req.query.gid != undefined) {
        var groupid = mongoose.Types.ObjectId(req.query.gid);
        slaveModel.find({Gid: groupid}, function (err, docs) {
            if (err) return console.log(err);
            res.jsonp(docs);
        })
    }
});

router.get('/count', function (req, res) {
    var gid = mongoose.Types.ObjectId(req.query.gid);
    var condition = {Gid: gid};
    slaveModel.count(condition, function (err, num) {
        if (err) console.log(err);
        res.jsonp({"num": num});
    })
})


module.exports = router;
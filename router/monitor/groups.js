var express = require('express')
var GroupModel = require('../../model/group');
var router = express.Router();
var mongoose = require('mongoose')


router.get('/', function (req,res) {
    var query=GroupModel.find();
    query.sort({Priority:1});
    query.exec(function(err,docs){
        if (err) return console.log(err);
        res.jsonp(docs);
    })
});

router.get('/groupbyid', function (req,res) {
    var id=req.query.id;
   GroupModel.find({_id:id},function(err,docs){
       if (err) return console.log(err);
       res.jsonp(docs);
   })
});


router.get('/create',function(req,res){
    if(req.query!=undefined){
        var GroupName=req.query.Name;
        var Speed=req.query.Speed;
        if(GroupName!=undefined&&Speed!=undefined){
            if(GroupName.length<20){
                GroupModel.findOne({GroupName:GroupName}, function (err,doc){
                    if(doc){
                        res.jsonp({status:0,info:'组名称已存在，请更换！'});
                    }else{
                        if(Speed>=0){
                            var data={
                                GroupName:GroupName,
                                Speed:Speed
                            };
                            GroupModel.create(data,function(err,info){
                                if (err) console.log(err);
                                res.jsonp({status:1,info:'组创建成功！'});
                            })
                        }else{
                            res.jsonp({status:0,info:'速度不能小于0'});
                        }
                    }
                });
            }else{
                res.jsonp({status:0,info:'组名字太长'});
            }
        }
    }else{
        console.log('没有获取到字段');
        res.jsonp({info:'没有获取到字段'});
    }
});


router.get("/delete", function (req, res) {
    if(req.query.id!=undefined){
        var GroupId=req.query.id;
        GroupModel.remove({_id:GroupId},function(err,docs){
            if(err){
                console.log(err)
                res.jsonp({"status":0,info:"删除失败"});
            }else{
                res.jsonp({"status":1,info:"删除成功"});
            }
        });
    }else{
        console.log('空值');
    }
});


router.get('/update',function(req,res){
    var id=req.query.id;
    var newname=req.query.newname?req.query.newname:'default';
    var speed=req.query.speed?req.query.speed:0;
    var Status=req.query.newstatus;

    GroupModel.update({_id:id},{$set:{GroupName:newname,Speed:speed,Status:Status}},function(err,doc){
        if(doc.ok!=0){
            res.jsonp({status:1,info:"更新成功！"});
        }else{
            res.jsonp({status:0,info:"更新失败！"});
        }
    })
})


/*router.get("/updatebs", function (req, res) {
    var gid=req.query.gid;
    var newgid=req.query.newgid;
    var status=req.query.status;
    var slavename=req.query.slavename;
    var cores=parseInt(req.query.cores  );
    console.log(typeof cores);
    if (status==0){//删除机器,对应组的机器数减1，组的总核心数减去本机器的核心数
        GroupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores}},function(err){
            if (err) return console.log(err);
            res.jsonp({status:1,info:"更新成功！"});
        })
        /!*移动机器,机器数和核心数的增减涉及到两个组，两个组相应增减，
          如果移动的是主机器，则本组设为NoAssign，对应组不变，
          如果移动的不是主机器，则本组设定不变，对应组也不变，
          如果
         *!/
    }else if(status==1){
        if(slavename=="NoAssign"){
            GroupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores},$set:{MasterSlave:slavename}},function(err){
                if (err) return console.log(err);
            })
            GroupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                if (err) return console.log(err);
                res.jsonp({status:1,info:"更新成功！"});
            })
        }else if(slavename=="NoChange"){
            GroupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores}},function(err){
                if (err) return console.log(err);
            })
            GroupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                if (err) return console.log(err);
                res.jsonp({status:1,info:"更新成功！"});
            })
        }else{
            GroupModel.update({_id:gid},{$inc:{Num:-1,SumCores:-cores},$set:{MasterSlave:slavename}},function(err){
                if (err) return console.log(err);
            })
            GroupModel.update({_id:newgid},{$inc:{Num:1,SumCores:cores}},function(err){
                if (err) return console.log(err);
                res.jsonp({status:1,info:"更新成功！"});
            })
        }

    }else if(status==2) {//添加机器
        GroupModel.update({_id: gid}, {$inc: {Num: 1,SumCores:cores}}, function (err) {
            if (err) return console.log(err);
            res.jsonp({status:1,info:"更新成功！"});
        })
    }

});*/




module.exports = router;
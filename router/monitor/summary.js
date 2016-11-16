var express = require('express');
var jobModel = require('../../model/summary');
var router = express.Router();

router.get('/',function(req,res){

    var start = req.query.start ? req.query.start : getDate(-6);
    var end = req.query.end ? req.query.end : getDate(1);
    var select = req.query.select ? parseInt(req.query.select) : 0;

    //0代表天，1代表月，2代表年
    //确定查询条件，按年，月，日分组
    if (select == 0){
        var request={Status:2,SubmitTime:{"$gte":new Date(start),"$lte":new Date(end)}};
        var requset1={year: { $year: "$SubmitTime" }, month: { $month: "$SubmitTime" }, day: { $dayOfMonth: "$SubmitTime" }}
        var length=DateDiff(end,start);
    }else if(select==1){
        var request={Status:2,SubmitTime:{"$gte":new Date(start),"$lte":new Date(end)}};
        var requset1={year: { $year: "$SubmitTime" }, month: { $month: "$SubmitTime" }}
        var length=Math.ceil(DateDiff(end,start)/30);
    }else if(select==2){
        var request={Status:2,SubmitTime:{"$gte":new Date(start),"$lte":new Date(end)}};
        var requset1={year: { $year: "$SubmitTime" }};
        var length=Math.ceil(DateDiff(end,start)/365);
    }

//聚合查询数据
    jobModel.aggregate(
        [
            {$match:request},//筛选状态为2（完成），日期范围
            {$project:{SubmitTime:1,dateDiff:{$subtract:["$StartTime","$SubmitTime"]},TruePrice:1}},//只取提交时间，等待时间,真实金额 这几个字段
            {$group:{
                _id : requset1,
                count:{$sum:1},
                avgtime:{$avg:"$dateDiff"},
                price:{$sum:"$TruePrice"}},
            },//组，记录有年月日，成功任务数，平均等待时间，每日金额
            {$sort:{_id:1}},//按提交时间倒序

        ],
        function (err,docs){
            if(err)return console.log(err);
            var sumdate=[];
            var sumdata=[];
            var sumdata1=[];
            var sumPrice = [];
            var j=0;
            for(var i=0;i<length;i++){//length为查询的天数
                //var dateCategory//显示日期
                //var jobCount//每日成功任务数
                //var avgTime//每日平均等待时间
               // var price//每日金额
                if (select == 0&&docs[j]!=null){//按天查询

                    var dd=docs[j]._id.year+'-'+docs[j]._id.month+'-'+docs[j]._id.day;
                    var mydate=getDate(start,i);
                    /*查询的日期，2016-7-7格式,为起始时间依次加一天（月）
                    因为查询出来的记录有可能为0，此时需要跟自己设置的mydate对比，
                    dd为记录中的日期，
                    当记录和查询日期相等，则认为有记录，将记录插入数组
                    当记录和查询日期不等，则认为没有记录，此时将0插入数组
                    data记录的是每日成功任务数，data1记录的是每日平均等待时间（分钟）
                    */
                    if(dd==mydate){
                        var dateCategory=dd;
                        var jobCount=docs[j].count;

                        var avgTime=parseFloat((docs[j].avgtime/60000).toFixed(2));//每日平均等待时间，取2位

                        var price=parseFloat((docs[j].price/100).toFixed(2));
                        //把任务数，平均时间，每日金额，分别放进不同的数组中

                        j+=1;//j自加，取记录中自动后一个记录
                    }else{
                        var dateCategory=mydate;
                        var jobCount=0;

                        var avgTime=0;

                        var price=0;
                    }
                }else if(select==1&&docs[j]!=null){//按月查询
                    var mydate=getMonth(start,i);
                    var avgtime=parseFloat((docs[j].avgtime/60000).toFixed(2));
                    var dd=docs[j]._id.year+'-'+docs[j]._id.month;
                    if(dd==mydate){
                        var dateCategory=dd;
                        var jobCount=docs[j].count;

                        var avgTime=parseFloat((docs[j].avgtime/60000).toFixed(2));//每日平均等待时间，取2位

                        var price=parseFloat((docs[j].price/100).toFixed(2));
                        //把任务数，平均时间，每日金额，分别放进不同的数组中

                        j+=1;//j自加，取记录中自动后一个记录
                    }else{
                        var dateCategory=mydate;
                        var jobCount=0;

                        var avgTime=0;

                        var price=0;
                    }
                }else if(select==2&&docs[j]!=null){//按年查询
                    var mydate=getYear(start,i-1);
                    var avgtime=parseFloat((docs[j].avgtime/60000).toFixed(2));
                    var dd=docs[j]._id.year;
                    if(dd==mydate){
                        var dateCategory=dd;
                        var jobCount=docs[j].count;

                        var avgTime=parseFloat((docs[j].avgtime/60000).toFixed(2));//每日平均等待时间，取2位

                        var price=parseFloat((docs[j].price/100).toFixed(2));
                        //把任务数，平均时间，每日金额，分别放进不同的数组中

                        j+=1;//j自加，取记录中自动后一个记录
                    }else{
                        var dateCategory=mydate;
                        var jobCount=0;

                        var avgTime=0;

                        var price=0;
                    }
                }else{
                    if(select==0){
                        mydate=getDate(start,i);
                    }else if(select==1){
                        mydate=getMonth(start,i);
                    }else if(select==2){
                        mydate=getYear(start,i-1).toString();
                    };
                    var dateCategory=mydate;
                    var jobCount=0;

                    var avgTime=0;//每日平均等待时间，取2位

                    var price=0;
                    //把任务数，平均时间，每日金额，分别放进不同的数组中


                }

                sumdate.push(dateCategory);
                sumdata.push(jobCount);
                sumdata1.push(avgTime);
                sumPrice.push(price);
            }

            var series=[];//把数据全放进一个数组里
            series.push(sumdata);
            series.push(sumdata1);
            series.push(sumPrice);

            var returndata={//创建数据
                categories:sumdate,
                series:series
            }
            res.jsonp({data:returndata});
        }
    )
    });
router.get('/ts',function(req,res){
    jobModel.find({},{'Elapsed':1,'VrmapSize':1,_id:0},function(err,docs){
        if (err){return console.log(err)};
        var data=[];
        console.log(docs[75]);
        for(var i=0;i<docs.length;i++){
            var list=[];
            if(docs[i]!=undefined){
                list.push(docs[i].Elapsed);
                list.push(docs[i].VrmapSize);
            }
            data.push(list);
        }
        res.jsonp(docs);
    })
    //var query=jobModel.find();
});

function getDate(date,count){
    var dd=new Date(date);
    dd.setDate(dd.getDate()+count);
    var y=dd.getFullYear();
    var m=dd.getMonth()+1;
    var d=dd.getDate();
    return y+"-"+m+"-"+d;
}

function getMonth(date,count){
    var dd=new Date(date);
    dd.setMonth(dd.getMonth()+count,28);
    var y=dd.getFullYear();
    var m=dd.getMonth()+1;
    return y+"-"+m;
}

function getYear(date,count){
    var dd=new Date(date);
    dd.setYear(dd.getFullYear()+count+1);
    var y=dd.getFullYear();
    return y;
}

//计算两个日期差
function DateDiff(sDate1, sDate2) {  //sDate1和sDate2是"2002-12-18"格式
    var aDate, oDate1, oDate2, iDays;
    aDate = sDate1.split("-");
    oDate1 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
    aDate = sDate2.split("-");
    oDate2 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
    iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
    if ((oDate1 - oDate2) < 0) {
        return -iDays;
    }
    return iDays;
}

module.exports = router;
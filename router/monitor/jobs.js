var express = require('express');
var jobModel = require('../../model/job');
var taskModel = require('../../model/task');
var processModel = require('../../model/process');
var router = express.Router();
/**
 * query all jobs
 */
router.get('/', function (req, res) {
    var offset = req.query.offset ? parseInt(req.query.offset) : 0;
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;

    query = jobModel.find();
    query.limit(limit);
    query.skip(offset);

    query.sort({SubmitTime:"-1"});
    query.exec(function (err, jobs) {
        if (err)return console.log(err);
        jobModel.count(function (err, total) {
            res.jsonp({total: total, rows: jobs})
        })
    });
});

router.get("/statistics", function (req, res) {
    jobModel.count(function (err, total) {
        jobModel.count({Status: 0}, function (err, waitingNum) {
            jobModel.count({Status: 1}, function (err, progressNum) {
                jobModel.count({Status: 2}, function (err, completeNum) {
                    res.jsonp({total: total, wait: waitingNum, progress: progressNum, complete: completeNum});
                })
            })
        })
    })

})

//query one jobs by jobid
router.get('/jobid', function (req, res) {
    var jobid = req.query.jobid;
    var taskid = req.query.taskid;
    jobModel.findById(jobid, function (err, job) {
        taskModel.findById(taskid,function(err,task){
            if(err) return console.log(err);
            var taskname = task.TaskName;
            var appVer = task.AppVer;
            res.jsonp({task:taskname,job:job,appver:appVer});
        })

    })
});


//query render process(preview image)
router.get('/process', function (req,res) {
    var jobid = req.query.jobid;
    processModel.findById(jobid,function(err,process){
        if (err) return console.log(err);
       res.jsonp({base64:process.img,process:process.processInfo})
    })
});

module.exports = router;
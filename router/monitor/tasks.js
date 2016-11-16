var express = require('express')
var taskModel = require('../../model/task');
var mongoose = require('mongoose');
var router = express.Router()

function getObid(string) {
    return mongoose.Types.ObjectId(string);
}

router.get("/", function (req, res) {
    var offset = req.query.offset ? parseInt(req.query.offset) : 0;
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;

    var jobid = req.query.jobid, where = {};
    if (jobid != undefined) {
        where = {JobId: getObid(jobid)}
    }
    query = taskModel.find(where);

    query.limit(limit);
    query.skip(offset);
    query.sort({"Status": 1,JobId:-1});
    query.exec(function (err, tasks) {
        if (err) console.log(err);
        taskModel.count(function(err,total){
            res.jsonp({total:total,rows:tasks});
        })

    })
});


router.get("/:taskid", function (req, res) {
    var taskid = req.params.taskid;
    query = taskModel.findById(taskid)
    query.exec(function (err, task) {
        if (err) console.log(err);
        res.jsonp(task);
    })
});


module.exports = router;
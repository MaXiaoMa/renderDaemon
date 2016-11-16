var express = require('express')
var router = express.Router();
var request = require('request');
var rburl = require('../../config').G.rabbitmq;
var rburlLocal = require('../../config').G.rabbitmqLocal;

var jobqueueApi = rburl + "/api/queues/render_mq/";
var jobqueueApiLocal = rburlLocal + "/api/queues/render_mq/";

router.get('/', function (req, res) {
    request
        .get(jobqueueApi,{json:true},function(error,response,job){
            if(error)return console.log(error);
            if (response.statusCode == 200) {
                if(rburlLocal!=undefined){
                    request
                        .get(jobqueueApiLocal,{json:true},function(error,response,joblocal){
                            if(error)return console.log(error);
                            if (response.statusCode == 200) {
                                var data = job.concat(joblocal);
                                res.jsonp(data);
                                job = joblocal = null;
                            }
                        })
                        .auth('admin','admin');
                }else{
                    res.jsonp(job);
                }

            }
        })
        .auth('admin','admin');
});



module.exports = router;
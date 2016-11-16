var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var port = require('./config').G.port;


//monitor router
var monitorjobRouter = require("./router/monitor/jobs");
var monitortaskRouter = require('./router/monitor/tasks');
var monitorslaveRouter = require('./router/monitor/slaves');
var monitorqueueRouter = require('./router/monitor/queue');
var monitorsummaryRouter = require('./router/monitor/summary')
var monitorgroupRouter = require('./router/monitor/groups');
var monitorsettingRouter = require('./router/monitor/settings');
var monitorerrorRouter = require('./router/monitor/errors')




var app = express();
app.use(logger('dev'));


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/monitor/jobs', monitorjobRouter);

app.use('/monitor/tasks', monitortaskRouter);

app.use('/monitor/slaves', monitorslaveRouter);

app.use('/monitor/queue', monitorqueueRouter);

app.use('/monitor/summary',monitorsummaryRouter);

app.use('/monitor/groups',monitorgroupRouter);

app.use('/monitor/settings',monitorsettingRouter);

app.use('/monitor/errors',monitorerrorRouter);


app.listen(port, function () {
    console.log("listen on port "+port);
})
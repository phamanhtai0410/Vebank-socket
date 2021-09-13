require('dotenv').config()
const express = require('express');
const http = require('http');
const initSocket = require('./controller/socket')
const path = require('path');
const socketRouter = require('./controller/socket/emit')

const app = express();
const server = http.createServer(app);
const io = initSocket(server)

/*
* */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*
*
* */
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/v1/socket', socketRouter(io));
app.get('/', (req, res) => {
    return res.send("RinZ Socket")
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.status(404).send({
        'error_code': 'NOT_FOUND',
        'status': 0,
        'msg': '',
        'data': {}
    })
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});

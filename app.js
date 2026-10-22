var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
const {sequelize} = require('./models');
var indexRouter = require('./routes/index');
const startSensorSimulation = require('./routes/tank/schedual');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

var app = express();

sequelize.sync({force:false})
    .then(()=>console.log('연결성공'))
    .catch((err)=>console.error(err));

app.use(cors({
    origin: true,
    credentials: true
}));
  
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

startSensorSimulation()

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads/user',express.static(path.join(__dirname,'./uploads/user')));
app.use('/uploads/post',express.static(path.join(__dirname,'./uploads/post')));
app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send(
    `<script>
      alert('존재하지 않는 페이지 입니다.');
      history.back();
    </script>`)
});

// error handler
app.use(function(err, req, res, next) {
  console.log('들어감');
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err.message);
  res.json({message:err.message});
});

module.exports = app;

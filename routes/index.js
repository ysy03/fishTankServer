const express = require('express');
const app = express()
const auth = require('./auth/index');
const index = require('./home/index');
const FishInfo = require('./fishinfo/index');
const communicate = require('./communicate/index'); 

app.use('/users',auth);
app.use('/index',index);
app.use('/fishinfo',FishInfo);
app.use('/community',communicate);

module.exports = app;
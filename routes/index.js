const express = require('express');
const app = express()
const auth = require('./auth/index');
const index = require('./home/index');
const FishInfo = require('./fishinfo/index');
const communicate = require('./communicate/index'); 
const tank = require('./tank/index');


app.use('/users',auth);
app.use('/index',index);
app.use('/fishinfo',FishInfo);
app.use('/community',communicate);
app.use('/tank',tank);

module.exports = app;
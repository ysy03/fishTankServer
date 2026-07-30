const express = require('express');
const app = express()
const auth = require('./auth/index');
const index = require('./home/index');
const FishInfo = require('./fishinfo/index');
const community = require('./communty/index'); 
const tank = require('./tank/index');
const daily = require('./daily/index');

app.use('/auth',auth);
app.use('/index',index);
app.use('/fishinfo',FishInfo);
app.use('/community',community);
app.use('/tank',tank);
app.use('/daily',daily)


module.exports = app;
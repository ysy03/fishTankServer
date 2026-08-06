const express = require('express');
const app = express()
const auth = require('./auth/index');
const index = require('./home/index');
const FishInfo = require('./fishinfo/index');
const community = require('./communty/index'); 
const tank = require('./tank/index');
const daily = require('./daily/index');
const chatbot = require('./chatbot/index');

app.use('/auth',auth);
app.use('/index',index);//로그인 성공 후 홈 화면이라서 프론트나 iot에 주고받는 데이터가 없어 삭제 예정입니다.
app.use('/fishinfo',FishInfo);
app.use('/community',community);
app.use('/tank',tank);
app.use('/daily',daily);
app.use('/chatbot',chatbot);


module.exports = app;
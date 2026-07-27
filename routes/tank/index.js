const app = require('express');
const authMiddleware = require('../auth/authMiddleware');
const router = app.Router();
const {Sensor,Tank, Feederlog,Waterchangelog} = require('../../models');
const { fn, Op, col } = require('sequelize');
const devAuthMiddleware = require('../auth/devauthMiddleware');


router.post('/sensor',async(req,res)=>{
    
})

router.get('/log',devAuthMiddleware,async(req,res)=>{
    try {
        const today =new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate()+1);
        const tank = await Tank.findOne({
            where:{
                user_id:req.user.user_id,
            }
        })
        const FeedData = await Feederlog.findAll({
            where:{
                device_id:tank.device_id,
                feed_time:{
                    [Op.gte]:today,
                    [Op.lt]:tomorrow
                }}
        })
        const waterchange = await Waterchangelog.findAll({
            where:{
                device_id:tank.device_id,
                end_at:{
                    [Op.gte]:today,
                    [Op.lt]:tomorrow
                }
            }
        })
        return res.json({waterchange,FeedData});   
    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'에러 메세지가 발생하였습니다.'})
    }
})


router.get('/lasts',devAuthMiddleware,async (req,res) => {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate()+1);
        const waterinfo = await Sensor.findOne({
            where:{
                user_id:req.user.user_id,
                measured_at:{
                    [Op.gte]:today,
                    [Op.lt]:tomorrow
                }
            },
            order:[['measured_at','DESC']]
        })
        const temstatus = await Sensor.findOne({
            attributes:[
                [fn('MAX',col('temperature')),'Maxtemperature'],
                [fn('MIN',col('temperature')),'Mintemperature']
            ],
            where:{
                user_id:req.user.user_id,
                measured_at:{
                    [Op.gte]:today,
                    [Op.lt]:tomorrow
                }
            },
            order:[['measured_at','DESC']]
        })
        return res.json({waterinfo,temstatus});
    } catch (error) {
        return res.status(error.status).json({message:error.message||'서버에 오류가 발생하였습니다.'});
    }
    
})


router.post('/feed',devAuthMiddleware,async(req,res)=>{
    const status = Math.random() > 0.3;
    try {
        const tank = await Tank.findOne({
            where:{
                user_id:req.user.user_id
            }
        })
        if(!tank){
            return res.status(404).json({message:'탱크를 찾아내지 못했습니다.'})
        }

        const Data = await Feederlog.create({
            device_id:tank.device_id,
            status
        })
        return res.json({Data})

    } catch (error) {
        console.error('error');
        return res.status(error.status||500).json({message:'에러가 발생하였습니다.'});
    }
})

router.post('/waterchange',devAuthMiddleware,async(req,res)=>{
    try {
        const StartDate = new Date();
        await new Promise(resolve => setTimeout(resolve, 5000));

        const status = Math.random() > 0.7 ? true : false;
        const date = await Waterchangelog.create({
            device_id:'SS501',
            status,
            started_at: StartDate,
            ended_at:new Date()
        })
        return res.json(date);   
    } catch (error) {
        console.log(error);
        return res.status(error.status||500).json({
            message:'에러 메세지가 발생하였습니다.'
        })
    }
})


module.exports = router;
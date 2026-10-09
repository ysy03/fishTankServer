const app = require('express');
const authMiddleware = require('../auth/authMiddleware');
const router = app.Router();
const {Sensor,WaterQuality,Tank, Feederlog,Waterchangelog,Alert} = require('../../models');
const { fn, Op, col } = require('sequelize');
const { sendToUser, addClients, removeCLients, updateSensor, updateTankcache, addTank, commandState,sendFeedResult,sendSSE, sendWqResult } = require('./tanksse');
const { sendToDevice } = require('../../socket');

//온도,수질 지정
router.post('/setting',authMiddleware,async(req,res)=>{
    try {
        const {min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality,
            tank_name,
            device_id} = req.body;
        const {user_id} = req.user;
        const response = await Tank.create({
            user_id,
            tank_name,
            device_id,
            min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality
        })
        addTank(response);
        return res.sendStatus(204);
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:'데이터 저장에 실패하였습니다.'})
    }
})

//설정 조회
router.get('/setting/:id',authMiddleware,async(req,res)=>{
    try {
        const{id:device_id} = req.params;
        const tank = await Tank.findOne({where:{device_id}});
        if(!tank){
            return res.status(400).json({message:'데이터를 가져오지 못했습니다.'})
        }
        return res.status(200).json(tank);
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:error.message || '서버에 오류가 발생하였습니다.'});
    }
})

//설정 저장
router.post('/setting/:id',authMiddleware,async(req,res)=>{
    try {
        const {id:device_id} = req.params;
        const {min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality,
            tank_name,
            } = req.body;
            const tank = await Tank.findOne({where:{device_id}});
        if(!tank){
            return res.status(400).json({message:'데이터를 가져오지 못했습니다.'})
        }
        await tank.update({
            min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality,
            tank_name
        })
        updateTankcache({
            device_id,
            min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality
        })
        return res.sendStatus(204)
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:error.message || '서버에 오류가 발생하였습니다.'});
    }
})

//IOT 센서 데이터 보냄
router.post('/Sensor',async(req,res)=>{
    try {
        const {device_id='SS501',temperature,water_quality} = req.body;
        if(temperature == null || water_quality == null){
            return res.status(400).json({message:'데이터 전달에 실패하였습니다.'})
        }

        const tank = await Tank.findOne({where:{device_id:device_id||'TEST'}})
        if(!tank){
            return res.status(400).json({message:'저장한 어항이 없습니다.'})
        }//원래 tank_id를 보내지 못하면 해당 if문이 발생하여 오류 전달 지금은 test아이디인 SS501을 사용 중
        const senseData = updateSensor(device_id,temperature,water_quality);
        sendToUser(device_id,senseData);
        const command = commandState.get(device_id);
        return res.status(200).json({
            command: command ?? null
        }); 
    } catch (error) {
        console.error(error);
        return res.status(error.status||500).json({message:error.message||'서버에 에러가 발생하였습니다.'})
    }

    
})

router.get('/logdata',authMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        const tank = await Tank.findOne({where:{user_id}});
        const today =new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate()+1);
        const [FeedData,waterChange]  = await Promise.all([
            Feederlog.findOne({where:{device_id:tank.device_id,feed_time:{[Op.gte]:today,[Op.lt]:tomorrow}}}),
            Waterchangelog.findOne({where:{device_id:tank.device_id,end_at:{
                [Op.gte] : today,
                [Op.lt]: tomorrow
            }}})
        ])

        const feed = FeedData?.status === true;
        const waterchange = waterChange?.status === true;

        
        return res.json({feed,waterchange});   
    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'에러 메세지가 발생하였습니다.'})
    }
})

//실시간 수온/수질 데이터 받기
router.get('/data',authMiddleware,async (req,res) => {
    try {
        const {user_id} = req.user;
        const tank = await Tank.findOne({where:{
            user_id
        }})
        if(!tank){
            return res.status(400).json({message:'저장한 기기를 발견하지 못했습니다.'})
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.flushHeaders();
        addClients(tank.device_id,res);

        req.on('close',()=>{
            removeCLients(tank.device_id,res);
        })
    } catch (error) {
        console.error(error.message)
        return res.status(error.status||500).json({message:error.message||'서버에 오류가 발생하였습니다.'});
    }
    
})



module.exports = router;